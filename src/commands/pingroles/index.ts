import pingPricer from "./pingPricer";
import pingDesigner from "./pingDesigner";
import pingMiddleman from "./pingMiddleman";
import pingLFG from "./pingLFG";
import pingHelp from "./pingHelp";

export default {
  ...pingDesigner,
  ...pingHelp,
  ...pingMiddleman,
  ...pingLFG,
  ...pingPricer,
};
