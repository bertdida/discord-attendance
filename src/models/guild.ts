import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";

import { sequelize } from "./db";

export type GuildCreationAttributes = InferCreationAttributes<
  Guild,
  { omit: "id" | "createdAt" | "updatedAt" }
>;

class Guild extends Model<InferAttributes<Guild>, GuildCreationAttributes> {
  declare readonly id: CreationOptional<number>;
  declare discordId: string;
  declare discordName: string;

  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
}

Guild.init(
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER.UNSIGNED,
    },
    discordId: {
      unique: true,
      allowNull: false,
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
    tableName: "Guilds",
  }
);

export default Guild;
