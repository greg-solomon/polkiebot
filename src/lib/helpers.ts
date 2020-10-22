import {
  Guild,
  Message,
  PermissionString,
  Role,
  TextChannel,
  User,
} from "discord.js";
import { roles, channels } from "../config.json";

export function getUserFromMessage(message: Message, id: string) {
  let user = message.mentions.users.first();

  if (!user) {
    user = message.guild?.member(id)?.user;
  }
  return user;
}

export function getMentionFromAuthor(author: User) {
  return author.toString().slice(0, 2) + "!" + author.toString().slice(2);
}

export function checkIfAllowed(
  user: User,
  guild: Guild,
  permissions: PermissionString[]
) {
  const member = guild.member(user.id);
  if (!member) return false;

  const modRole = member?.roles.cache
    .array()
    .find((r) => r.id === roles.modRoleId);

  const hasPermission = permissions.some((permission) =>
    member.hasPermission(permission)
  );
  if (modRole) return true;
  if (hasPermission) return true;
  return false;
}

export function getModLogChannel(guild: Guild): TextChannel | null {
  return guild.channels.resolve(channels.modLogsChannelId) as TextChannel;
}

export function getRepLogChannel(guild: Guild): TextChannel | null {
  return guild.channels.resolve(channels.repLogsChannelId) as TextChannel;
}

export function getTextChannel(
  guild: Guild,
  channelId: string
): TextChannel | null {
  return guild.channels.resolve(channelId) as TextChannel;
}

export async function getRole(guild: Guild, roleId: string) {
  const roles = (await guild.roles.fetch()).cache.array();
  if (!roles) return undefined;
  const role = roles.find((role) => role.id === roleId);

  if (role) return role;
  return undefined;
}
