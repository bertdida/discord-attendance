import fs from "fs";
import path from "path";
import { SlashCommandBuilder, CommandInteraction } from "discord.js";

export type Command = {
  data: SlashCommandBuilder;
  execute: (interaction: CommandInteraction) => unknown;
};

const commands: Command[] = [];

const commandsPath = __dirname;
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"))
  .filter((file) => file !== "index.js");

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);

  if ("data" in command && "execute" in command) {
    commands.push(command);
  } else {
    console.log(
      `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
    );
  }
}

export default commands;
