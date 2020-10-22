import { Message } from "discord.js";
import { channels, upvoteEmojiId, downvoteEmojiId } from "../../config.json";

const fallbackDv = "⏬";

const fallbackUv = "⏫";
export default async function serverSuggestionReaction(message: Message) {
  try {
    if (message.channel.id !== channels.suggestionChannelId) return;
    if (!message.guild) return;

    let downvote = message.guild.emojis.resolveIdentifier(downvoteEmojiId);
    let upvote = message.guild.emojis.resolveIdentifier(upvoteEmojiId);

    if (upvote && downvote) {
      await message.react(upvote);
      await message.react(downvote);
    }
  } catch (err) {
    console.error(`[ERROR] serverSuggestionReaction : ${err.message}`);
    await message.react(fallbackUv);
    await message.react(fallbackDv);
  }
}
