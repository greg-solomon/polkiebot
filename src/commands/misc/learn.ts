// !learn WOW Everyone loves {mention}. == !WOW @JM = Everyone loves @JM.
// !commands - displays all commands created from the above.
import { Message } from "discord.js";
import { ServerType } from "../../database/serverSchema";
import { checkIfAllowed } from "../../lib/helpers";
import { prefix, confirmEmoji } from "../../config.json";
import commandList from "../../lib/commandList";
// !forget WOW
export default async function learnCommand(
  message: Message,
  args: string[],
  server: ServerType
) {
  if (!message.guild) return;
  try {
    const commandToAdd = args[0];
    const commandMessage = args.slice(1).join(" ");

    // check if command exists
    const commandCheck = server.customCommands.find(
      (c) => c.command === commandToAdd
    );

    const isAllowed = checkIfAllowed(message.author, message.guild, [
      "ADMINISTRATOR",
      "MANAGE_GUILD",
    ]);

    if (!isAllowed) return message.reply(`You are not allowed to do that!`);
    if (
      commandCheck ||
      commandList.find((command) => command.name === commandToAdd)
    ) {
      return message.reply(`There is already a command for ${commandToAdd}`);
    }
    server.customCommands.push({
      command: commandToAdd,
      template: commandMessage,
    });

    await server.save();

    message.reply(`Added command ${prefix}${commandToAdd}`);
    return await message.react(confirmEmoji);
  } catch (error) {
    console.error(`[ERROR] learnCommand : ${error.message}`);
  }
}
