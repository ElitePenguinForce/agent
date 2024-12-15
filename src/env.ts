const env = {
  MONGOURL: process.env.MONGOURL as string,
  DISCORD_TOKEN: process.env.DISCORD_TOKEN as string,
  OFFTOPIC_WEBHOOK: process.env.OFFTOPIC_WEBHOOK as string,
};

for (const key in env) {
  if (typeof env[key as keyof typeof env] === "undefined") {
    throw new Error(`${key} is not defined`);
  }
}

export default env;
