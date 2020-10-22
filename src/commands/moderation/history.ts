import { Message, MessageEmbed, MessageReaction } from "discord.js";
import { findOrCreateProfile } from "../../database/functions";
import { getUserFromMessage } from "../../lib/helpers";
import {
  confirmEmoji,
  pageSize,
  prevPageEmoji,
  nextPageEmoji,
  roles,
} from "../../config.json";
import times from "../../lib/times";

// !history [@user|id]
export default async function historyCommand(message: Message, args: string[]) {
  try {
    if (!message.guild) return;
    // get the user
    const user = getUserFromMessage(message, args[0]);

    if (!user) {
      return message.reply(`I could not find the user you were looking for.`);
    }

    const hasRole = message.member?.roles.cache.find(
      (role) => role.id === roles.helperRoleId || role.id === roles.modRoleId
    );

    if (!hasRole && !message.member?.hasPermission("ADMINISTRATOR"))
      return message.reply(`You are not allowed to do this`);

    const profile = await findOrCreateProfile(user.id);

    let page = 0;
    if (profile) {
      const { log } = profile;
      const modLog = log
        .filter((logItem) => logItem.type !== "add" && logItem.type !== "sub")
        .reverse();

      const modStrings = modLog.map(({ type, user, reason }) => {
        const member = message.guild?.member(user);
        return `**${type.toUpperCase()}** - \`${reason}\` from ${member?.toString()}`;
      });

      const embed = new MessageEmbed({
        title: `${user.username}'s History`,
        description: modStrings
          .slice(page * pageSize, page * pageSize + pageSize)
          .join("\n"),
        color: `0xff0000`,
      }).setFooter(`Page through the rep history with the emojis.`);

      if (!modLog.length) {
        embed.setDescription("No history for this user. Check the rep history");
      }

      const avatarUrl = user.avatarURL();
      if (avatarUrl) {
        embed.setImage(avatarUrl);
        embed.setThumbnail(avatarUrl);
      }
      message.react(confirmEmoji);
      return message.channel.send(embed).then(async (historyMessage) => {
        const reactFilter = (react: MessageReaction) =>
          react.emoji.name === prevPageEmoji ||
          react.emoji.name === nextPageEmoji;

        const options = { time: times.MINUTE };

        const reactCollector = historyMessage.createReactionCollector(
          reactFilter,
          options
        );
        await historyMessage.react(prevPageEmoji);
        await historyMessage.react(nextPageEmoji);

        reactCollector.on("collect", async (react, user) => {
          const { name } = react.emoji;
          const historyEmbed = historyMessage.embeds[0];
          reactCollector.resetTimer();
          if (!historyEmbed)
            return console.log(`Could not find the history embed`);

          if (name === prevPageEmoji) {
            // go back
            // check if page is 0;
            if (page === 0) return;

            page--;
            const historyEmbed = historyMessage.embeds[0];
            if (!historyEmbed)
              return console.log(`I couldnt find the leaderboard embed`);

            historyEmbed.setDescription(
              modStrings
                .slice(page * pageSize, page * pageSize + pageSize)
                .join(`\n`)
            );
            await historyMessage.edit(historyEmbed);
          }

          if (name === nextPageEmoji) {
            // go forward
            // check if there are no more results to show
            if ((page + 1) * pageSize >= modStrings.length - 1) return;

            const historyEmbed = historyMessage.embeds[0];
            if (!historyEmbed)
              return console.log(`I couldnt find the leaderboard embed`);

            page++;
            historyEmbed.setDescription(
              modStrings
                .slice(page * pageSize, page * pageSize + pageSize)
                .join(`\n`)
            );
            await historyMessage.edit(historyEmbed);
          }

          await react.users.remove(user.id);
        });
      });
    }
  } catch (err) {
    console.error(`[ERROR] historyCommand : ${err.message}`);
  }
}
