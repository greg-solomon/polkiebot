import { Guild, Message, MessageEmbed, MessageReaction } from "discord.js";
import { findOrCreateProfile } from "../../database/functions";
import { checkIfAllowed, getUserFromMessage } from "../../lib/helpers";
import {
  pageSize,
  prevPageEmoji,
  nextPageEmoji,
  prefix,
} from "../../config.json";
import fs from "fs";
import times from "../../lib/times";
import { ProfileType } from "../../database/profileSchema";
export default async function repHistoryCommand(
  message: Message,
  args: string[]
) {
  try {
    if (!message.guild) return;
    const { guild } = message;
    const isAllowed = checkIfAllowed(message.author, guild, ["ADMINISTRATOR"]);

    if (!isAllowed) return message.reply(`You are not allowed to do that`);
    const user = getUserFromMessage(message, args[0]);

    if (!user)
      return message.reply(`I could not find the user you were looking for`);

    const profile = await findOrCreateProfile(user.id);
    if (!profile) return message.reply(`I could not find their profile`);

    const [history, indexedHistory] = generateHistory(profile, guild);

    let page = 0;
    const filename = `./${user.username}rephistory.txt`;
    fs.writeFile(filename, history.join("\n"), (err) => {
      if (err) throw err;
    });

    const embed = new MessageEmbed({
      title: `${user.username} Rep History`,
      color: `0xff0000`,
      description: indexedHistory
        .slice(page * pageSize, page * pageSize + pageSize)
        .join("\n"),
    });

    embed.setFooter(
      `Page through the rep history with the emojis.\n\nReply with !delete [n] to delete a reputation`
    );

    message.author.send("", { files: [filename] }).then(() =>
      fs.unlink(filename, (err) => {
        if (err) throw err;
      })
    );
    message.author.send(embed).then(async (historyMessage) => {
      const messageFilter = (msg: Message) => !msg.author.bot;

      const reactFilter = (react: MessageReaction) =>
        react.emoji.name === prevPageEmoji ||
        react.emoji.name === nextPageEmoji;

      const options = { time: times.MINUTE };
      const reactCollector = historyMessage.createReactionCollector(
        reactFilter,
        options
      );

      const messageCollector = historyMessage.channel.createMessageCollector(
        messageFilter,
        options
      );

      await historyMessage.react(prevPageEmoji);
      await historyMessage.react(nextPageEmoji);

      messageCollector.on("collect", async (directMessage: Message) => {
        const { content } = directMessage;
        const args = content.slice(prefix.length).trim().split(/ +/);
        const command = args.shift()?.toLowerCase();

        messageCollector.resetTimer();
        if (command === "delete") {
          console.log(args);
          if (!args) return directMessage.reply(`You forgot the index[es].`);

          const deletedItems: any[] = [];
          for (const arg of args) {
            const indexToDelete = Number.parseInt(arg) - 1;
            if (
              indexToDelete < 0 ||
              indexToDelete >= profile.log.length ||
              typeof indexToDelete !== "number"
            )
              continue;
            const [removedItem] = profile.log.splice(indexToDelete, 1);
            deletedItems.push(removedItem);
            if (removedItem.type === "add") {
              profile.rep--;
              if (profile.rep < 0) profile.rep = 0;
            } else if (removedItem.type === "sub") {
              profile.subrep--;
              if (profile.subrep < 0) profile.subrep = 0;
            }
          }

          const deletedReply = deletedItems
            .map((item) => {
              const member = guild.member(item.user);
              return `Deleted **${item.type.toUpperCase()}**: \`${
                item.reason
              }\` from \`${member?.displayName}\``;
            })
            .join("\n");

          await profile.save();

          const [history, indexedHistory] = generateHistory(profile, guild);

          const embed = historyMessage.embeds[0];
          embed.setDescription(
            indexedHistory
              .slice(pageSize * page, pageSize * page + pageSize)
              .join("\n")
          );

          await historyMessage.edit(embed);
          return directMessage.reply(deletedReply);
        }
      });

      reactCollector.on("collect", async (react) => {
        const { name } = react.emoji;
        if (name === prevPageEmoji) {
          // go back
          // check if page is 0;
          if (page === 0) return;

          page--;
          const boardEmbed = historyMessage.embeds[0];
          if (!boardEmbed)
            return console.log(`I couldnt find the leaderboard embed`);

          boardEmbed.setDescription(
            indexedHistory
              .slice(page * pageSize, page * pageSize + pageSize)
              .join(`\n`)
          );
          await historyMessage.edit(boardEmbed);
        }

        if (name === nextPageEmoji) {
          // go forward
          // check if there are no more results to show
          if ((page + 1) * pageSize >= indexedHistory.length - 1) return;

          const boardEmbed = historyMessage.embeds[0];
          if (!boardEmbed)
            return console.log(`I couldnt find the leaderboard embed`);

          page++;
          boardEmbed.setDescription(
            indexedHistory
              .slice(page * pageSize, page * pageSize + pageSize)
              .join(`\n`)
          );
          await historyMessage.edit(boardEmbed);
        }
      });
    });
  } catch (error) {
    console.error(error.message);
  }
}

function generateHistory(profile: ProfileType, guild: Guild) {
  const history = profile.log.map(({ type, reason, user }) => {
    const givenBy = guild.member(user);
    return `**${type.toUpperCase()}** : \`${reason}\` from \`${
      givenBy?.user.username
    }\``;
  });

  const indexedHistory = history.map((h, i) => `${i + 1} - ` + h);

  return [history, indexedHistory];
}
