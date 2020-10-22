import { Message, MessageEmbed } from "discord.js";
import commandList from "../lib/commandList";

async function listCommands(message: Message) {
  try {
    const nonModCommands = commandList
      .filter((c) => !c.modOnly)
      .map((c) => `\`${c.usage}\` - ${c.description}`);

    const embed = new MessageEmbed({
      title: `Commands`,
      description: nonModCommands.join("\n"),
      color: "0xff0000",
    });

    return message.channel.send(embed);
  } catch (error) {}
}

async function listModCommands(message: Message) {
  const modCommands = commandList
    .filter((c) => c.modOnly)
    .map((c) => `\`${c.usage}\` - ${c.description}`);

  const embed = new MessageEmbed({
    title: `Mod Commands`,
    description: modCommands.join("\n"),
    color: "0xff0000",
  });

  return message.channel.send(embed);
}

export default { listCommands, listModCommands };
