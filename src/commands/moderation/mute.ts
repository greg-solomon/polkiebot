import { Message, GuildMember, User, MessageEmbed } from "discord.js";
import { findOrCreateProfile } from "../../database/functions";
import {
  getUserFromMessage,
  checkIfAllowed,
  getModLogChannel,
  getTextChannel,
} from "../../lib/helpers";
import { roles, confirmEmoji, channels } from "../../config.json";
// !mute [@user|id] [reason]
export default async function muteCommand(message: Message, args: string[]) {
  try {
    if (!message.guild) return;

    if (!args.length)
      return message.reply(`Usage: \`!mute [@user|id] [reason]\``);
    const user = getUserFromMessage(message, args[0]);
    let [_, ...reasonParts] = args;

    if (!user) return message.reply(`You haven't specified a user to mute`);

    let reason = reasonParts.join(" ");

    if (!reasonParts.length) reason = "No reason";
    // helpers and mods can mute users

    const hasRole = message.member?.roles.cache.find(
      (role) => role.id === roles.helperRoleId || role.id === roles.modRoleId
    );
    if (!hasRole && !message.member?.hasPermission("MUTE_MEMBERS"))
      return message.reply(`You are not allowed to do this`);

    const senderHighestRole = message.member?.roles.highest.position || 0;
    const toBanHighestRole =
      message.guild.member(user.id)?.roles.highest.position || 0;

    if (senderHighestRole <= toBanHighestRole)
      return message.reply(
        `You can not mute members that have the same or higher roles as you`
      );
    const member = message.guild?.member(user.id);

    if (!member) return message.reply(`I could not find that user`);

    await muteUser(member, message.author, reason);
    return message.react(confirmEmoji);
  } catch (err) {
    console.error(`[ERROR] muteCommand : ${err.message}`);
  }
}

async function muteUser(member: GuildMember, banner: User, reason: string) {
  // add role
  member.roles.add(roles.muteRoleId);
  member.voice.serverMute = true;
  // await member.voice.setMute(true);
  // send them message
  const muteAppealChannel = getTextChannel(
    member.guild,
    channels.muteAppealsChannelId
  );

  const description = `You have been muted: \`${reason}\`\nPlease visit the ${muteAppealChannel?.toString()} channel if you need more information.`;
  const embed = new MessageEmbed({
    title: `Muted`,
    color: `0xff0000`,
    description,
  });

  member.send(embed);

  const profile = await findOrCreateProfile(member.id);
  if (profile) {
    profile.log.push({
      type: "mute",
      user: banner.id,
      reason,
    });
    await profile.save();
  }

  const modChannel = getModLogChannel(member.guild);

  return modChannel?.send(
    new MessageEmbed({
      title: `${member.displayName} has been muted`,
      description: `**Reason**: \`${reason}\`\n`,
      color: `0xff0000`,
    })
  );
}
