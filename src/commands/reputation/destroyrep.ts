import { Message, MessageEmbed } from "discord.js";
import { findOrCreateProfile } from "../../database/functions";
import { checkIfAllowed, getRepLogChannel } from "../../lib/helpers";
import { confirmEmoji } from "../../config.json";

// !destroyrep [@user|id]
export default async function destroyRep(message: Message, args: string[]) {
  // check mod role
  if (!message.guild) return;
  const isAllowed = checkIfAllowed(message.author, message.guild, [
    "ADMINISTRATOR",
  ]);

  if (!isAllowed) return message.reply(`You are not allowed to do that`);

  // get user
  let user = message.mentions.users.first();
  if (!user) {
    user = message.guild?.member(args[0])?.user;
  }

  const repLogsChannel = getRepLogChannel(message.guild);
  if (!user)
    return message.reply(`I could not find the user you were looking for`);
  const profile = await findOrCreateProfile(user.id);

  if (profile) {
    profile.rep = 0;
    profile.log = profile.log.filter((logItem) => logItem.type !== "add");
    await profile.save();

    repLogsChannel?.send(
      new MessageEmbed({
        title: `Rep Destroyed`,
        description: `Rep for ${user.toString()} has been destroyed`,
        color: `0xff0000`,
      })
    );

    return await message.react(confirmEmoji);
  }
}
