import { Message, MessageEmbed, MessageReaction } from "discord.js";
import { findOrCreateProfile } from "../../database/functions";
import { getUserFromMessage, getRepLogChannel } from "../../lib/helpers";
import { verifyReasonLength } from "./functions";
import { channels, roles, confirmEmoji, declineEmoji } from "../../config.json";
// !subrep [@user|id] [reason]
export default async function subReputation(message: Message, args: string[]) {
  if (!message.guild) return;
  if (message.channel.id !== channels.reputationChannelId)
    return message.reply(`Please keep reps to the reputation channel`);
  try {
    const user = getUserFromMessage(message, args[0]);
    const modRole = message.guild.roles.resolve(roles.modRoleId);

    if (!modRole) return console.log(`Could not find moderator role`);
    if (!user)
      return message.reply(`I could not find the user you were looking for.`);

    const queriedMember = message.guild.member(user);
    const reason = args.slice(1).join(" ");

    if (!verifyReasonLength(reason)) {
      message.reply(`Reasons should not exceed 250 characters in length`);
      return;
    }

    if (!queriedMember) return;
    if (user.id === message.author.id)
      return message.reply(`You can not subrep yourself`);

    const profile = await findOrCreateProfile(queriedMember.id);
    if (profile) {
      // ping moderators for confirmation
      const embed = new MessageEmbed({
        title: `Confirm Sub Rep`,
        description: `${message.author.toString()} has deducted rep from ${queriedMember.toString()}\n**Reason**: ${reason}`,
        color: `0xff0000`,
      });

      const repLogsChannel = getRepLogChannel(message.guild);
      if (!repLogsChannel)
        return message.reply(`I can't find the rep logs channel`);

      await repLogsChannel.send(`${modRole.toString()}`);
      const sentMessage = await repLogsChannel.send(embed);

      const reactFilter = (reaction: MessageReaction) =>
        reaction.users.cache.array().filter((u) => !u.bot).length > 0;
      const reactCollector = sentMessage.createReactionCollector(
        reactFilter,
        {}
      );

      await sentMessage.react(confirmEmoji);
      await sentMessage.react(declineEmoji);
      reactCollector.on("collect", async (reaction, user) => {
        const member = reaction.message.guild?.members.cache
          .array()
          .find((u) => u.id === user.id);

        if (
          member &&
          !member.roles.cache
            .array()
            .find((role) => role.id === roles.modRoleId) &&
          !member.hasPermission("ADMINISTRATOR")
        ) {
          // get the users reaction and remove it
          await reaction.users.remove(user.id);
          return;
        }

        if (reaction.emoji.name === confirmEmoji) {
          profile.subrep++;
          profile.log.push({
            user: message.author.id,
            type: "sub",
            reason,
          });

          await profile.save();
          const embedded = sentMessage.embeds[0];
          embedded.setFooter(`Confirmed by ${user.username}`);

          await sentMessage.edit(embedded);
          await message.react(confirmEmoji);
          reactCollector.stop();
        } else if (reaction.emoji.name === declineEmoji) {
          const embedded = sentMessage.embeds[0];
          embedded.setFooter(`Declined by ${user.username}`);
          await message.react(declineEmoji);
          await sentMessage.edit(embedded);
          reactCollector.stop();
        } else {
          await reaction.remove();
        }
      });
    }
  } catch (error) {
    console.error(error.message);
  }
}
