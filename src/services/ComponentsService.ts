import {
  ComponentType as DiscordComponentType,
  type Interaction,
  type MessageComponentInteraction,
} from "discord.js";
import { getJavascriptPaths, importUsingRoot } from "../shared/helpers/path.js";
import type {
  AnyComponent,
  ComponentType,
} from "../shared/types/components.js";

class ComponentsService {
  private components: Map<ComponentType, Map<string, AnyComponent>> = new Map();
  private validTypes: ComponentType[] = ["button", "modal"];

  private validateComponentImport(
    component: unknown,
    path: string,
  ): asserts component is AnyComponent {
    if (
      typeof component !== "object" ||
      component === null ||
      !("id" in component) ||
      !("execute" in component) ||
      !("create" in component) ||
      !("type" in component) ||
      typeof component.type !== "string" ||
      !this.validTypes.includes(component.type as ComponentType)
    ) {
      throw new Error(`Invalid component import: ${path}`);
    }
  }

  private messageComponentTypeFromAPI(
    type: MessageComponentInteraction["component"]["type"],
  ): ComponentType | null {
    return type === DiscordComponentType.Button ? "button" : null;
  }

  private parseArguments(customId: string): string[] {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, ...args] = customId.split(":");
    return args;
  }

  public async load() {
    const paths = getJavascriptPaths("./dist/src/app/").filter((path) =>
      path.includes("/components/"),
    );

    for (const path of paths) {
      const component = (await importUsingRoot(path)).default;
      this.validateComponentImport(component, path);

      if (!this.components.has(component.type)) {
        this.components.set(
          component.type,
          new Map([[component.id, component]]),
        );
      }

      this.components.get(component.type)?.set(component.id, component);
    }
  }

  public getComponent(type: ComponentType, id: string) {
    return this.components.get(type)?.get(id);
  }

  public getComponents(type: ComponentType) {
    return Array.from(this.components.get(type)?.values() || []);
  }

  public async handleComponentInteraction(interaction: Interaction) {
    if (!interaction.isMessageComponent() && !interaction.isModalSubmit()) {
      return;
    }

    const componentType = interaction.isModalSubmit()
      ? "modal"
      : this.messageComponentTypeFromAPI(interaction.component.type);

    if (!componentType) {
      return;
    }

    const component = this.getComponent(componentType, interaction.customId);

    if (!component) {
      return;
    }

    const args = this.parseArguments(interaction.customId);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await component.execute(interaction as any, ...args);
    } catch (error) {
      console.error(error);
      const reply = interaction.replied
        ? interaction.followUp
        : interaction.reply;
      await reply({
        content: "Ocorreu um erro ao processar o componente",
        ephemeral: true,
      });
    }
  }
}

export default new ComponentsService();
