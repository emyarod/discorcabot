# Translation module

The translation module runs a query through Microsoft Translator and outputs a translation in the user's language of choice.

## To use the translation module:

Arguments enclosed in angle brackets (**`< >`**) are **required**, while arguments enclosed in square brackets (**`[ ]`**) are optional. A bar (**`|`**) denotes a multiple choice argument. **Language codes** refer to Microsoft's list of supported languages, which can be found [here](https://msdn.microsoft.com/en-us/library/hh456380.aspx).

### Text translation

```
.tr <input language code>:<output language code> <text to translate>

.tr auto[:output language code] <text to translate>

.tr <text to translate>
```

Translates the input text into the output language of choice. If the output language is not specified, the translator defaults to English output.

If the input language is `auto`, the bot will automatically detect the language of the input text, then output the translated text in the language of the user's choice. Also provides a link to an mp3 audio stream of the translated text.

**Arguments:**

* `<input language code>` The language code of the text you wish to translate

* `<output language code>` The language code for the output after translation

* `<text to translate>` The text to be translated