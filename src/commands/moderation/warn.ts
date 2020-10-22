import { Message, MessageEmbed } from "discord.js";
import { confirmEmoji, roles } from "../../config.json";
import { findOrCreateProfile } from "../../database/functions";
import {
  getUserFromMessage,
  getModLogChannel,
  checkIfAllowed,
} from "../../lib/helpers";
// sends warning to user
export default async function warnCommand(message: Message, args: string[]) {
  try {
    if (!message.guild) return;
    const culprit = getUserFromMessage(message, args[0]);
    const modChannel = getModLogChannel(message.guild);
    const warner = message.guild?.member(message.author.id);
    const reason = args.slice(1).join(" ");
    if (!culprit) return message.reply(`I could not find that user`);
    if (!warner || !modChannel) return;
    // ! CHECK IF THEY ARE MOD OR ADMIN

    const hasRole = warner.roles.cache.find(
      (role) => role.id === roles.modRoleId || role.id === roles.helperRoleId
    );

    if (!hasRole && !warner.hasPermission("ADMINISTRATOR"))
      return message.reply(`You are not allowed to do this`);

    const senderHighestRole = message.member?.roles.highest.position || 0;
    const toBanHighestRole =
      message.guild.member(culprit.id)?.roles.highest.position || 0;

    if (senderHighestRole <= toBanHighestRole)
      return message.reply(
        `You can not warn members that have the same or higher roles as you`
      );
    // ! MAKE SURE WE HAVE USER AND REASON
    if (!reason) message.reply(`You need to specify a reason`);

    // ! SEND WARNING
    culprit.send(
      new MessageEmbed({
        title: `WARNING`,
        description: `**Reason**: \`${reason}\`\n\nWarned by \`${warner.displayName}\``,
        color: `0xff0000`,
      })
    );

    // ! LOG WARNING
    const profile = await findOrCreateProfile(culprit.id);

    if (profile) {
      profile.log.push({ type: "warn", reason, user: message.author.id });
      await profile.save();
    }

    // ! Log to mod channel
    modChannel.send(
      new MessageEmbed({
        title: `Warning Issued to ${culprit.username}`,
        description: `**Reason**: \`${reason}\`\n\n Warned by ${warner.displayName}`,
        color: `0xff0000`,
      })
    );
    return message.react(confirmEmoji);
  } catch (err) {
    console.error(`[ERROR] : warnCommand : ${err.message}`);
  }
}
