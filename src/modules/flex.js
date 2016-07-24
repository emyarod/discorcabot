export function flex(orcabot, message) {
  if (message.content.indexOf('flex') > -1) {
    orcabot.reply(message, 'ＮＯ  ＦＬＥＸ  ＺＯＮＥ  ༼ᕗຈ ل͜ຈ༽ᕗ ᕙ( ͡° ͜ʖ ͡°)ᕗ༼ᕗຈ ل͜ຈ༽ᕗ  ＮＯ  ＦＬＥＸ  ＺＯＮＥ');
  }

  // good shit pasta
  if (message.content.indexOf('good shit') > -1) {
    orcabot.reply(message, '👌👀👌👀👌👀👌👀👌👀 good shit go౦ԁ sHit👌 thats ✔ some good👌👌shit right👌👌there👌👌👌 right✔there ✔✔if i do ƽaү so my self 💯 i say so 💯 thats what im talking about right there right there (chorus: ʳᶦᵍʰᵗ ᵗʰᵉʳᵉ) mMMMMᎷМ💯 👌👌 👌НO0ОଠOOOOOОଠଠOoooᵒᵒᵒᵒᵒᵒᵒᵒᵒ👌 👌👌 👌 💯 👌 👀 👀 👀 👌👌Good shit');
  }

  // nick young
  if (message.content.indexOf('nick young') || message.content.indexOf('nickyoung') > -1) {
    orcabot.sendFile(message, 'http://i.imgur.com/sQ3brdn.jpg', 'confusedblackmanquestionmarks.jpg', (error) => {
      console.log(`nickyoung ${error}`);
    });
  }

  // hotline bling
  if (message.content === 'swerve') {
    orcabot.sendFile(message, 'http://i.imgur.com/kfuKeNq.jpg', 'nothx.jpg', (error) => {
      console.log(`drake ${error}`);
    });
  }
}
