import { Message } from "discord.js";
import { ServerType } from "../../database/serverSchema";
import { checkIfAllowed } from "../../lib/helpers";
import { confirmEmoji } from "../../config.json";
export default async function forgetCustomCommand(
  message: Message,
  args: string[],
  server: ServerType
) {
  if (!message.guild) return;
  try {
    const commandToForget = args[0];

    const isAllowed = checkIfAllowed(message.author, message.guild, [
      "ADMINISTRATOR",
      "MANAGE_GUILD",
    ]);

    if (!isAllowed) return message.reply(`You are not allowed to do that!`);
    if (!commandToForget) {
      return message.reply(
        `You forgot to specify the command to forget\n\`!forget [commandname]\``
      );
    }

    server.customCommands = server.customCommands.filter(
      (c) => c.command.toLowerCase() !== commandToForget
    );

    await server.save();
    message.channel.send(`${commandToForget} has been forgotten`);
    await message.react(confirmEmoji);
  } catch (error) {
    console.error(`[ERROR] forgetCustomCommand : ${error.message}`);
  }
}
