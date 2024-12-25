import { Client, type ClientOptions } from "discord.js";
import CommandService from "../../services/CommandService.js";
import ContextService from "../../services/ContextService.js";
import EventService from "../../services/EventService.js";
import InteractionService from "../../services/InteractionService.js";
import safeCall from "../../shared/helpers/safeCall.js";
import sendChangeLogs from "../../shared/helpers/sendChangeLogs.js";
import updateServerList from "../../shared/helpers/updateServersList.js";
import env from "../config/env.js";
import Constants from "../db/models/constants.js";

declare module "discord.js" {
  interface Client {
    updateServersData(updates: string[], force?: boolean): Promise<void>;
  }
}

export default class Agent<T extends boolean = false> extends Client<T> {
  private serversUpdateTimeout: NodeJS.Timeout | undefined;

  constructor(options: ClientOptions) {
    super(options);
  }

  private listen() {
    const events = EventService.getEvents();

    for (const event of events) {
      this.on(event.name, (...args) => {
        safeCall(event.execute, ...args);
      });
    }

    this.on("interactionCreate", (...args) =>
      InteractionService.handleInteraction(...args),
    );
  }

  public override async login(token?: string) {
    token ??= env.DISCORD_TOKEN;

    this.listen();

    return super.login(token);
  }

  public override async updateServersData(updates: string[], force?: boolean) {
    const constants = await Constants.getConstants();
    constants.updateLogs.push(...updates);
    await constants.save();

    if (constants.scheduledUpdate && !force) {
      return;
    }

    const timeDifference =
      Date.now() - constants.lastGuildsChannelUpdate.getTime();

    if (timeDifference > 600000 || force) {
      try {
        if (force) {
          await Constants.updateConstants({
            scheduledUpdate: false,
          });
          clearTimeout(this.serversUpdateTimeout);
        }
        await sendChangeLogs(this);
        await updateServerList(this);
      } catch (err) {
        console.error(err);
      }
      return;
    }

    await Constants.updateConstants({ scheduledUpdate: true });

    this.serversUpdateTimeout = setTimeout(async () => {
      try {
        await sendChangeLogs(this);
        await updateServerList(this);
      } catch (err) {
        console.error(err);
      } finally {
        await Constants.updateConstants({
          scheduledUpdate: false,
        });
      }
    }, 600000 - timeDifference);
  }

  public async updateCommands() {
    await this.application?.commands.set([
      ...CommandService.getCommands().map((command) => command.data),
      ...ContextService.getContexts().map((context) => context.data),
    ]);
  }
}
