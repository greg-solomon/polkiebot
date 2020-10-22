import { Message } from "discord.js";
import { checkIfAllowed, getRole } from "../../lib/helpers";
import { confirmEmoji, roles } from "../../config.json";
import { ServerType } from "../../database/serverSchema";

// !help [info]- {mention} needs help with [info]! Come quickly @helpers.
async function pingHelp(message: Message, args: string[]) {
  if (!message.guild) return;

  if (!args.length)
    return message.reply(`You need to specify some info!\n\`!mm [info]\``);
  const info = args.join(" ");

  const roleToPing = await getRole(message.guild, roles.helperRoleId);
  if (!roleToPing) return message.reply(`I could not find the Helper role`);

  message.channel.send(
    `${roleToPing.toString()}\n${message.author.toString()} needs help with \`${info}\`\n Come quickly helpers`
  );

  return message.react(confirmEmoji);
}

async function togglePingHelp(
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

    server.helpEnabled = !server.helpEnabled;

    await server.save();

    message.reply(`Help has been turned ${server.helpEnabled ? "on" : "off"}`);

    return await message.react(confirmEmoji);
  } catch (err) {
    console.error(err.message);
  }
}

export default { pingHelp, togglePingHelp };
