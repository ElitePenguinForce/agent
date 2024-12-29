const createEnv = <T extends Record<string, string | undefined>>(vars: T): Record<keyof T, string> => {
  for (const key in vars) {
    if (typeof vars[key as keyof typeof vars] === "undefined") {
      throw new Error(`${key} is not defined`);
    }
  }
  return vars as Record<keyof T, string>;
}

const env = createEnv({
  MONGOURL: process.env.MONGOURL,
  DISCORD_TOKEN: process.env.DISCORD_TOKEN,
  OFFTOPIC_WEBHOOK: process.env.OFFTOPIC_WEBHOOK,
});

export default env;