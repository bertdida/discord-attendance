import moment from "moment-timezone";
import { Op } from "sequelize";
import { CommandInteraction, SlashCommandBuilder } from "discord.js";

import config from "@/config/app";
import Guild from "@/models/guild";
import Member from "@/models/member";
import Attendance from "@/models/attendance";

export const data = new SlashCommandBuilder()
  .setName("checkin")
  .setDescription("Logs your daily work start time.");

export async function execute(interaction: CommandInteraction) {
  if (!interaction.guild) {
    return interaction.reply("This command must be used in a guild.");
  }

  const [guild] = await Guild.findOrCreate({
    attributes: ["id"],
    where: {
      discordId: interaction.guild.id,
    },
    defaults: {
      discordId: interaction.guild.id,
      discordName: interaction.guild.name,
    },
  });

  const [member] = await Member.findOrCreate({
    attributes: ["id"],

    where: {
      discordId: interaction.user.id,
    },
    defaults: {
      discordId: interaction.user.id,
      discordName: interaction.user.username,
    },
  });

  const startOfToday = moment().tz(config.TIMEZONE).startOf("day").toDate();
  const endOfToday = moment().tz(config.TIMEZONE).endOf("day").toDate();

  const attendance = await Attendance.findOne({
    where: {
      guildId: guild.id,
      memberId: member.id,
      type: "IN",
      createdAt: {
        [Op.gte]: startOfToday,
        [Op.lte]: endOfToday,
      },
    },
  });

  if (attendance) {
    return interaction.reply("You have already checked in today.");
  }

  await Attendance.create({
    guildId: guild.id,
    memberId: member.id,
    type: "IN",
  });

  return interaction.reply("You have checked in successfully.");
}
