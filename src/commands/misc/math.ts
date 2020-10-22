import { Message } from "discord.js";

export default async function mathCommand(message: Message, args: string[]) {
  try {
    if (!args.length)
      return message.reply(
        `You have to specify a some math command\n\`!math 2 + 2\``
      );

    const cleaned = args.join(" ").replace(/[A-Z=;]+|()/gi, "");
    const math = eval(cleaned);

    if (math) {
      message.reply(math);
    } else {
      message.reply(`I had trouble parsing your expresson.`);
    }
  } catch (err) {
    console.error(`[ERROR] mathCommand : ${err.message}`);
  }
}
