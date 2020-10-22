import { Message, MessageEmbed, User } from "discord.js";
import { mmFriendCode, donationFriendCode } from "../../config.json";
import ProfileModel from "../../database/profileSchema";
// gets the friend code of the specified user or bot
export default async function getUsersFriendCode(
  message: Message,
  args: string[]
) {
  try {
    if (args[0] === "bot") {
      // get the friend code of the donation bot
      const embed = new MessageEmbed({
        title: "Donation Bot Friend Code",
        description: donationFriendCode,
        color: "0xff0000",
      });
      message.channel.send(embed);
    } else if (args[0] === "mm") {
      // get the friend code of the middleman bot
      const embed = new MessageEmbed({
        title: "Middleman Bot Friend Code",
        description: mmFriendCode,
        color: "0xff0000",
      });
      message.channel.send(embed);
    } else {
      // find the user
      const guild = message.guild;

      let mention: User | null | undefined = message.mentions.users.first();

      if (!mention) {
        mention = guild?.members.cache.array().find((u) => u.id === args[0])
          ?.user;
      }

      const memberProfile = await ProfileModel.findOne({
        discordId: mention?.id,
      });

      if (memberProfile && mention && memberProfile.friendCode !== "") {
        const embed = new MessageEmbed({
          title: `${mention.username} Friend Code`,
          description: `${mention?.toString()}: ${memberProfile.friendCode}`,
          color: "0xff0000",
        });
        return message.channel.send(embed);
      } else {
        return message.reply(
          `This user does not have a friend code registered!`
        );
      }
    }
  } catch (err) {
    console.error(`[ERROR] getUsersFriendCode: ${err.message}`);
  }
}
