import { prefix } from "../config.json";
const commands = [
  {
    name: "ban",
    usage: `${prefix}ban [@user|ID]`,
    description: "Bans a user",
    modOnly: true,
  },
  {
    name: "unban",
    usage: `${prefix}unban [@user|ID]`,
    description: "Unbans a user",
    modOnly: true,
  },
  {
    name: "recallban",
    usage: `${prefix}recallban [ID]`,
    description: "Pulls up reason for ban",
    modOnly: true,
  },
  {
    name: "kick",
    usage: `${prefix}kick [@user|id]`,
    description: "Kicks a user",
    modOnly: true,
  },
  {
    name: "recallkick",
    usage: `${prefix}recallkick [@user|id]`,
    description: "Recalls a kick reason",
    modOnly: true,
  },
  {
    name: "mute",
    usage: `${prefix}mute [@user|id] [time[s|m|d|w]]? [reason?]`,
    description: "Mutes a user",
    modOnly: true,
  },
  {
    name: "unmute",
    usage: `${prefix}unmute [@user|id]`,
    description: "Unmutes a user",
    modOnly: true,
  },
  {
    name: "warn",
    usage: `${prefix}warn [reason]`,
    description: "Warns a user",
    modOnly: true,
  },
  {
    name: "history",
    usage: `${prefix}history [@user|id]`,
    description: "Shows users infraction history",
    modOnly: true,
  },
  {
    name: "setfc",
    usage: `${prefix}setfc [####-####-####]`,
    description: "Sets your friend code",
    modOnly: false,
  },
  {
    name: "fc",
    usage: `${prefix}fc [@user|id]?`,
    description:
      "Displays the users friend code, displays your friend code if none provided.",
    modOnly: false,
  },
  {
    name: "addrep",
    usage: `${prefix}addrep [@user|id] [reason]`,
    description: "Give a reputation point to a user",
    modOnly: false,
  },
  {
    name: "subrep",
    usage: `${prefix}subrep [@user|id] [reason]`,
    description: "Give a user subrep",
    modOnly: false,
  },
  {
    name: "rep",
    usage: `${prefix}rep [@user|id]`,
    description: "Shows last 5 reps for the given user",
    modOnly: false,
  },
  {
    name: "leaderboard",
    usage: `${prefix}leaderboard`,
    description: "Shows the rep leaderboard",
    modOnly: false,
  },
  {
    name: "destroyrep",
    usage: `${prefix}destroyrep [@user|id]`,
    description: "Destroys the rep of a given user",
    modOnly: true,
  },
  {
    name: "addrole",
    usage: `${prefix}addrole [rolename]`,
    description: "Adds the role to the user",
    modOnly: true,
  },
  {
    name: "nick",
    usage: `${prefix}nick [@user|id] [nickname]`,
    description:
      "Gives the user a nickname, empty nicknames will reset nickname",
    modOnly: true,
  },
  {
    name: "purge",
    usage: `${prefix}purge [n]`,
    description: `Deletes the last n messages`,
    modOnly: true,
  },
  {
    name: "price",
    usage: `${prefix}price [reason]`,
    description: "Pings pricers for price help",
    modOnly: false,
  },
  {
    name: "pricenp",
    usage: `${prefix}pricenp`,
    description: "Same as price but with no ping",
    modOnly: false,
  },
  {
    name: "toggleprice",
    usage: `${prefix}toggleprice`,
    description: "Toggles on/off price pinging",
    modOnly: true,
  },
  {
    name: "pmr",
    usage: `${prefix}pmr [reason]`,
    description: "Pings designers in the showcase channel",
    modOnly: false,
  },
  {
    name: "togglepmr",
    usage: `${prefix}togglepmr`,
    description: "Toggles on/off designer pinging",
    modOnly: true,
  },
  {
    name: "mm",
    usage: "!mm [reason]",
    description: "Pings for middleman help",
    modOnly: false,
  },
  {
    name: "togglemm",
    usage: `${prefix}togglemm`,
    description: "Toggles on/off middleman pinging",
    modOnly: true,
  },
  {
    name: "helpme",
    usage: `${prefix}helpme [reason]`,
    description: "Pings helpers",
    modOnly: false,
  },
  {
    name: "!togglehelp",
    usage: `${prefix}togglehelp`,
    description: "Toggles on/off helper pinging",
    modOnly: true,
  },
  {
    name: "math",
    usage: "!math [expression]",
    description: "Compute a math expression",
    modOnly: false,
  },
  {
    name: "learn",
    usage: "!learn [command] [template]",
    description:
      "Add custom commands. Integrate mentions by placing '{mention}' in your template",
    modOnly: true,
  },
  {
    name: "lfg",
    usage: `${prefix}lfg [region] [reason?]`,
    description: "Ping LFG channel",
    modOnly: false,
  },
  {
    name: "regions",
    usage: `${prefix}regions`,
    description: "Show regions and their region codes",
    modOnly: false,
  },
  {
    name: "forget",
    usage: `${prefix}forget [command]`,
    description: "Delete a custom command",
    modOnly: true,
  },
  {
    name: "help",
    usage: `${prefix}help`,
    description: "Show commands",
    modOnly: false,
  },
  {
    name: "rephistory",
    usage: `${prefix}rephistory [@user|id]`,
    description:
      "DM's the moderator a text file of the users rep history and allows the moderator to delete reputations",
    modOnly: true,
  },
  {
    name: "customcommands",
    usage: `${prefix}customcommands`,
    description: `Show custom commands`,
    modOnly: false,
  },
];

export default commands;
