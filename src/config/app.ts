import moment from "moment-timezone";
import dotenv from "dotenv";

dotenv.config();

const expectedVariables = <const>[
  "DISCORD_TOKEN",
  "DISCORD_CLIENT_ID",
  "DB_USER",
  "DB_PASS",
  "DB_NAME",
  "DB_HOST",
  "DB_NAME",
  "NODE_ENV",
];

type ExpectedVariables = (typeof expectedVariables)[number];

export type AppProcessEnv = {
  [key in ExpectedVariables]: string;
} & {
  TIMEZONE: string;
  NODE_ENV: "production" | "development";
  DISCORD_COMMAND_PREFIX: string;
};

const config = Object.fromEntries(
  expectedVariables.map((variable) => {
    return [variable as ExpectedVariables, throwIfNot(process.env, variable)];
  })
) as AppProcessEnv;

function throwIfNot<T, K extends keyof T>(obj: Partial<T>, prop: K): T[K] {
  if (obj[prop] === undefined || obj[prop] === null) {
    throw new Error(`Environment is missing variable: ${prop.toString()}`);
  } else {
    return obj[prop] as T[K];
  }
}

const configObject = {
  ...config,
  TIMEZONE: "Asia/Manila",
  DISCORD_COMMAND_PREFIX: process.env.DISCORD_COMMAND_PREFIX || ">",
};

moment.tz.setDefault(configObject.TIMEZONE);
export default configObject;
