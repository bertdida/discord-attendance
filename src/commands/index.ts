import { SlashCommandBuilder, CommandInteraction } from "discord.js";

import loadCommands from "@/load-commands";

export type Command = {
  data: SlashCommandBuilder;
  execute: (interaction: CommandInteraction) => Promise<unknown>;
};

const commands = loadCommands<Command>(__dirname);
export default commands;
