import { Message, MessageEmbed } from "discord.js";
import { findOrCreateProfile } from "../../database/functions";

import { verifyFriendCode } from "./functions";

// sets the friend code of the querying user
export default async function setFriendCode(message: Message, args: string[]) {
  try {
    const user = message.author;

    let friendCode = args.join("-").toUpperCase();

    if (!verifyFriendCode(friendCode)) {
      message.reply(
        "You submitted an invalid friend code\nFriend codes must be entered as \n`####-####-####`\n or \n`#### #### ####`\n"
      );
      return;
    }

    const profile = await findOrCreateProfile(user.id);

    if (!profile) throw new Error(`Issue creating profile`);

    profile.friendCode = friendCode;

    await profile.save();
    const embed = new MessageEmbed({
      title: `${message.author.username}'s Friend Code`,
      description: `${message.author.toString()}: ${profile.friendCode}`,
      color: "0xff0000",
    });
    return message.channel.send(embed);
  } catch (err) {
    console.error(`[ERROR] setFriendCode: ${err.message}`);
  }
}
