import { Message, MessageEmbed } from "discord.js";
import { getModLogChannel, checkIfAllowed } from "../../lib/helpers";
import { confirmEmoji } from "../../config.json";
// !recallban [id]
export default async function recallBanCommand(
  message: Message,
  args: string[]
) {
  try {
    if (!message.guild) return;
    const bannedId = args[0];
    const bannedUser = await message.guild?.fetchBan(args[0]);

    const isAllowed = checkIfAllowed(message.author, message.guild, [
      "ADMINISTRATOR",
      "BAN_MEMBERS",
    ]);

    if (!isAllowed) return message.reply(`You are not allowed to do that.`);
    if (!bannedUser) {
      // ! this user isn't banned
      return message.channel.send(
        new MessageEmbed({
          title: `Failed to Recall Banned User`,
          description: `This user isn't on the ban list`,
          color: `0xff0000`,
        })
      );
    }

    message.channel.send(
      new MessageEmbed({
        title: `Ban Report: ${bannedUser.user.username}`,
        description: `User ID: \`${bannedId}\`\n\n**Reason**: \`${bannedUser.reason}\`\n\n**Banned by** \`${message.author.username}\``,
        color: `0xff0000`,
      })
    );

    return message.react(confirmEmoji);
  } catch (err) {
    console.error(err.message);
  }
}
