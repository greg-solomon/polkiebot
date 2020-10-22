import { Message } from "discord.js";
import { ServerType } from "../../database/serverSchema";
import { getUserFromMessage } from "../../lib/helpers";
import { prefix } from "../../config.json";
// Executes custom commands
export default async function executeCustomCommand(
  message: Message,
  command: string,
  args: string[],
  server: ServerType
) {
  try {
    const { customCommands } = server;
    const commandToRun = customCommands.filter(
      (com) => com.command.toLowerCase() === command
    )[0];

    if (!commandToRun)
      return message.reply(`I could not find the command you are looking for.`);

    if (commandToRun.template.includes("{mention}")) {
      const user = getUserFromMessage(message, args[0]);
      if (!user)
        return message.reply(
          `This command requires a user\n\`${prefix}${command} [user|id]\``
        );
      return message.channel.send(
        commandToRun.template.replace("{mention}", user?.toString())
      );
    } else {
      return message.channel.send(commandToRun.template);
    }
  } catch (err) {
    console.error(`[ERROR] executeCustomCommand : ${err.message}`);
  }
}
