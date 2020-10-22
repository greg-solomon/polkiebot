import { Message, MessageEmbed } from "discord.js";
import { checkIfAllowed, getUserFromMessage } from "../../lib/helpers";
import { roles } from "../../config.json";

// !addrole @user [role name]
export default async function addRole(message: Message, args: string[]) {
  try {
    const user = getUserFromMessage(message, args[0]);
    if (!message.guild) return;
    const [_, ...role] = args;
    if (!user) return message.reply(`I could not find that user`);

    const isAllowed = checkIfAllowed(message.author, message.guild, [
      "ADMINISTRATOR",
      "MANAGE_ROLES",
    ]);

    if (!isAllowed) return message.reply(`You are not allowed to do that`);
    let roleToAdd = message.guild?.roles.cache
      .array()
      .find((r) => r.name.toLowerCase() === role.join(" ").toLowerCase());

    if (!roleToAdd) {
      roleToAdd = message.mentions.roles.first();
    }

    if (!roleToAdd) {
      return message.reply(`I could not find that role`);
    }
    if (roleToAdd.id === roles.modRoleId)
      return message.channel.send(
        `The ${roleToAdd.toString()} role can not be given`
      );

    const member = message.guild.member(message.author.id);

    let highestMemberRole = member?.roles.highest.position;

    if (!highestMemberRole && !message.member?.hasPermission("ADMINISTRATOR"))
      return;

    if (!highestMemberRole) highestMemberRole = 0;
    if (
      roleToAdd.position > highestMemberRole &&
      !message.member?.hasPermission("ADMINISTRATOR")
    ) {
      return message.reply(`You are not allowed to do that.`);
    }

    if (
      roleToAdd.id === roles.modRoleId &&
      !member?.hasPermission("ADMINISTRATOR")
    ) {
      return message.reply(
        `You are not allowed to give ${roleToAdd.toString()} to users`
      );
    }
    const guildMember = message.guild?.member(user.id);

    if (!guildMember) return message.reply(`I could not find that user`);

    await guildMember.roles.add(roleToAdd);

    return message.reply(
      new MessageEmbed({
        title: `Role Successfully Added`,
        description: `Gave role **${roleToAdd.name}** to ${user.toString()}`,
        color: "0xff0000",
      })
    );
  } catch (err) {
    console.error(`[ERROR] addRole :${err.message}`);
  }
}
