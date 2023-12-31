import fs from "fs";
import path from "path";

function loadCommands<T>(folder: string) {
  const commands: T[] = [];

  const commandFiles = fs
    .readdirSync(folder)
    .filter((file) => file.endsWith(".js"))
    .filter((file) => file !== "index.js");

  for (const file of commandFiles) {
    const filePath = path.join(folder, file);
    const command = require(filePath);

    if ("data" in command && "execute" in command) {
      commands.push(command);
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }

  return commands;
}

export default loadCommands;
