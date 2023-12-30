import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";

import { sequelize } from "@/models/db";

export type MemberCreationAttributes = InferCreationAttributes<
  Member,
  { omit: "id" | "createdAt" | "updatedAt" }
>;

class Member extends Model<InferAttributes<Member>, MemberCreationAttributes> {
  declare readonly id: CreationOptional<number>;
  declare discordId: string;
  declare discordName: string;

  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
}

Member.init(
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER.UNSIGNED,
    },
    discordId: {
      allowNull: false,
      unique: true,
      type: DataTypes.STRING,
    },
    discordName: {
      allowNull: false,
      type: DataTypes.STRING,
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
    tableName: "Members",
  }
);

export default Member;
