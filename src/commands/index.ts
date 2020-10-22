import modCommands from "./moderation";
import friendCodeCommands from "./friendcodes";
import reputationCommands from "./reputation";
import miscCommands from "./misc";
import roleCommands from "./pingroles";
import listCommands from "./commands";
export default {
  ...modCommands,
  ...friendCodeCommands,
  ...reputationCommands,
  ...miscCommands,
  ...roleCommands,
  ...listCommands,
};
