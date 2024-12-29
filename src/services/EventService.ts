import { getJavascriptPaths, importUsingRoot } from "../shared/helpers/path.js";
import type { DiscordEvent } from "../shared/types/event.js";

class EventService {
  private events: Map<string, DiscordEvent> = new Map();

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

  public async load() {
    const paths = getJavascriptPaths("./dist/src/app/").filter((path) =>
      path.includes("/events/"),
    );

    for (const path of paths) {
      const event = (await importUsingRoot(path)).default;
      this.validateEventImport(event, path);
      this.events.set(event.name, event);
    }
  }

  public getEvent(name: string) {
    if (this.events.size === 0) {
      throw new Error("Events not loaded");
    }

    return this.events.get(name);
  }

  public getEvents() {
    if (this.events.size === 0) {
      throw new Error("Events not loaded");
    }

    return [...this.events.values()];
  }
}

export default new EventService();
