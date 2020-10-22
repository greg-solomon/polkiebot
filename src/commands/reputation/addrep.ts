import { Guild, GuildMember, Message, MessageEmbed } from "discord.js";
import { findOrCreateProfile } from "../../database/functions";
import { getRepLogChannel, getUserFromMessage } from "../../lib/helpers";
import { verifyReasonLength } from "./functions";
import { channels, confirmEmoji, repRoles } from "../../config.json";
import { ProfileType } from "../../database/profileSchema";
import { ReputationRoleKey } from "../../lib/types";

// !addrep [@user|id] [reason]
export default async function addReputation(message: Message, args: string[]) {
  if (!message.guild) return;
  if (message.channel.id !== channels.reputationChannelId)
    return message.reply(`Please keep reps to the reputation channel`);
  const repLogsChannel = getRepLogChannel(message.guild);
  try {
    const userToFind = getUserFromMessage(message, args[0]);

    if (userToFind?.id === message.author.id)
      return message.reply(`You can't rep yourself`);

    if (!userToFind) return message.reply(`I couldn't find that user`);
    const members = message.guild?.members.cache.array();
    const queriedMember = members?.find((m) => m.id === userToFind?.id);

    const reason = args.slice(1).join(" ");

    if (!verifyReasonLength(reason)) {
      message.reply(`Reasons should not exceed 250 characters in length`);
      return;
    }

    if (queriedMember) {
      const profile = await findOrCreateProfile(queriedMember.id);

      if (profile) {
        profile.rep++;
        profile.log.push({ user: message.author.id, type: "add", reason });
        await profile.save();

        await changeMerchantRole(profile, message.guild);

        const embed = new MessageEmbed({
          title: `${message.author.tag} gave ${queriedMember.user.tag} rep!`,
          description: `**Reason**: ${reason}`,
          color: "0xff0000",
        });

        await message.react(confirmEmoji);
        return repLogsChannel?.send(embed);
      }
    }
  } catch (error) {
    console.error(error.message);
  }
}

async function changeMerchantRole(profile: ProfileType, guild: Guild) {
  const member = guild.member(profile.discordId);
  if (!member) return;
  if (profile.rep >= 130) {
    await removeMerchantRoles(member);
    await member.roles.add(repRoles.merchantSix);
  } else if (profile.rep >= 100) {
    await removeMerchantRoles(member);
    await member.roles.add(repRoles.merchantFive);
  } else if (profile.rep >= 75) {
    await removeMerchantRoles(member);
    await member.roles.add(repRoles.merchantFour);
  } else if (profile.rep >= 50) {
    await removeMerchantRoles(member);
    await member.roles.add(repRoles.merchantThree);
  } else if (profile.rep >= 25) {
    await removeMerchantRoles(member);
    await member.roles.add(repRoles.merchantTwo);
  } else if (profile.rep >= 10) {
    await removeMerchantRoles(member);
    await member.roles.add(repRoles.merchantOne);
  }
}

async function removeMerchantRoles(member: GuildMember) {
  try {
    const keys = Object.keys(repRoles) as ReputationRoleKey[];
    for (const roleKey of keys) {
      if (
        member.roles.cache.array().find((role) => role.id === repRoles[roleKey])
      ) {
        await member.roles.remove(repRoles[roleKey]);
      }
    }
  } catch (err) {
    console.error(err.message);
  }
}
