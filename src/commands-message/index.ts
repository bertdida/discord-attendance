import { Message } from "discord.js";

import loadCommands from "@/load-commands";

export type CommandMessage = {
  data: {
    name: string;
    description: string;
  };
  execute: (message: Message) => Promise<unknown>;
};

const commands = loadCommands<CommandMessage>(__dirname);
export default commands;
