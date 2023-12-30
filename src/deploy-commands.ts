import { Guild, REST, Routes } from "discord.js";

import config from "@/config/app";
import commands from "@/commands";

const rest = new REST().setToken(config.DISCORD_TOKEN);

async function deployCommands(guild: Guild) {
  try {
    await rest.put(
      Routes.applicationGuildCommands(config.DISCORD_CLIENT_ID, guild.id),
      { body: commands.map((command) => command.data.toJSON()) }
    );

    console.log(
      `✅ Successfully reloaded application (/) commands for ${guild.name}.`
    );
  } catch (error) {
    console.error(error);
  }
}

export default deployCommands;
