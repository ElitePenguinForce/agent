import { Client, type ParseClient, ParseMiddlewares } from "seyfert";
import database from "./database";
import middlewares from "./middlewares";
import onMiddlewaresError from "./shared/defaults/commands/onMiddlewaresError";
import onRunError from "./shared/defaults/commands/onRunError";

const client = new Client(
  {
    commands: {
      defaults: { onRunError, onMiddlewaresError },
    },
  },
);

client.setServices({ middlewares });

async function main() {
  await database.connect();
  await client.start();
  await client.uploadCommands({ cachePath: "./commands.json" });
}

main();

declare module "seyfert" {
  interface UsingClient extends ParseClient<Client<true>> {}
  interface RegisteredMiddlewares
    extends ParseMiddlewares<typeof middlewares> {}
}
