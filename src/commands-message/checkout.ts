import moment from "moment-timezone";
import { Message, EmbedBuilder, Colors } from "discord.js";
import { Op } from "sequelize";

import config from "@/config/app";
import Guild from "@/models/guild";
import Member from "@/models/member";
import Attendance from "@/models/attendance";

export const data = {
  name: "checkout",
  description: "Logs your daily work end time.",
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

  const checkoutWithDatePattern = new RegExp(`^${command} (?<dateArg>\\S+)`);
  const match = checkoutWithDatePattern.exec(content);

  let checkoutDate = moment().format("MM/DD/YY");
  let checkoutNote = content.replace(command, "").trim();

  if (match) {
    const dateArg = match.groups?.dateArg || "";

    try {
      validateCheckoutDateArg(dateArg);
    } catch (error) {
      if (error instanceof DateArgError) {
        return message.reply({
          content: error.message,
          options: {
            ephemeral: true,
          },
        });
      }

      return message.reply({
        content: "There was an error while executing this command.",
        options: {
          ephemeral: true,
        },
      });
    }

    checkoutDate = dateArg;
    checkoutNote = content.replace(`${command} ${dateArg}`, "").trim();
  }

  if (!checkoutNote.length) {
    return message.reply({
      content: "Please provide a summary of your work to check out.",
      options: {
        ephemeral: true,
      },
    });
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

  const startOfDay = moment(checkoutDate, "MM/DD/YY").startOf("day").toDate();
  const endOfDay = moment(checkoutDate, "MM/DD/YY").endOf("day").toDate();

  const checkIn = await Attendance.findOne({
    where: {
      memberId: member.id,
      guildId: guild.id,
      type: "IN",
      date: {
        [Op.gte]: startOfDay,
        [Op.lte]: endOfDay,
      },
    },
  });

  if (!checkIn) {
    return message.reply({
      content:
        "You have not checked in yet. Please check in first before checking out.",
      options: {
        ephemeral: true,
      },
    });
  }

  const checkOut = await Attendance.findOne({
    where: {
      memberId: member.id,
      guildId: guild.id,
      type: "OUT",
      date: {
        [Op.gte]: startOfDay,
        [Op.lte]: endOfDay,
      },
    },
  });

  if (checkOut) {
    return message.reply({
      content: "You have already checked out today.",
      options: {
        ephemeral: true,
      },
    });
  }

  const now = moment();
  const checkoutDateWithTime = moment(checkoutDate, "MM/DD/YY");
  checkoutDateWithTime.hour(now.hour());
  checkoutDateWithTime.minute(now.minute());
  checkoutDateWithTime.second(now.second());
  checkoutDateWithTime.millisecond(now.millisecond());

  await Attendance.create({
    guildId: guild.id,
    memberId: member.id,
    type: "OUT",
    note: checkoutNote,
    date: checkoutDateWithTime.toDate(),
  });

  const name = message.author.globalName || message.author.displayName;
  const embed = new EmbedBuilder()
    .setColor(Colors.Red)
    .setAuthor({
      name: `${name} has checked out`,
      iconURL: message.author.displayAvatarURL(),
    })
    .setTimestamp(checkoutDateWithTime.toDate())
    .addFields({
      name: "Work Summary",
      value: "```\n" + checkoutNote + "\n```",
    });

  if (message.deletable) {
    await message.delete();
  }

  message.channel.send({
    embeds: [embed],
  });
}

class DateArgError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DateArgError";
  }
}

function validateCheckoutDateArg(dateArg: string) {
  const datePattern = /^\d{2}\/\d{2}\/\d{2}$/;

  if (!datePattern.test(dateArg)) {
    throw new DateArgError(
      `Invalid date format. Please use the format \`${command}\` MM/DD/YY`
    );
  }

  const dateMoment = moment(dateArg, "MM/DD/YY");

  if (!dateMoment.isValid()) {
    throw new DateArgError("Invalid date. Please use a valid date.");
  }

  if (dateMoment.startOf("day").isAfter(moment().startOf("day"))) {
    throw new DateArgError(
      "Invalid date. You can only check out for dates up to today."
    );
  }

  if (dateMoment.isBefore(moment().subtract(3, "days"))) {
    throw new DateArgError(
      "Invalid date. You can only check out for dates up to 3 days ago."
    );
  }
}
