import { Message } from "discord.js";
import { ServerType } from "../../database/serverSchema";
import { getTextChannel, getRole, checkIfAllowed } from "../../lib/helpers";
import { channels, roles, confirmEmoji } from "../../config.json";

// !pmr [info]- @Car Designer someone has a request! {mention} would like some design advice on [info].
async function pingDesigner(
  message: Message,
  args: string[],
  server: ServerType
) {
  if (!message.guild) return;
  const showcaseChannel = getTextChannel(
    message.guild,
    channels.showcaseChannelId
  );

  if (message.channel.id !== showcaseChannel?.id)
    return message.reply(
      `This command can not be used here! Please use ${showcaseChannel?.toString()}`
    );

  const { designerHelpEnabled } = server;

  if (!designerHelpEnabled)
    return message.reply(`Designer's aren't available at the moment`);
  if (!args.length)
    return message.reply(`You need to specify some info!\n\`!pmr [info]\``);
  const item = args.join(" ");

  if (!showcaseChannel)
    return message.reply(`I could not find the showcase channel`);

  const roleToPing = await getRole(message.guild, roles.designerRoleId);
  if (!roleToPing) return message.reply(`I could not find the Designer role`);

  showcaseChannel.send(
    `${roleToPing?.toString()} someone has a request!\n${message.author.toString()} would like some design advice on **${item}**`
  );

  return message.react(confirmEmoji);
}

async function toggleDesignerPing(
  message: Message,
  args: string[],
  server: ServerType
) {
  if (!message.guild) return;
  const showcaseChannel = getTextChannel(
    message.guild,
    channels.showcaseChannelId
  );

  const isAllowed = checkIfAllowed(message.author, message.guild, [
    "ADMINISTRATOR",
  ]);
  if (!isAllowed) return message.reply(`You are not allowed to do that`);
  if (message.channel.id !== showcaseChannel?.id) {
    return message.reply(
      `This command can not be used here! Please use ${showcaseChannel?.toString()}`
    );
  }
  try {
    // can pricers toggle pricing? or only moderators

    server.designerHelpEnabled = !server.designerHelpEnabled;

    await server.save();

    message.reply(
      `Designer help has been turned ${
        server.designerHelpEnabled ? "on" : "off"
      }`
    );

    return await message.react(confirmEmoji);
  } catch (err) {
    console.error(err.message);
  }
}

export default { toggleDesignerPing, pingDesigner };
