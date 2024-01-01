import moment from "moment-timezone";
import { Op } from "sequelize";
import { CommandInteraction, SlashCommandBuilder } from "discord.js";

import Attendance from "@/models/attendance";

export const data = new SlashCommandBuilder()
  .setName("report")
  .setDescription("Displays members' attendance records.")
  .addStringOption((option) =>
    option
      .setName("startdate")
      .setDescription("Start date for the attendance report.")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("enddate")
      .setDescription("End date for the attendance report.")
      .setRequired(true)
  );

export async function execute(interaction: CommandInteraction) {
  if (!interaction.guild) {
    return interaction.reply({
      content: "This command must be used in a guild.",
      ephemeral: true,
    });
  }

  try {
    validateOptions(interaction.options);
  } catch (error) {
    if (error instanceof DateOptionsError) {
      return interaction.reply({
        content: error.message,
        options: {
          ephemeral: true,
        },
      });
    }

    return interaction.reply({
      content: "There was an error while executing this command.",
      options: {
        ephemeral: true,
      },
    });
  }

  const guildMembers = interaction.guild.members.cache.filter((member) => !member.user.bot); // prettier-ignore
  const guildMemberIds = guildMembers.map((member) => member.id);

  const startDateOption = interaction.options.get("startdate")?.value as string;
  const startDate = moment(startDateOption, "MM/DD/YY").startOf("day").toDate();

  const endDateOption = interaction.options.get("enddate")?.value as string;
  const endDate = moment(endDateOption, "MM/DD/YY").endOf("day").toDate();

  const promises = guildMemberIds.map(async (memberId) => {
    return Attendance.findAll({
      where: {
        date: {
          [Op.between]: [startDate, endDate],
        },
      },
      order: [["date", "ASC"]],
      include: [
        {
          required: false,
          association: Attendance.associations.member,
          where: {
            discordId: memberId,
          },
        },
        {
          required: false,
          association: Attendance.associations.guild,
          where: {
            discordId: interaction.guild!.id,
          },
        },
      ],
    });
  });

  const results = (await Promise.all(promises)).flat();
  const groupedByDate = results.reduce((grouped, attendance) => {
    const date = moment(attendance.date).format("MM/DD/YY");
    return {
      ...grouped,
      [date]: [...(grouped[date] || []), attendance],
    };
  }, {} as Record<string, Attendance[]>);

  // TODO: Respond with a message containing the report.

  return interaction.reply({
    content: "This command is not yet implemented.",
    ephemeral: true,
  });
}

class DateOptionsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DateOptionsError";
  }
}

function validateOptions(options: CommandInteraction["options"]) {
  const startDate = options.get("startdate")?.value;
  const endDate = options.get("enddate")?.value;

  if (typeof startDate !== "string" || typeof endDate !== "string") {
    throw new DateOptionsError("Start and end date are required.");
  }

  const datePattern = /^\d{2}\/\d{2}\/\d{2}$/;

  if (!datePattern.test(startDate) || !datePattern.test(endDate)) {
    throw new DateOptionsError(
      "Invalid date format. Please use the format MM/DD/YY."
    );
  }

  const startDateMoment = moment(startDate, "MM/DD/YY", true);
  const endDateMoment = moment(endDate, "MM/DD/YY", true);

  if (!startDateMoment.isValid() || !endDateMoment.isValid()) {
    throw new DateOptionsError("Invalid date. Please use a valid date.");
  }

  if (startDateMoment.isAfter(endDateMoment)) {
    throw new DateOptionsError("Start date cannot be after end date.");
  }
}
