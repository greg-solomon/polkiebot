require("dotenv").config();
require("./database/connect");
import Discord, { Message } from "discord.js";
import commands from "./commands";
import { prefix } from "./config.json";
import { findOrCreateServer } from "./database/functions";
import { ICustomCommand } from "./database/serverSchema";
const client = new Discord.Client();

client.on("ready", async () => {
  console.log(`Logged in as ${client.user?.tag}`);
});

client.on("message", async (message: Message) => {
  if (!message.guild) return;
  const server = await findOrCreateServer(message.guild.id);
  if (!server) return;
  const { customCommands } = server;

  const args = message.content.slice(prefix.length).trim().split(/ +/);

  if (message.content.match(/\[suggestion\]|\[s\]/i)) {
    commands.addVotesToSuggestion(message);
  }
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const command = args.shift()?.toLowerCase();
  if (!command) return;
  try {
    if (
      customCommands.find(
        (c: ICustomCommand) => c.command.toLowerCase() === command
      )
    )
      commands.executeCustomCommand(message, command, args, server);
    if (command === "ban") commands.banCommand(message, args);
    if (command === "unban") commands.unBanCommand(message, args);
    if (command === "recallban") commands.recallBanCommand(message, args);
    if (command === "kick") commands.kickCommand(message, args);
    if (command === "recallkick") commands.recallKickCommand(message, args);
    if (command === "mute") commands.muteCommand(message, args);
    if (command === "unmute") commands.unmuteCommand(message, args);
    if (command === "warn") commands.warnCommand(message, args);
    if (command === "history") commands.historyCommand(message, args);
    if (command === "setfc") commands.setFriendCode(message, args);
    if (command === "fc" && !args.length) commands.getFriendCode(message);
    if (command === "fc" && args.length)
      commands.getUsersFriendCode(message, args);
    if (command === "addrep") commands.addReputation(message, args);
    if (command === "subrep") commands.subReputation(message, args);
    if (command === "rep") commands.getReputation(message, args);
    if (command === "leaderboard") commands.repLeaderBoard(message);
    if (command === "destroyrep") commands.destroyRep(message, args);
    if (command === "addrole") commands.addRole(message, args);
    if (command === "nick") commands.addNickname(message, args);
    if (command === "purge") commands.purgeMessages(message, args);
    if (command === "price") commands.pingPricer(message, args, true, server);
    if (command === "pricenp")
      commands.pingPricer(message, args, false, server);
    if (command === "toggleprice")
      commands.togglePricerPing(message, args, server);
    if (command === "pmr") commands.pingDesigner(message, args, server);
    if (command === "togglepmr")
      commands.toggleDesignerPing(message, args, server);
    if (command === "mm") commands.pingMiddleman(message, args, server);
    if (command === "togglemm")
      commands.toggleMiddleManPing(message, args, server);
    if (command === "helpme") commands.pingHelp(message, args);
    if (command === "math") commands.mathCommand(message, args);
    if (command === "learn") commands.learnCommand(message, args, server);
    if (command === "lfg") commands.pingLFG(message, args);
    if (command == "regions") commands.showRegions(message, args);
    if (command === "forget")
      commands.forgetCustomCommand(message, args, server);
    if (command === "customcommands")
      commands.listCustomCommands(message, args, server);
    if (command === "rephistory") commands.repHistory(message, args);
    if (command === "help") commands.listCommands(message);
    if (command === "modhelp") commands.listModCommands(message);
  } catch (err) {
    console.error(err.message);
  }
});

client.login(process.env.TOKEN);
