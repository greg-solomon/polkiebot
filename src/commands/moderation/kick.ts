import { Message, MessageEmbed, TextChannel } from "discord.js";
import { findOrCreateProfile } from "../../database/functions";
import { getModLogChannel, getUserFromMessage } from "../../lib/helpers";
import { confirmEmoji, roles, staffCategoryId } from "../../config.json";
// kicks user from server
export default async function kickCommand(message: Message, args: string[]) {
  try {
    if (!message.guild) return;
    const modChannel = getModLogChannel(message.guild);
    const user = getUserFromMessage(message, args[0]);
    const reason = args.slice(1, args.length).join(" ");
    let profile;

    // CHECK IF MESSAGE IS SENT IN CHANNEL UNDER STAFF CATEGORY
    const { channel } = message;
    const sentChannel = channel as TextChannel;
    if (sentChannel.parentID !== staffCategoryId) return;

    if (!user) return message.reply(`I could not find that user`);
    const hasRole = message.member?.roles.cache.find(
      (role) => role.id === roles.helperRoleId || role.id === roles.helperRoleId
    );

    if (!hasRole && !message.member?.hasPermission("KICK_MEMBERS"))
      return message.reply(`You are not allowed to do this`);

    const senderHighestRole = message.member?.roles.highest.position || 0;
    const toBanHighestRole =
      message.guild.member(user.id)?.roles.highest.position || 0;

    if (senderHighestRole <= toBanHighestRole)
      return message.reply(
        `You can not kick members that have the same or higher roles as you`
      );
    if (user === message.author)
      return message.reply(`You can't kick yourself`);
    if (!reason)
      return message.reply(`You need to enter a reason for the kick`);
    // if the user doesn't mention them, they use the ID
    const guildMember = message.guild?.member(user.id);
    profile = await findOrCreateProfile(guildMember?.id);

    if (!guildMember) return;
    if (!guildMember.kickable) return message.reply(`You can't kick this user`);

    if (profile) {
      profile.log.push({ type: "kick", reason, user: message.author.id });
      await profile.save();
      await guildMember.kick(reason);

      // ! log to mod channel
      modChannel?.send(
        new MessageEmbed({
          title: `Kicked User - ${guildMember.user.username}`,
          description: `**Reason**: \`${reason}\`\n\n**Banned by**: ${message.author.username}`,
          color: `0xff0000`,
        })
      );
      return message.react(confirmEmoji);
    }
  } catch (err) {
    console.error(`[ERROR] kickCommand : ${err.message}`);
  }
}
