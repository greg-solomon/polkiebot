import { Message, MessageEmbed } from "discord.js";
import { findOrCreateProfile } from "../../database/functions";
import {
  getUserFromMessage,
  getModLogChannel,
  checkIfAllowed,
} from "../../lib/helpers";
import { confirmEmoji } from "../../config.json";
// !ban [@user|id] [reason]
export default async function banCommand(message: Message, args: string[]) {
  try {
    if (!message.guild) return;
    const user = getUserFromMessage(message, args[0]);
    const reason = args.slice(1, args.length).join(" ");
    const modChannel = getModLogChannel(message.guild);

    if (!user)
      return message.reply(`I could not find the user you wish to ban.`);
    // ! check that author is mod
    const isAllowed = checkIfAllowed(message.author, message.guild, [
      "ADMINISTRATOR",
      "BAN_MEMBERS",
    ]);
    if (!isAllowed) return message.reply(`You can't ban users.`);

    // compare if member to ban has higher roles than the person banner
    const senderHighestRole = message.member?.roles.highest.position || 0;
    const toBanHighestRole =
      message.guild.member(user.id)?.roles.highest.position || 0;

    if (senderHighestRole <= toBanHighestRole)
      return message.reply(
        `You can not ban members that have the same or higher roles as you`
      );
    if (!user) return message.reply(`I could not find that user`);
    // ! check that reason is provided and that user isn't mentioning themselves
    if (user === message.author) return message.reply(`You can't ban yourself`);
    if (!reason) return message.reply(`You need to enter a reason for the ban`);

    // ! resolve the GuildMember to ban
    const guildMember = message.guild?.member(user.id);

    // ! check that they are bannable
    if (!guildMember?.bannable) {
      return message.reply(`You can't ban this user`);
    }

    const profile = await findOrCreateProfile(guildMember.id);

    if (profile && modChannel) {
      // ! LOG BAN IN DB AND BAN FROM GUILD
      profile.log.push({ type: `ban`, reason, user: message.author.id });
      await profile.save();

      await guildMember.ban({ reason });

      // ! LOG TO MOD CHANNEL
      const embed = new MessageEmbed({
        title: `Banned User`,
        description: `${guildMember.displayName} has been banned\n\nUser ID: \`${guildMember.id}\`\n\n**Reason**:\n \`${reason}\``,
        color: `0xff0000`,
      });
      modChannel.send(embed);

      return message.react(confirmEmoji);
    }
  } catch (err) {
    console.error(`[ERROR] banCommand : ${err.message}`);
  }
}
