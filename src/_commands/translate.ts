import { Message, MessageAttachment } from 'discord.js';
import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';
import { create } from 'xmlbuilder2';
import {
  msCognitiveSpeechTTSSubscriptionKey,
  msTranslatorSubscriptionKey,
  defaultTranslationOutputLanguage,
} from '../../cfg/opendoors';
import { URLSearchParams } from 'url';

if (!msCognitiveSpeechTTSSubscriptionKey) {
  throw new Error(
    'Environment variable for your Azure subscription key for Cognitive Speech TTS is not set!'
  );
}

if (!msTranslatorSubscriptionKey) {
  throw new Error(
    'Environment variable for your Azure subscription key for Translator Text is not set!'
  );
}

if (!defaultTranslationOutputLanguage) {
  throw new Error(
    'Environment variable for your default Translator output language is not set!'
  );
}

async function fetchLanguages() {
  return fetch(
    'https://api.cognitive.microsofttranslator.com/languages?api-version=3.0&scope=translation'
  )
    .then(res => res.json())
    .then(({ translation }) => translation);
}

async function fetchVoices(subscriptionKey: string) {
  return fetch(
    'https://westus.tts.speech.microsoft.com/cognitiveservices/voices/list',
    {
      method: 'GET',
      headers: {
        'Ocp-Apim-Subscription-Key': subscriptionKey,
      },
    }
  )
    .then(res => res.json())
    .then(data =>
      data.reduce(
        (
          voicesObj: object,
          {
            Locale,
            ShortName: shortName,
          }: { Locale: string; ShortName: string }
        ) => {
          const [languageCode] = Locale.split('-');
          voicesObj[languageCode] = voicesObj[languageCode]
            ? voicesObj[languageCode].concat(shortName)
            : [shortName];

          return voicesObj;
        },
        {}
      )
    );
}

function getTTSAccessToken(subscriptionKey: string) {
  return fetch(
    'https://westus.api.cognitive.microsoft.com/sts/v1.0/issuetoken',
    {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': subscriptionKey,
      },
    }
  )
    .then(res => res.text())
    .catch(console.error);
}

// TODO: replace with top level await when it is released
let languages = {};
let voices: object | object[];
let TTSAccessToken: string = '';
(async () => {
  languages = await fetchLanguages();
  voices = await fetchVoices(msCognitiveSpeechTTSSubscriptionKey);
  TTSAccessToken =
    (await getTTSAccessToken(msCognitiveSpeechTTSSubscriptionKey)) || '';
})();

function translate({
  from,
  to,
  text,
}: {
  from?: string;
  to: string;
  text: string;
}) {
  const qs = new URLSearchParams({
    'api-version': '3.0',
    ...(from && { from }), // optionally spread input language code
    to,
  });
  return fetch(
    `https://api.cognitive.microsofttranslator.com/translate?${qs}`,
    {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': msTranslatorSubscriptionKey,
        'Content-type': 'application/json',
        'X-ClientTraceId': uuidv4().toString(),
      },
      body: JSON.stringify([{ text }]),
    }
  )
    .then(res => res.json())
    .then(data => data[0])
    .catch(console.error);
}

async function textToSpeech({
  accessToken,
  languageCode,
  text,
}: {
  accessToken: string;
  languageCode: string;
  text: string;
}) {
  const voicesList = voices[languageCode];
  if (!voicesList) {
    return null;
  }
  // Create the SSML request.
  const xmlBody = create()
    .ele('speak')
    .att('version', '1.0')
    .att('xml:lang', 'en-us')
    .ele('voice')
    .att('xml:lang', 'en-us')
    // pick a random voice
    .att('name', voicesList[Math.floor(Math.random() * voicesList.length)])
    .txt(text)
    .end();
  // Convert the XML into a string to send in the TTS request.
  const body = xmlBody.toString();
  return fetch('https://westus.tts.speech.microsoft.com/cognitiveservices/v1', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'cache-control': 'no-cache',
      'User-Agent': 'DISCORCABOT',
      'X-Microsoft-OutputFormat': 'audio-24khz-160kbitrate-mono-mp3',
      'Content-Type': 'application/ssml+xml',
    },
    body,
  }).then(res => {
    if (!res.ok) {
      throw new Error(res.statusText);
    }
    return res.buffer();
  });
}

export default {
  name: 'translate',
  description: `Translate text from one language to another`,
  aliases: ['tr'],
  usage: '[<input language>:<output language>] <text to translate>',
  cooldown: 3,
  execute: async (message: Message, args: string[]) => {
    if (!languages[defaultTranslationOutputLanguage]) {
      languages = await fetchLanguages();
    }
    if (!voices) {
      voices = await fetchVoices(msCognitiveSpeechTTSSubscriptionKey);
    }
    if (!TTSAccessToken) {
      TTSAccessToken =
        (await getTTSAccessToken(msCognitiveSpeechTTSSubscriptionKey)) || '';
    }
    try {
      const [from, to] = args[0]?.split(':') ?? [null, null];
      if (!from && !to) {
        return null;
      }
      if (to && from !== 'auto' && !languages[from]?.name) {
        return message.reply(
          'A valid translation input language code must be provided!'
        );
      }
      if (to && !languages[to]?.name) {
        return message.reply(
          'A valid translation output language code must be provided!'
        );
      }
      /**
       * if `to` is falsy, auto translate all args
       * otherwise, shift args once, then translate based on `from` and `to`
       */
      if (to) {
        args.shift();
      }
      const translatorOutput = await translate({
        from: !to || from === 'auto' ? null : from,
        to: !to ? defaultTranslationOutputLanguage : to,
        text: args.join(' '),
      });
      const translatedText = translatorOutput.translations[0].text;
      const inputLanguage =
        languages[translatorOutput?.detectedLanguage?.language || from].name;
      const outputLanguage =
        languages[to || defaultTranslationOutputLanguage].name;
      const audioBuffer = await textToSpeech({
        accessToken: TTSAccessToken,
        languageCode: to || defaultTranslationOutputLanguage,
        text: translatedText,
      });
      const messageText = `${inputLanguage} to ${outputLanguage} translation: ${translatedText}`;
      const filename = `${translatedText.split(' ').join('_')}.wav`;
      const attachment = new MessageAttachment(audioBuffer, filename);
      return message.channel.send(messageText, attachment);
    } catch (error) {
      console.error(error, 'There was an error with your translation!');
      return message.reply('There was an error with your translation!');
    }
  },
};
