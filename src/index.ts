import { Client, Events, GatewayIntentBits, Collection } from "discord.js";

import config from "@/config/app";
import db from "@/models";
import commands, { Command } from "@/commands";
import commandsMessage from "@/commands-message";
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

  const guilds = await readyClient.guilds.fetch();
  const guildsArray = guilds.map((guild) => guild) as any[];

  const promises = guildsArray.map(deployCommands);
  const results = await Promise.allSettled(promises);

  results.forEach((result) => {
    if (result.status === "rejected") {
      console.error(result.reason);
    }
  });
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) {
    return;
  }

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

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) {
    return;
  }

  const content = message.content.trim();
  const command = commandsMessage.find((command) => {
    return content.startsWith(`/${command.data.name}`);
  });

  if (command) {
    try {
      await command.execute(message);
    } catch (error) {
      console.error(error);
      message.reply({
        content: "There was an error while executing this command.",
      });
    }
  }
});

db.sequelize
  .authenticate()
  .then(() => {
    client.login(config.DISCORD_TOKEN);
  })
  .catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
