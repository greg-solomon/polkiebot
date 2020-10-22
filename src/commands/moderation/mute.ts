import { Message, GuildMember, User, MessageEmbed } from "discord.js";
import { findOrCreateProfile } from "../../database/functions";
import {
  getUserFromMessage,
  checkIfAllowed,
  getModLogChannel,
  getTextChannel,
} from "../../lib/helpers";
import times from "../../lib/times";
import { roles, confirmEmoji, channels } from "../../config.json";
import unmuteCommand from "./unmute";
// !mute [@user|id] [time[s|m|h|d]?] [reason]
export default async function muteCommand(message: Message, args: string[]) {
  try {
    if (!message.guild) return;

    if (!args.length)
      return message.reply(
        `Usage: \`!mute [@user|id] [time[s|m|h|d]?] [reason]\``
      );
    const user = getUserFromMessage(message, args[0]);
    let [time, ...reasonParts] = args.slice(1);

    let hasTime = true;
    if (!time.match(/[0-9]+[s|m|h|d]/gi)) {
      console.log(`Time does not match`);
      reasonParts.unshift(time);
      hasTime = false;
    }
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

    // await muteUser(member, message.author, reason);

    if (!hasTime) {
      await muteUser(member, message.author, reason);
      return message.react(confirmEmoji);
    }

    if (time.includes("s")) {
      // seconds
      const timeLength = Number.parseInt(time.split("s")[0]);
      if (!timeLength) return message.reply(`Could not parse time`);

      if (timeLength * times.SECOND >= Math.pow(2, 31) - 1)
        return message.reply(`That is too long`);

      await muteUser(member, message.author, reason, timeLength, "second", () =>
        setTimeout(() => {
          member.roles.remove(roles.muteRoleId);
          member.voice.serverMute = false;
        }, times.SECOND * timeLength)
      );
      return await message.react(confirmEmoji);
    } else if (time.includes("m")) {
      // minutes
      const timeLength = Number.parseInt(time.split("m")[0]);
      if (!timeLength) return message.reply(`Could not parse time`);

      if (timeLength * times.MINUTE >= Math.pow(2, 31) - 1)
        return message.reply(`That is too long`);

      await muteUser(member, message.author, reason, timeLength, "minute", () =>
        setTimeout(() => {
          member.roles.remove(roles.muteRoleId);
          member.voice.serverMute = false;
        }, times.MINUTE * timeLength)
      );
      return await message.react(confirmEmoji);
    } else if (time.includes("h")) {
      // hours
      const timeLength = Number.parseInt(time.split("h")[0]);
      if (!timeLength) return message.reply(`Could not parse time`);

      if (timeLength * times.HOUR >= Math.pow(2, 31) - 1)
        return message.reply(`That is too long`);

      await muteUser(member, message.author, reason, timeLength, "hour", () =>
        setTimeout(() => {
          member.roles.remove(roles.muteRoleId);
          member.voice.serverMute = false;
        }, times.HOUR * timeLength)
      );
      return await message.react(confirmEmoji);
    } else if (time.includes("d")) {
      // days
      const timeLength = Number.parseInt(time.split("d")[0]);
      if (!timeLength) return message.reply(`Could not parse time`);

      console.log(timeLength);
      console.log(times.DAY * timeLength);
      if (timeLength * times.DAY >= Math.pow(2, 31) - 1)
        return message.reply(`That is too long`);
      await muteUser(member, message.author, reason, timeLength, "day", () =>
        setTimeout(() => {
          member.roles.remove(roles.muteRoleId);
          member.voice.serverMute = false;
        }, times.DAY * timeLength)
      );
      return await message.react(confirmEmoji);
    }
  } catch (err) {
    console.error(`[ERROR] muteCommand : ${err.message}`);
  }
}

async function muteUser(
  member: GuildMember,
  banner: User,
  reason: string,
  timeLength?: number,
  timeUnit?: string,
  callback?: Function
) {
  // add role
  member.roles.add(roles.muteRoleId);
  member.voice.serverMute = true;

  const muteAppealChannel = getTextChannel(
    member.guild,
    channels.muteAppealsChannelId
  );

  let description = `You have been muted: \`${reason}\`\n${
    timeLength && `Your mute will expire in ${timeLength} ${timeUnit}(s)\n`
  }Please visit the ${muteAppealChannel?.toString()} channel if you need more information.`;
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

  modChannel?.send(
    new MessageEmbed({
      title: `${member.displayName} has been muted`,
      description: `**Reason**: \`${reason}\`\n`,
      color: `0xff0000`,
    })
  );
  if (callback) callback();
}
