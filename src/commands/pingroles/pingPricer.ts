import { Message } from "discord.js";
import { ServerType } from "../../database/serverSchema";
import { getTextChannel, getRole, checkIfAllowed } from "../../lib/helpers";
import { channels, roles, confirmEmoji } from "../../config.json";

// !price [item] - Price request! {mention} wants to know the price of [item] on Nintendo Switch! @pricer roles
async function pingPricer(
  message: Message,
  args: string[],
  ping: boolean,
  server: ServerType
) {
  if (!message.guild) return;

  const priceChannel = getTextChannel(
    message.guild,
    channels.pricingChatChannelId
  );
  if (message.channel.id !== channels.pricingChatChannelId)
    return message.reply(
      `This command can not be used here! Please use ${priceChannel?.toString()}`
    );

  const { priceHelpEnabled } = server;
  if (!priceHelpEnabled)
    return message.reply(`Price help is not available at the moment.`);

  if (args.includes("@everyone")) {
    const labAlpha = message.guild.roles.resolve(roles.labMonitorRoleId);
    return message.reply(
      `Yikes ${message.author.toString()}, come check this out ${labAlpha?.toString()}`
    );
  }

  if (!args.length)
    return message.reply(`You need to specify an item!\n\`!price [item]\``);
  const item = args.join(" ");

  if (!priceChannel)
    return message.reply(`I could not find the pricing channel`);

  const pricerRole = await getRole(message.guild, roles.pricerRoleId);
  const pricerTrainerRole = await getRole(
    message.guild,
    roles.pricerTrainerRoleId
  );

  if (!pricerRole || !pricerTrainerRole)
    return message.reply(`I could not find the pricer role`);

  const sendStr = ping
    ? `**Price request!** ${message.author.toString()} wants to know the price of **${item}** on Nintendo Switch! ${pricerRole.toString()} ${pricerTrainerRole.toString()}`
    : `**Price request!**\n${message.author.toString()} wants to know the price of **${item}** on Nintendo Switch!`;
  priceChannel.send(sendStr);

  return await message.delete();
}

// !toggleprice - turn off ping pricer
async function togglePricerPing(
  message: Message,
  args: string[],
  server: ServerType
) {
  try {
    // can pricers toggle pricing? or only moderators
    if (!message.guild) return;
    const priceChannel = getTextChannel(
      message.guild,
      channels.pricingChatChannelId
    );

    const isAllowed = checkIfAllowed(message.author, message.guild, [
      "ADMINISTRATOR",
    ]);

    if (!isAllowed) return message.reply(`You are not allowed to do that`);
    if (message.channel.id !== channels.pricingChatChannelId)
      return message.reply(
        `This command can not be used here! Please use ${priceChannel?.toString()}`
      );

    server.priceHelpEnabled = !server.priceHelpEnabled;

    await server.save();

    message.reply(
      `Price help has been turned ${server.priceHelpEnabled ? "on" : "off"}`
    );

    return await message.react(confirmEmoji);
  } catch (err) {
    console.error(err.message);
  }
}

export default { pingPricer, togglePricerPing };
