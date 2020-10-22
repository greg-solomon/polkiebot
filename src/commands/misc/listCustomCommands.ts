import { Message, MessageEmbed } from "discord.js";
import { prefix } from "../../config.json";
import { ServerType } from "../../database/serverSchema";
export default async function listCustomCommands(
  message: Message,
  args: string[],
  server: ServerType
) {
  try {
    const { customCommands } = server;

    const fields: any[] = [];

    let commandStr = ``;
    customCommands.forEach((c, i) => {
      commandStr += `**${prefix}${c.command}** - ${c.template}\n`;
    });
    return message.channel.send(
      new MessageEmbed({
        title: `Custom Commands`,
        fields: fields,
        description: commandStr,
        color: "0xff0000",
      }).setFooter(
        `Command's with {mention} require a user mention or ID.\n\n${prefix}command [@user|id]`
      )
    );
  } catch (err) {
    console.error(`[ERROR] listCustomCommands : ${err.message}`);
  }
}
