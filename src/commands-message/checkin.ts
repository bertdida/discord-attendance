import moment from "moment-timezone";
import { Message, EmbedBuilder, Colors } from "discord.js";
import { Op } from "sequelize";

import config from "@/config/app";
import Guild from "@/models/guild";
import Member from "@/models/member";
import Attendance from "@/models/attendance";

export const data = {
  name: "checkin",
  description: `${config.DISCORD_COMMAND_PREFIX}checkin\nUse this command to mark your start of the workday.`,
};

export async function execute(message: Message) {
  if (!message.guild) {
    return;
  }

  const content = message.content.trim();

  if (!content.startsWith(`${config.DISCORD_COMMAND_PREFIX}${data.name}`)) {
    return;
  }

  const [guild] = await Guild.findOrCreate({
    attributes: ["id"],
    where: {
      discordId: message.guild.id,
    },
    defaults: {
      discordId: message.guild.id,
      discordName: message.guild.name,
    },
  });

  const [member] = await Member.findOrCreate({
    attributes: ["id"],
    where: {
      discordId: message.author.id,
    },
    defaults: {
      discordId: message.author.id,
      discordName: message.author.username,
    },
  });

  const startOfToday = moment().startOf("day").toDate();
  const endOfToday = moment().endOf("day").toDate();

  const checkIn = await Attendance.findOne({
    attributes: ["id"],
    where: {
      guildId: guild.id,
      memberId: member.id,
      type: "IN",
      date: {
        [Op.gte]: startOfToday,
        [Op.lte]: endOfToday,
      },
    },
  });

  if (checkIn) {
    return message.reply({
      content: "You have already checked in today.",
      options: {
        ephemeral: true,
      },
    });
  }

  const checkInDate = moment().toDate();

  await Attendance.create({
    guildId: guild.id,
    memberId: member.id,
    type: "IN",
    date: checkInDate,
  });

  const name = message.author.globalName || message.author.displayName;
  const embed = new EmbedBuilder()
    .setColor(Colors.Green)
    .setAuthor({
      name: `${name} has checked in`,
      iconURL: message.author.displayAvatarURL(),
    })
    .setTimestamp(checkInDate);

  if (message.deletable) {
    await message.delete();
  }

  message.channel.send({
    embeds: [embed],
  });
}
