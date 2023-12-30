import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";

import { sequelize } from "@/models/db";
import Guild from "@/models/guild";
import Member from "@/models/member";

const attendanceTypes = ["IN", "OUT"] as const;
type AttendanceType = (typeof attendanceTypes)[number];

export type AttendanceCreationAttributes = InferCreationAttributes<
  Attendance,
  { omit: "id" | "createdAt" | "updatedAt" }
>;

class Attendance extends Model<
  InferAttributes<Attendance>,
  AttendanceCreationAttributes
> {
  declare readonly id: CreationOptional<number>;
  declare guildId: number;
  declare memberId: number;
  declare type: AttendanceType;
  declare note?: string;

  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
}

Attendance.init(
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER.UNSIGNED,
    },
    guildId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      onDelete: "cascade",
      references: {
        model: Guild,
        key: "id",
      },
    },
    memberId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      onDelete: "cascade",
      references: {
        model: Member,
        key: "id",
      },
    },
    type: {
      allowNull: false,
      type: DataTypes.ENUM(...attendanceTypes),
    },
    note: {
      allowNull: true,
      type: DataTypes.TEXT("long"),
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    tableName: "Attendances",
  }
);

export default Attendance;
