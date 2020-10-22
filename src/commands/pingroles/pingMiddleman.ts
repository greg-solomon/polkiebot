import { Message } from "discord.js";
import { ServerType } from "../../database/serverSchema";
import { getTextChannel, getRole, checkIfAllowed } from "../../lib/helpers";
import { channels, roles, confirmEmoji } from "../../config.json";

// !mm [info]- {mention} needs a middleman!
async function pingMiddleman(
  message: Message,
  args: string[],
  server: ServerType
) {
  if (!message.guild) return;
  const mmChannel = getTextChannel(
    message.guild,
    channels.middlemanCallChannelId
  );
  if (message.channel.id !== channels.middlemanCallChannelId)
    return message.reply(
      `This command can not be used here! Please use ${mmChannel?.toString()}`
    );

  const { middlemanHelpEnabled } = server;

  if (!middlemanHelpEnabled)
    return message.reply(`Middleman help is not enabled at the moment`);
  if (!args.length)
    return message.reply(`You need to specify some info!\n\`!mm [info]\``);
  const info = args.join(" ");

  if (!mmChannel)
    return message.reply(`I could not find the middleman-call channel`);

  const roleToPing = await getRole(message.guild, roles.middlemanRoleId);
  if (!roleToPing) return message.reply(`I could not find the Designer role`);

  mmChannel.send(
    `${roleToPing?.toString()}\n${message.author.toString()} needs a middleman!\n\`${info}\``
  );

  return message.react(confirmEmoji);
}

async function toggleMiddleManPing(
  message: Message,
  args: string[],
  server: ServerType
) {
  try {
    // can pricers toggle pricing? or only moderators
    if (!message.guild) return;
    const isAllowed = checkIfAllowed(message.author, message.guild, [
      "ADMINISTRATOR",
    ]);

    if (!isAllowed) return message.reply(`You are not allowed to do that`);

    const mmChannel = getTextChannel(
      message.guild,
      channels.middlemanCallChannelId
    );
    if (message.channel.id !== mmChannel?.id) {
      return message.reply(
        `This command can not be used here! Please use ${mmChannel?.toString()}`
      );
    }
    server.middlemanHelpEnabled = !server.middlemanHelpEnabled;

    await server.save();

    message.reply(
      `Middleman help has been turned ${
        server.middlemanHelpEnabled ? "on" : "off"
      }`
    );

    return await message.react(confirmEmoji);
  } catch (err) {
    console.error(err.message);
  }
}

export default { pingMiddleman, toggleMiddleManPing };
