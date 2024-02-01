import { Message, EmbedBuilder, Colors } from "discord.js";

import config from "@/config/app";
import commands from "@/commands";
import commandsMessage from "@/commands-message";

export const data = {
  name: "help",
  description: `${config.DISCORD_COMMAND_PREFIX}help\nShow this message.`,
};

const command = `${config.DISCORD_COMMAND_PREFIX}${data.name}`;

export async function execute(message: Message) {
  if (!message.guild) {
    return;
  }

  const content = message.content.trim();

  if (!content.startsWith(command)) {
    return;
  }

  let output = "";
  [...commands, ...commandsMessage].forEach((command) => {
    output += `${command.data.description}\n\n`;
  });

  const embed = new EmbedBuilder()
    .setColor(Colors.Blue)
    .setTitle(`Help for ${config.BOT_NAME}`)
    .setTimestamp()
    .addFields({
      name: "Here are the available commands:",
      value: output,
    });

  message.channel.send({
    embeds: [embed],
  });
}
