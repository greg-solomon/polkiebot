import mongoose, { Schema, Document } from "mongoose";

export interface ServerType extends Document {
  serverId: string;
  priceHelpEnabled: boolean;
  designerHelpEnabled: boolean;
  middlemanHelpEnabled: boolean;
  helpEnabled: boolean;
  customCommands: ICustomCommand[];
}

export interface ICustomCommand {
  command: string;
  template: string;
}

const ServerSchema = new Schema({
  serverId: {
    type: String,
    required: true,
  },
  priceHelpEnabled: {
    type: Boolean,
    required: true,
  },
  designerHelpEnabled: {
    type: Boolean,
    required: true,
  },
  middlemanHelpEnabled: {
    type: Boolean,
    required: true,
  },
  helpEnabled: {
    type: Boolean,
    required: true,
  },
  customCommands: [
    {
      command: {
        type: String,
        required: true,
      },
      template: {
        type: String,
        required: true,
      },
    },
  ],
});

export default mongoose.model<ServerType>("server", ServerSchema);
