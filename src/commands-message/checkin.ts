import moment from "moment-timezone";
import { Message, EmbedBuilder, Colors } from "discord.js";
import { Op } from "sequelize";

import Guild from "@/models/guild";
import Member from "@/models/member";
import Attendance from "@/models/attendance";

export const data = {
  name: "checkin",
  description: "Logs your daily work start time.",
};

export async function execute(message: Message) {
  if (!message.guild) {
    return;
  }

  const content = message.content.trim();

  if (!content.startsWith("/checkin")) {
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

  const embed = new EmbedBuilder()
    .setColor(Colors.Green)
    .setAuthor({
      name: `${message.author.globalName} has checked in`,
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
