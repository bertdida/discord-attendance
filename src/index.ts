import { Client, Events, GatewayIntentBits, Collection } from "discord.js";

import config from "./config";
import commands, { Command } from "./commands";
import deployCommands from "./deploy-commands";

type ClientWithCommands = Client & {
  commands: Collection<string, Command>;
};

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
}) as ClientWithCommands;

client.commands = new Collection();
commands.forEach((command) => {
  client.commands.set(command.data.name, command);
});

client.once(Events.ClientReady, async (readyClient) => {
  console.log(`🚀 Logged in as ${readyClient.user.tag}`);

  const deployments = readyClient.guilds.cache.map(deployCommands);
  await Promise.all(deployments);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = (interaction.client as ClientWithCommands).commands.get(
    interaction.commandName
  );

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "There was an error while executing this command.",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "There was an error while executing this command.",
        ephemeral: true,
      });
    }
  }
});

client.login(config.DISCORD_TOKEN);
