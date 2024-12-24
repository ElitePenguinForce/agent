import {
  ApplicationCommandType,
  Client,
  type ClientOptions,
  Collection,
} from "discord.js";
import { sep } from "path";
import Constants from "../db/models/constants.js";
import env from "../env.js";
import { getJavascriptPaths } from "../utils/path.js";
import sendChangeLogs from "../utils/sendChangeLogs.js";
import updateServerList from "../utils/updateServersList.js";
import type { Autocomplete } from "./types/autocomplete.js";
import type { Command } from "./types/command.js";
import type { Component as TComponent } from "./types/components.js";
import type { DiscordEvent } from "./types/event.js";
import type { Modal } from "./types/modal.js";
import type { UserContext } from "./types/user-context.js";

declare module "discord.js" {
  interface Client {
    autocompletes: Collection<string, Autocomplete>;
    commands: Collection<string, Command>;
    modals: Collection<string, Modal>;
    contexts: {
      [ApplicationCommandType.User]: Collection<string, UserContext>;
    };
    components: {
      buttons: Collection<string, TComponent<"button">>;
    };
    updateServersData(updates: string[], force?: boolean): Promise<void>;
  }
}

export default class Agent<T extends boolean = false> extends Client<T> {
  private serversUpdateTimeout: NodeJS.Timeout | undefined;

  public override autocompletes = new Collection<string, Autocomplete>();
  public override commands = new Collection<string, Command>();
  public override modals = new Collection<string, Modal>();
  public override contexts = {
    [ApplicationCommandType.User]: new Collection<string, UserContext>(),
  };
  public override components = {
    buttons: new Collection<string, TComponent<"button">>(),
  };

  constructor(options: ClientOptions) {
    super(options);
  }

  private validateEventImport(
    event: unknown,
    path: string,
  ): asserts event is DiscordEvent {
    if (
      typeof event !== "object" ||
      event === null ||
      !("name" in event) ||
      !("execute" in event)
    ) {
      throw new Error(`Invalid event import: ${path}`);
    }
  }

  private validateCommandImport(
    command: unknown,
    path: string,
  ): asserts command is Command {
    if (
      typeof command !== "object" ||
      command === null ||
      !("data" in command) ||
      !("execute" in command)
    ) {
      throw new Error(`Invalid command import: ${path}`);
    }
  }

  private validateContextImport(
    context: unknown,
    path: string,
  ): asserts context is UserContext {
    if (
      typeof context !== "object" ||
      context === null ||
      !("data" in context) ||
      !("execute" in context)
    ) {
      throw new Error(`Invalid context import: ${path}`);
    }
  }

  private validateModalImport(
    modal: unknown,
    path: string,
  ): asserts modal is Modal {
    if (
      typeof modal !== "object" ||
      modal === null ||
      !("data" in modal) ||
      !("execute" in modal)
    ) {
      throw new Error(`Invalid modal import: ${path}`);
    }
  }

  private validateComponentImport(
    component: unknown,
    path: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): asserts component is TComponent<any> {
    if (
      typeof component !== "object" ||
      component === null ||
      !("id" in component) ||
      !("create" in component) ||
      !("execute" in component)
    ) {
      throw new Error(`Invalid component import: ${path}`);
    }
  }

  private validateAutocompleteImport(
    autocomplete: unknown,
    path: string,
  ): asserts autocomplete is Autocomplete {
    if (
      typeof autocomplete !== "object" ||
      autocomplete === null ||
      !("execute" in autocomplete)
    ) {
      throw new Error(`Invalid autocomplete import: ${path}`);
    }
  }

  private async loadCommands() {
    console.time("Loaded commands");
    const paths = getJavascriptPaths("./dist/commands");

    for (const path of paths) {
      const command = (await import(`../commands/${path}`)).default;

      this.validateCommandImport(command, path);

      if (command.active === false) {
        continue;
      }

      this.commands.set(command.data.name, command);
    }

    console.timeEnd("Loaded commands");
  }

  private async loadEvents() {
    console.time("Loaded events");
    const paths = getJavascriptPaths("./dist/events");

    for (const path of paths) {
      const event = (await import(`../events/${path}`)).default;

      this.validateEventImport(event, path);

      this.on(event.name, (...args) => {
        try {
          event.execute(...args);
        } catch (error) {
          console.error(error);
        }
      });
    }

    console.timeEnd("Loaded events");
  }

  private async loadContexts() {
    console.time("Loaded contexts");
    const paths = getJavascriptPaths("./dist/contexts");

    for (const path of paths) {
      const context = (await import(`../contexts/${path}`)).default;
      this.validateContextImport(context, path);
      this.contexts[context.data.type].set(context.data.name, context);
    }

    console.timeEnd("Loaded contexts");
  }

  private async loadModals() {
    console.time("Loaded modals");
    const paths = getJavascriptPaths("./dist/modals");

    for (const path of paths) {
      const modal = (await import(`../modals/${path}`)).default;
      this.validateModalImport(modal, path);
      this.modals.set(modal.data.customId, modal);
    }

    console.timeEnd("Loaded modals");
  }

  private async loadComponents() {
    console.time("Loaded components");
    const paths = getJavascriptPaths("./dist/components");

    for (const path of paths) {
      const component = (await import(`../components/${path}`)).default;
      this.validateComponentImport(component, path);

      const type = path.split(sep).shift()?.split(".")[0];
      if (!type) {
        throw new Error(`Invalid component type: ${path}`);
      }

      this.components[type as keyof typeof this.components].set(
        component.id,
        component,
      );
    }

    console.timeEnd("Loaded components");
  }

  private async loadAutocompletes() {
    console.time("Loaded autocompletes");
    const paths = getJavascriptPaths("./dist/autocompletes");

    for (const path of paths) {
      const autocomplete = (await import(`../autocompletes/${path}`)).default;
      this.validateAutocompleteImport(autocomplete, path);
      this.autocompletes.set(path.replace(".js", ""), autocomplete);
    }

    console.timeEnd("Loaded autocompletes");
  }

  public override async login(token?: string) {
    token ??= env.DISCORD_TOKEN;

    await Promise.all([
      this.loadCommands(),
      this.loadContexts(),
      this.loadModals(),
      this.loadComponents(),
      this.loadAutocompletes(),
    ]);
    await this.loadEvents();

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
      ...this.commands.map((command) => command.data),
      ...Object.values(this.contexts)
        .flatMap((collection) => Array.from(collection.values()))
        .map((context) => context.data),
    ]);
  }
}
