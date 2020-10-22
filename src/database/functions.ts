import ProfileModel, { ProfileType } from "./profileSchema";
import ServerModel from "./serverSchema";

async function findOrCreateProfile(discordId: string | undefined | null) {
  if (!discordId) return;
  try {
    // check if profile exists
    const oldProfile = await ProfileModel.findOne({ discordId });
    if (oldProfile) return oldProfile;

    const newProfile = new ProfileModel({
      discordId: discordId,
      friendCode: "",
      rep: 0,
      subrep: 0,
      log: [],
      banned: false,
    });
    return await newProfile.save();
  } catch (err) {
    console.error(err.message);
  }
}

async function findOrCreateServer(serverId: string | undefined | null) {
  if (!serverId) return;
  try {
    const oldServer = await ServerModel.findOne({ serverId });

    if (oldServer) return oldServer;

    const newServer = new ServerModel({
      serverId,
      priceHelpEnabled: true,
      designerHelpEnabled: true,
      middlemanHelpEnabled: true,
      helpEnabled: true,
      customCommands: [],
    });

    await newServer.save();

    return newServer;
  } catch (error) {
    console.error(error.message);
  }
}
export { findOrCreateProfile, findOrCreateServer };
