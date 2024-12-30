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

/**
 * @description The service that handles the components
 */
class ComponentsService {
  private components: Map<ComponentType, Map<string, AnyComponent>> = new Map();
  private validTypes: ComponentType[] = ["button", "modal"];

  /**
   * @description Validates the component import
   *
   * @param component The component to validate
   * @param path The path of the component
   */
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

  /**
   * @description Gets the component type from the API
   *
   * @param type The type of the component
   * @returns The component type
   */
  private messageComponentTypeFromAPI(
    type: MessageComponentInteraction["component"]["type"],
  ): ComponentType | null {
    return type === DiscordComponentType.Button ? "button" : null;
  }

  /**
   * @description Parses the arguments from the customId
   *
   * @param customId The customId of the component
   */
  private parseArguments(customId: string) {
    const [id, ...args] = customId.split(":");
    return { id: id || customId, args };
  }

  /**
   * @description Loads the components
   */
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

  /**
   * @description Gets a component by its type and id
   *
   * @param type The type of the component
   * @param id The id of the component
   * @returns The component
   */
  public getComponent(type: ComponentType, id: string) {
    return this.components.get(type)?.get(id);
  }

  /**
   * @description Gets all the components of a given type
   *
   * @param type The type of the components
   * @returns The components
   */
  public getComponents(type: ComponentType) {
    return Array.from(this.components.get(type)?.values() || []);
  }

  /**
   * @description Handles the component interaction
   *
   * @param interaction The interaction
   */
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

    const { id, args } = this.parseArguments(interaction.customId);
    const component = this.getComponent(componentType, id);

    if (!component) {
      return;
    }

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
