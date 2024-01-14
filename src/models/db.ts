import dotenv from "dotenv";
import { Sequelize } from "sequelize";

import appConfig from "@/config/app";
import dbConfig from "@/config/db";

dotenv.config();

const config = dbConfig[appConfig.NODE_ENV];
const sequelize =
  config.database === appConfig.DATABASE_URL
    ? new Sequelize(config.database, config)
    : new Sequelize(config.database, config.username, config.password, config);

export { sequelize, Sequelize };
