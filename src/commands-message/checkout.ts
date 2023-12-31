import moment from "moment";
import { Message } from "discord.js";
import { Op } from "sequelize";

import Guild from "@/models/guild";
import Member from "@/models/member";
import Attendance from "@/models/attendance";

export const data = {
  name: "checkout",
  description: "Logs your daily work end time.",
};

export async function execute(message: Message) {
  if (!message.guild) {
    return;
  }

  const content = message.content.trim();

  if (!content.startsWith("/checkout")) {
    return;
  }

  const checkoutWithDatePattern = /^\/checkout (?<dateArg>\S+)/;
  const match = checkoutWithDatePattern.exec(content);

  let checkoutDate = moment().format("MM/DD/YY");
  let checkoutNote = content.replace("/checkout", "").trim();

  if (match) {
    const dateArg = match.groups?.dateArg || "";

    try {
      validateCheckoutDateArg(dateArg);
    } catch (error) {
      if (error instanceof DateArgError) {
        return message.reply(error.message);
      }

      return message.reply("There was an error while executing this command.");
    }

    checkoutDate = dateArg;
    checkoutNote = content.replace(`/checkout ${dateArg}`, "").trim();
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
      type: "IN",
      createdAt: {
        [Op.gte]: startOfDay,
        [Op.lte]: endOfDay,
      },
    },
  });

  if (!checkIn) {
    return message.reply(
      "You have not checked in yet. Please check in first before checking out."
    );
  }

  const checkOut = await Attendance.findOne({
    where: {
      memberId: member.id,
      type: "OUT",
      createdAt: {
        [Op.gte]: startOfDay,
        [Op.lte]: endOfDay,
      },
    },
  });

  if (checkOut) {
    return message.reply("You have already checked out.");
  }

  await Attendance.create({
    guildId: guild.id,
    memberId: member.id,
    type: "OUT",
    note: checkoutNote,
  });

  return message.reply("You have successfully checked out.");
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
      "Invalid date format. Please use the format `/checkout MM/DD/YY`."
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
