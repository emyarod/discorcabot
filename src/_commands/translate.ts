import { Message } from 'discord.js';
import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';
import {
  msTranslatorSubscriptionKey,
  defaultTranslationOutputLanguage,
} from '../../cfg/opendoors';
import { URLSearchParams } from 'url';

if (!msTranslatorSubscriptionKey) {
  throw new Error(
    'Environment variable for your Azure subscription key for Translator Text is not set!'
  );
}

const fetchLanguages = async () =>
  fetch(
    'https://api.cognitive.microsofttranslator.com/languages?api-version=3.0&scope=translation'
  )
    .then(res => res.json())
    .then(({ translation }) => translation);

let languages = fetchLanguages();
const translate = ({
  from,
  to,
  text,
}: {
  from?: string;
  to: string;
  text: string;
}) => {
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
};

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
      return message.channel.send(
        `${inputLanguage} to ${outputLanguage} translation: ${translatedText}`
      );
    } catch (error) {
      console.error(error, 'There was an error with your translation!');
      return message.reply('There was an error with your translation!');
    }
  },
};
