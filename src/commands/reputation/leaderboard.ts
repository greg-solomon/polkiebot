import ProfileModel from "../../database/profileSchema";
import {
  channels,
  nextPageEmoji,
  prevPageEmoji,
  pageSize,
} from "../../config.json";
import { Message, MessageEmbed, MessageReaction } from "discord.js";
import times from "../../lib/times";
export default async function repLeaderBoard(message: Message) {
  if (message.channel.id !== channels.reputationChannelId)
    return message.reply(`Use this command in the reputation channel`);
  try {
    const allProfiles = await ProfileModel.find();

    if (!allProfiles)
      return message.reply(`I couldn't access the database. Sorry.`);
    let page = 0;

    const reps = allProfiles
      .map(({ rep, discordId }) => ({ rep, discordId }))
      .sort((a, b) => b.rep - a.rep);

    const repsWithUsers = reps.map(({ rep, discordId }, i) => {
      const userString = message.guild?.member(discordId)?.user.toString();
      return `\`${i + 1}\` | \`${rep}\` ${userString}`;
    });

    const embed = new MessageEmbed({
      title: `Reputation Leaderboard`,
      description: repsWithUsers
        .slice(page * pageSize, page * pageSize + pageSize)
        .join(`\n`),
      color: `0xffff00`,
    });

    message.channel.send(embed).then(async (leaderboardMessage) => {
      await leaderboardMessage.react(prevPageEmoji);
      await leaderboardMessage.react(nextPageEmoji);

      const reactFilter = (react: MessageReaction) =>
        react.emoji.name === prevPageEmoji ||
        react.emoji.name === nextPageEmoji;

      const options = { time: times.MINUTE };
      const reactCollector = leaderboardMessage.createReactionCollector(
        reactFilter,
        options
      );

      reactCollector.on("collect", async (react, user) => {
        reactCollector.resetTimer();
        const { name } = react.emoji;
        if (name === prevPageEmoji) {
          // go back
          // check if page is 0;
          if (page === 0) return await react.users.remove(user.id);

          page--;
          const boardEmbed = leaderboardMessage.embeds[0];
          if (!boardEmbed)
            return console.log(`I couldnt find the leaderboard embed`);

          boardEmbed.setDescription(
            repsWithUsers
              .slice(page * pageSize, page * pageSize + pageSize)
              .join(`\n`)
          );
          await leaderboardMessage.edit(boardEmbed);
        }

        if (name === nextPageEmoji) {
          // go forward
          // check if there are no more results to show
          if ((page + 1) * pageSize >= repsWithUsers.length - 1) {
            return await react.users.remove(user.id);
          }
          const boardEmbed = leaderboardMessage.embeds[0];
          if (!boardEmbed)
            return console.log(`I couldnt find the leaderboard embed`);

          page++;
          boardEmbed.setDescription(
            repsWithUsers
              .slice(page * pageSize, page * pageSize + pageSize)
              .join(`\n`)
          );
          await leaderboardMessage.edit(boardEmbed);
        }

        await react.users.remove(user.id);
      });
    });
  } catch (err) {
    console.error(err.message);
  }
}
