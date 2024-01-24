import moment from "moment-timezone";
import dotenv from "dotenv";

dotenv.config();

const requiredVariables = <const>[
  "DISCORD_TOKEN",
  "DISCORD_CLIENT_ID",
  "NODE_ENV",
  "ADMIN_ROLES",
];

const optionalVariables = <const>[
  "DATABASE_URL",
  "DB_USER",
  "DB_PASS",
  "DB_NAME",
  "DB_HOST",
];

type RequiredVariables = (typeof requiredVariables)[number];
type OptionalVariables = (typeof optionalVariables)[number];

export type AppProcessEnv = {
  [key in RequiredVariables]: string;
} & {
  [key in OptionalVariables]?: string;
} & {
  TIMEZONE: string;
  NODE_ENV: "production" | "development";
  DISCORD_COMMAND_PREFIX: string;
};

const config = Object.fromEntries(
  requiredVariables.map((variable) => {
    return [variable as RequiredVariables, throwIfNot(process.env, variable)];
  })
) as AppProcessEnv;

optionalVariables.forEach((variable) => {
  if (process.env[variable] !== undefined) {
    config[variable] = process.env[variable];
  }
});

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
