import { Message, MessageEmbed } from "discord.js";
import { findOrCreateProfile } from "../../database/functions";
import { getModLogChannel, checkIfAllowed } from "../../lib/helpers";
import { confirmEmoji } from "../../config.json";

// !recallkick [id]
export default async function recallKickCommand(
  message: Message,
  args: string[]
) {
  try {
    if (!message.guild) return;

    const profile = await findOrCreateProfile(args[0]);
    const isAllowed = checkIfAllowed(message.author, message.guild, [
      "ADMINISTRATOR",
      "KICK_MEMBERS",
    ]);

    if (!isAllowed) return message.reply(`You are not allowed to do that.`);
    if (profile) {
      const { log } = profile;
      const kicks = log.filter((logItem) => logItem.type === "kick");
      if (!kicks.length) {
        return message.channel.send(
          new MessageEmbed({
            title: `Kick Reason`,
            description: `Couldn't find kicks for ${args[0]}`,
            color: "0xff0000",
          })
        );
      }
      const reason = kicks[kicks.length - 1].reason;

      if (!reason || !kicks) {
        return message.channel.send(
          new MessageEmbed({
            title: `Kick Reason`,
            description: `Couldn't find a kick reason for ${args[0]}`,
            color: "0xff0000",
          })
        );
      }

      message.channel.send(
        new MessageEmbed({
          title: `Kick Reason`,
          description: `User ID: \`${args[0]}\`\n\n**Reason** \`${reason}\``,
          color: `0xff0000`,
        })
      );
      return message.react(confirmEmoji);
    }
  } catch (err) {
    console.error(`[ERROR] recallKick : ${err.message}`);
  }
}
