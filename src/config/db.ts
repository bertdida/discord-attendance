import path from "path";
import { Options, Dialect } from "sequelize";

import app from "@/config/app";

interface SequelizeOptions extends Options {
  username: string;
  password: string;
  database: string;
  host: string;
  dialect: Dialect;
}

interface Config {
  production: SequelizeOptions;
  development: SequelizeOptions;
  test: SequelizeOptions;
}

const config = <Config>{
  production: {
    username: app.DB_USER,
    password: app.DB_PASS,
    database: app.DB_NAME,
    host: app.DB_HOST,
    dialect: "mysql",
    logging: false,
  },
  get development() {
    return {
      ...this.production,
      dialect: "sqlite",
      host: path.resolve(__dirname, "..", "..", `${app.DB_NAME}.sqlite`),
      logging: console.log,
    };
  },
  get test() {
    return {
      ...this.development,
      database: `${app.DB_NAME}-test`,
      logging: false,
    };
  },
};

export default config;
module.exports = config; // required for sequelize-cli
