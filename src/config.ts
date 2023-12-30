import dotenv from "dotenv";

dotenv.config();

const expectedVariables = <const>["DISCORD_TOKEN", "DISCORD_CLIENT_ID"];

type ExpectedVariables = (typeof expectedVariables)[number];

export type AppProcessEnv = {
  [key in ExpectedVariables]: string;
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

export default config;
