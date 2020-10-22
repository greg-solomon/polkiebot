import { Message, MessageEmbed } from "discord.js";
import { findOrCreateProfile } from "../../database/functions";
import {
  getModLogChannel,
  getUserFromMessage,
  checkIfAllowed,
} from "../../lib/helpers";
import { confirmEmoji, roles } from "../../config.json";

// !mute [@user|id] [reason?]
export default async function unmuteCommand(message: Message, args: string[]) {
  // get mod channel, user, and profile
  if (!message.guild) return;
  try {
    const modChannel = getModLogChannel(message.guild);

    const user = getUserFromMessage(message, args[0]);
    const reason = args.slice(1).join(" ");

    if (!user) return message.reply(`I could not find that user`);

    const userMember = message.guild?.member(user.id);

    const hasRole = message.member?.roles.cache.find(
      (role) => role.id === roles.helperRoleId || role.id === roles.helperRoleId
    );

    if (!hasRole && !message.member?.hasPermission("MUTE_MEMBERS"))
      return message.reply(`You are not allowed to do that.`);

    const profile = await findOrCreateProfile(user.id);

    if (profile && modChannel && userMember) {
      profile.log.push({
        type: "unmute",
        reason: reason ? reason : "No reason",
        user: message.author.id,
      });

      await profile.save();

      userMember.roles.remove(roles.muteRoleId);
      userMember.voice.serverMute = false;

      modChannel.send(
        new MessageEmbed({
          title: `${user.username} has been unmuted`,
          description: `${message.author.toString()} unmuted them`,
          color: "0xff0000",
        })
      );

      return message.react(confirmEmoji);
    }
  } catch (err) {
    console.error(`[ERROR] unmuteCommand : ${err.message}`);
  }
}
