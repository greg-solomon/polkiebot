import { Message, MessageEmbed } from "discord.js";
import ProfileModel from "../../database/profileSchema";
// Gets the friend code of the querying user
export default async function getFriendCode(message: Message) {
  try {
    const profile = await ProfileModel.findOne({
      discordId: message.author.id,
    });

    if (profile && profile.friendCode !== "") {
      const embed = new MessageEmbed({
        title: `${message.author.username}'s Friend Code`,
        description: `${message.author.toString()}: ${profile.friendCode}`,
        color: "0xff0000",
      });
      message.channel.send(embed);
    } else {
      message.reply(
        `You don't have a friend code set! Set your friend code with \n> \`!setfc [code]\``
      );
    }
  } catch (error) {
    console.error(`[ERROR] getFriendCode: ${error.message}`);
  }
}
