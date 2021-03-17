export default function flex(orcabot, message) {
  if (message.content.indexOf('flex') > -1) {
    orcabot.reply(
      message,
      'ＮＯ  ＦＬＥＸ  ＺＯＮＥ  ༼ᕗຈ ل͜ຈ༽ᕗ ᕙ( ͡° ͜ʖ ͡°)ᕗ༼ᕗຈ ل͜ຈ༽ᕗ  ＮＯ  ＦＬＥＸ  ＺＯＮＥ'
    );
  }

  // good shit pasta
  if (message.content.indexOf('good shit') > -1) {
    orcabot.reply(
      message,
      '👌👀👌👀👌👀👌👀👌👀 good shit go౦ԁ sHit👌 thats ✔ some good👌👌shit right👌👌there👌👌👌 right✔there ✔✔if i do ƽaү so my self 💯 i say so 💯 thats what im talking about right there right there (chorus: ʳᶦᵍʰᵗ ᵗʰᵉʳᵉ) mMMMMᎷМ💯 👌👌 👌НO0ОଠOOOOOОଠଠOoooᵒᵒᵒᵒᵒᵒᵒᵒᵒ👌 👌👌 👌 💯 👌 👀 👀 👀 👌👌Good shit'
    );
  }

  // nick young
  if (
    message.content.indexOf('nick young') > -1 ||
    message.content.indexOf('nickyoung') > -1
  ) {
    orcabot.sendFile(
      message,
      'http://i.imgur.com/sQ3brdn.jpg',
      'confusedblackmanquestionmarks.jpg',
      null,
      error => {
        if (error) {
          console.log(`nickyoung ${error}`);
        }
      }
    );
  }

  // real nigga hours
  // TODO: auto message during real nigga hours
  if (message.content.indexOf('real nigga hours') > -1) {
    orcabot.reply(
      message,
      '🚨🚨🚨 WEE WOO WEE WOO WEE WOO 🚨🚨🚨 YOU ARE BEING DETAINED 👮🏻👮🏻👮🏻 FOR BEING AWAKE DURING REAL NIGGA HOURS 🕐👌🏻😏 PLEASE SHOW ME YOUR REAL NIGGA REGISTRATION 🙏🏻📝 BY SMASHING THE MOTHAFUCCIN LIKE BUTTON 🙊🙌🏼🔥🔥 REAL NIGGAS ONLY!! IT DONT MATTER IF YOU UP TRAPPING OR WHAT 💦💦😩😩'
    );
  }

  // hotline bling
  if (message.content.indexOf('swerve') > -1) {
    orcabot.sendFile(
      message,
      'http://i.imgur.com/kfuKeNq.jpg',
      'nothx.jpg',
      null,
      error => {
        if (error) {
          console.log(`drake ${error}`);
        }
      }
    );
  }

  // hotline teleport
  if (message.content.indexOf('sfv') > -1) {
    orcabot.sendFile(
      message,
      'https://i.imgur.com/WZf0W5a.jpg',
      'hotlineteleport.jpg',
      null,
      error => {
        if (error) {
          console.log(`kumer ${error}`);
        }
      }
    );
  }

  // what did it do
  if (message.content.indexOf('what did it do') > -1) {
    orcabot.sendFile(
      message,
      'https://i.imgur.com/5nMEvMk.png',
      'wdid.jpg',
      null,
      error => {
        if (error) {
          console.log(`what did it do ${error}`);
        }
      }
    );
  }

  // obama sweat
  if (message.content === 'obamasweat.jpg') {
    orcabot.sendFile(
      message,
      'http://i.imgur.com/pCfWMM8.jpg',
      'obamasweatwipe.jpg',
      null,
      error => {
        if (error) {
          console.log(`obama ${error}`);
        }
      }
    );
  }

  // glock
  if (message.content === 'glock') {
    orcabot.sendFile(
      message,
      'https://i.imgur.com/cKIsRuT.png',
      'glock.jpg',
      null,
      error => {
        if (error) {
          console.log(`glock ${error}`);
        }
      }
    );
  }

  // pac
  if (message.content === '2pac') {
    orcabot.sendFile(
      message,
      'https://i.imgur.com/uqsTzqi.png',
      'pac.jpg',
      null,
      error => {
        if (error) {
          console.log(`pac ${error}`);
        }
      }
    );
  }

  // pac
  if (message.content === '2pac 2pac 2pac 2 glocks') {
    orcabot.sendFile(
      message,
      'https://i.imgur.com/Vw64Adt.png',
      'torylanez.jpg',
      null,
      error => {
        if (error) {
          console.log(`2p2p2p2g ${error}`);
        }
      }
    );
  }
}
