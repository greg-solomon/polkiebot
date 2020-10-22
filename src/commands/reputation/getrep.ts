// returns the last 5 reputations

import { Message, GuildMember, MessageEmbed } from "discord.js";
import ProfileModel from "../../database/profileSchema";
import { channels } from "../../config.json";

// !rep [@user|id]?
export default async function getReputation(message: Message, args: string[]) {
  if (!message.guild) return;
  if (message.channel.id !== channels.reputationChannelId)
    return message.reply(`Please keep reps to the reputation channel`);
  const userToFind = message.mentions.users.first();
  let queriedMember: GuildMember | null;

  if (!userToFind) {
    queriedMember = message.guild.member(message.author.id);
  } else {
    queriedMember = message.guild.member(userToFind.id);
  }

  if (queriedMember === null)
    return message.reply(`I could not find the user.`);

  const allProfiles = await ProfileModel.find();

  const sorted = allProfiles.sort((a, b) => b.rep - a.rep);
  const profile = allProfiles.find(
    (prof) => prof.discordId === queriedMember?.id
  );

  if (!profile) return;
  const rank = sorted.findIndex((p) => p.rep === profile.rep);

  const { log } = profile;
  const repLog = log
    .filter((logItem) => logItem.type === "add" || logItem.type === "sub")
    .reverse();

  const lastFive: string[] = [];

  for (let i = 0; i < 5 && i < repLog.length; i++) {
    const { type, reason } = repLog[i];
    lastFive.push(`\`${type === "add" ? "+" : "-"} ${reason}\``);
  }

  // ! how many users are they tied with
  const tiedWith = allProfiles.filter((p) => p.rep === profile.rep).length - 1;

  let description = "";
  description += `**Reputation:**\n`;
  description += `Positive Rep: ${profile.rep}\n`;
  description += `Negative Rep: ${profile.subrep}\n`;
  description += `Rank \`${rank + 1}\` of \`${sorted.length}\``;

  if (tiedWith !== 0) {
    // they are tied
    description += `, tied with \`${tiedWith}\` other${
      tiedWith > 1 ? "s" : ""
    }\n`;
  }
  description += `\n**Recent Transactions**\n${lastFive.join("\n")}`;
  let color: string;
  if (profile.subrep >= 5) {
    color = "0xff0000";
  } else if (profile.subrep >= 1) {
    color = "0xffff00";
  } else {
    color = "0x00ff00";
  }

  const embed = new MessageEmbed();
  embed.setTitle(`${queriedMember.displayName} - ${queriedMember.user.tag}`);
  embed.setDescription(description);
  embed.setColor(color);

  return message.channel.send(embed);
}
