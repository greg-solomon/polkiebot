import { Message, TextChannel } from "discord.js";
import { checkIfAllowed } from "../../lib/helpers";

// !purge [n]
export default async function purgeMessages(message: Message, args: string[]) {
  if (!message.guild) return;
  try {
    const channel = message.channel as TextChannel;
    const isAllowed = checkIfAllowed(message.author, message.guild, [
      "ADMINISTRATOR",
      "MANAGE_MESSAGES",
    ]);

    if (!args.length)
      return message.reply(
        `You need to specify a number of messages\nUsage: \`!purge [n]\``
      );

    if (!isAllowed) return message.reply(`You are not allowed to do that.`);

    const n = Number.parseInt(args[0]);

    if (!n) return message.reply(`You specified an invalid number`);

    const messages = await channel.messages.fetch({ limit: n });
    const notPinned = messages.filter((m) => !m.pinned);

    if (!messages) return;

    return await channel.bulkDelete(notPinned);
  } catch (err) {
    console.error(`[ERROR] purgeMessages ${err.message}`);
  }
}
