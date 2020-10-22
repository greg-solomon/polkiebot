import mongoose, { Schema, Document } from "mongoose";

export interface ProfileType extends Document {
  discordId: string;
  friendCode: string;
  rep: number;
  subrep: number;
  log: IRepLog[];
}

interface IRepLog {
  user: string;
  type: "add" | "sub" | "kick" | "ban" | "unban" | "mute" | "unmute" | "warn";
  reason: string;
}

const ProfileSchema = new Schema({
  discordId: {
    type: String,
    required: true,
    unique: true,
  },
  friendCode: {
    type: String,
  },
  rep: {
    type: Number,
    required: true,
  },
  subrep: {
    type: Number,
    required: true,
  },
  log: [
    {
      user: {
        type: String,
        required: true,
      },
      type: {
        type: String,
        required: true,
      },
      reason: {
        type: String,
        required: true,
      },
    },
  ],
});

export default mongoose.model<ProfileType>("profile", ProfileSchema);
