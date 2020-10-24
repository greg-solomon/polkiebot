import { Message, MessageEmbed } from "discord.js";
import { getTextChannel, getRole } from "../../lib/helpers";
import { LocationCode } from "../../lib/types";
import { channels, locationRoles } from "../../config.json";
// !lfg [region] [info]
async function pingLFG(message: Message, args: string[]) {
  if (!message.guild) return;
  const lfgChannel = getTextChannel(message.guild, channels.lfgChannelId);
  if (message.channel.id !== channels.lfgChannelId)
    return message.reply(
      `This command can not be used here! Please use ${lfgChannel?.toString()}`
    );
  const region = args[0].toLowerCase();
  const info = args.slice(1).join(" ");

  const regions = Object.keys(locationRoles);

  if (!lfgChannel) return message.reply(`I can't find the lfg channel`);

  if (!regions.includes(region.toLowerCase()))
    return message.reply(
      `You entered an invalid region. See the pinned messages for the regions or use the !regions command`
    );

  const key = regions.find((r) => r === region) as LocationCode;
  if (!key) return;

  let role = message.mentions.roles.first();
  if (!role) {
    role = await getRole(message.guild, locationRoles[key].roleId);
  }

  if (!role) return message.reply(`Could not find the region`);
  lfgChannel.send(
    `${message.author.toString()} wants to play! ${role.toString()}\n${
      info !== "" ? `\`${info}\`` : ""
    }`
  );
}

async function showRegions(message: Message, args: string[]) {
  try {
    if (!message.guild) return;
    const lfgChannel = getTextChannel(message.guild, channels.lfgChannelId);
    if (message.channel.id !== channels.lfgChannelId)
      return message.reply(
        `This command can not be used here! Please use ${lfgChannel?.toString()}`
      );

    const embed = await getRegionEmbed();
    if (!embed) return message.reply(`I could not get the regions`);
    return message.channel.send(embed);
  } catch (err) {
    console.error(err.message);
  }
}

async function getRegionEmbed() {
  try {
    let descStr = "";
    for (const key of Object.keys(locationRoles) as LocationCode[]) {
      descStr += `**${key.toUpperCase()}** - ${locationRoles[key].text}\n`;
    }
    return new MessageEmbed({
      title: `Available Regions`,
      description: descStr,
      color: "0xff0000",
    });
  } catch (err) {
    console.error(err.message);
  }
}

export default { showRegions, pingLFG };
