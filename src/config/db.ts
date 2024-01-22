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
    ...(app.DATABASE_URL ? parsePostgresConnectionString(String(app.DATABASE_URL)) : {}),
    logging: false,
    dialect: "postgres",
    protocol: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
  get development() {
    return {
      username: app.DB_USER,
      password: app.DB_PASS,
      database: app.DB_NAME,
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

function parsePostgresConnectionString(connectionString: string): {
  host: string;
  username: string;
  password: string;
  database: string;
} {
  const url = new URL(connectionString);
  return {
    host: url.hostname,
    username: url.username,
    password: url.password,
    database: url.pathname.replace(/^\//, ""),
  };
}

export default config;
module.exports = config; // required for sequelize-cli
