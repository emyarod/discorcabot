export function greeting(orcabot, message) {
  if (message.content.indexOf('hi') > -1) {
    orcabot.reply(message, '(⊙ ◡ ⊙)');
  }
}