import botCommands from './commands';
import { commandList, help } from './help';

describe('`.help`', () => {
  const commands = Object.keys(botCommands);
  describe('individual command helptext', () => {
    commands.forEach(command => {
      test(`\`.${command}\` command`, () => {
        expect(help(`.help ${command}`)).toBe(botCommands[command]);
      });
    });

    test('invalid command warns user', () => {
      expect(help('.help lorem ipsum')).toBe(
        '`lorem ipsum` is not a valid command!'
      );
    });
  });

  test('command list shows all available commands', () => {
    expect(commandList()).toBe(
      `Available commands:\n\`\`\`${commands.join('\n')}\`\`\`
    Type \`.help <command>\` for more information about a command!
    See more: https://github.com/emyarod/discorcabot/wiki/Commands
  `
    );
  });
});
