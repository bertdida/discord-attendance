import moment from "moment-timezone";
import dotenv from "dotenv";

dotenv.config();

const expectedVariables = <const>[
  "DISCORD_TOKEN",
  "DISCORD_CLIENT_ID",
  "NODE_ENV",
];

type ExpectedVariables = (typeof expectedVariables)[number];

export type AppProcessEnv = {
  [key in ExpectedVariables]: string;
} & {
  TIMEZONE: string;
  NODE_ENV: "production" | "development";
  DISCORD_COMMAND_PREFIX: string;
  DATABASE_URL?: string;
  DB_USER?: string;
  DB_PASS?: string;
  DB_NAME?: string;
  DB_HOST?: string;
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
