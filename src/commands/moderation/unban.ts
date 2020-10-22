import { Message, MessageEmbed } from "discord.js";
import { findOrCreateProfile } from "../../database/functions";
import { getModLogChannel, checkIfAllowed } from "../../lib/helpers";
import { confirmEmoji } from "../../config.json";
// !unban [id] [reason]
export default async function unBanCommand(message: Message, args: string[]) {
  try {
    if (!message.guild) return;
    const modChannel = getModLogChannel(message.guild);
    const profile = await findOrCreateProfile(args[0]);
    const reason = args.slice(1).join(" ");

    const isAllowed = checkIfAllowed(message.author, message.guild, [
      "ADMINISTRATOR",
      "BAN_MEMBERS",
    ]);
    // ! CHECK THAT USER HAS MOD ROLE OR ADMIN
    if (!isAllowed) {
      return message.reply(`You're not allowed to do that`);
    }

    if (profile) {
      // ! LOG UNBAN
      profile.log.push({
        type: "unban",
        reason: reason ? reason : `Unbanned by ${message.author.username}`,
        user: message.author.id,
      });
      await profile.save();
      await message.guild?.members.unban(args[0]);
      if (modChannel) {
        // ! LOG TO APPROPRIATE MOD CHANNEL
        const embed = new MessageEmbed({
          title: `Unban - ${args[0]}`,
          description: `**Reason**:\n\n \`${
            reason ? reason : `Unbanned by ${message.author.username}`
          }\``,
          color: `0xff0000`,
        });
        modChannel.send(embed);
        return message.react(confirmEmoji);
      }
    }
  } catch (err) {
    console.error(`[ERROR] unbanCommand : ${err.message}`);
  }
}
