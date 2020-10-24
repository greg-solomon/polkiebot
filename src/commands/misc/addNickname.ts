import { Message, MessageEmbed } from "discord.js";
import { getUserFromMessage } from "../../lib/helpers";
import { roles } from "../../config.json";

// !nick @user [nickname]
// if no nickname provided, resets nickname
export default async function addNickname(message: Message, args: string[]) {
  try {
    let user = getUserFromMessage(message, args[0]);
    let nickname = args.slice(1).join(" ");

    if (!user) {
      user = message.author;
      nickname = args.slice(0).join(" ");
    }
    if (!message.guild) return;

    const hasPermission = message.member?.hasPermission("MANAGE_NICKNAMES");
    const changingSelf = user === message.author;

    const hasRole = message.member?.roles.cache.find(
      (role) => role.id === roles.modRoleId || role.id === roles.helperRoleId
    );

    if (!changingSelf && !hasPermission && !hasRole) {
      return message.reply(
        `You don't have permission to change this persons nickname`
      );
    }

    let member = message.guild.member(user.id);

    if (changingSelf && !nickname) {
      if (!message.member?.hasPermission("CHANGE_NICKNAME"))
        return message.reply(`You are not allowed to change your nickname`);
      return await member?.setNickname("");
    }

    if (changingSelf && !message.member?.hasPermission("CHANGE_NICKNAME")) {
      return message.reply(`You are not allowed to change your nickname`);
    }

    const senderHighestRole = message.member?.roles.highest.position || 0;
    const toBanHighestRole =
      message.guild.member(user.id)?.roles.highest.position || 0;

    if (senderHighestRole <= toBanHighestRole && !changingSelf)
      return message.reply(
        `You can not change nicknames of users that have the same or higher roles as you`
      );

    if (member === member?.guild.owner)
      return message.reply(
        `I can't change the server owners nickname, If you are the owner, use /nick`
      );

    if (!member) return message.reply(`I could not find that user`);

    if (nickname.length > 32)
      return message.reply(`Nicknames can not exceed 32 characters in length`);

    if (changingSelf) {
      if (member.hasPermission("CHANGE_NICKNAME")) {
        if (nickname) {
          await member.setNickname(nickname);
          return message.reply(
            new MessageEmbed({
              title: `Nickname Change`,
              description: `${message.author.username} set ${user.username}'s nickname to ${nickname}`,
              color: `0xff0000`,
            })
          );
        } else {
          await member.setNickname("");
          return message.reply(
            new MessageEmbed({
              title: `Nickname Change`,
              description: `${message.author.username} set ${user.username}'s nickname to ${nickname}`,
              color: `0xff0000`,
            })
          );
        }
      }
    }
    if (nickname) {
      await member.setNickname(nickname);

      return message.reply(
        new MessageEmbed({
          title: `Nickname Change`,
          description: `${message.author.username} set ${user.username}'s nickname to ${nickname}`,
          color: `0xff0000`,
        })
      );
    } else {
      await member.setNickname("");
      return message.reply(
        new MessageEmbed({
          title: `Nickname Change`,
          description: `${message.author.username} removed ${user.username}'s nickname`,
          color: `0xff0000`,
        })
      );
    }
  } catch (err) {
    console.error(`[ERROR] addNickname: ${err.message}`);
  }
}
