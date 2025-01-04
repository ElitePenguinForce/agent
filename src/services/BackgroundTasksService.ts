import type { Client } from "discord.js";
import { getJavascriptPaths, importUsingRoot } from "../shared/helpers/path.js";
import type { Task } from "../shared/types/task.js";

/**
 * @description The service that handles the background tasks
 */
class BackgroundTasksService {
  private tasks: Map<string, Task> = new Map();

  /**
   * @description Validates the task import
   *
   * @param task The task to validate
   * @param path The path of the task
   */
  private validateTaskImport(
    task: unknown,
    path: string,
  ): asserts task is Task {
    if (
      typeof task !== "object" ||
      task === null ||
      !("data" in task) ||
      !("execute" in task)
    ) {
      throw new Error(`Invalid command import: ${path}`);
    }
  }

  /**
   * @description Loads the tasks
   */
  public async load() {
    const paths = getJavascriptPaths("./dist/src/app/tasks/");

    for (const path of paths) {
      const task = (await importUsingRoot(path)).default;
      this.validateTaskImport(task, path);
      this.tasks.set(task.data.name, task);
    }
  }

  /**
   * @description Gets a task by its name
   *
   * @param name The name of the task
   * @returns The task
   */
  public getTask(name: string) {
    if (this.tasks.size === 0) {
      throw new Error("Tasks not loaded");
    }

    return this.tasks.get(name);
  }

  /**
   * @description Gets all the tasks
   *
   * @returns The tasks
   */
  public getTasks() {
    if (this.tasks.size === 0) {
      throw new Error("Tasks not loaded");
    }

    return [...this.tasks.values()];
  }

  /**
   * @description Handles the task execution
   *
   * @param name The name of the task
   * @param client The client that is running the bot
   */
  public async handleTaskExecution(name: string, client: Client) {
    const task = this.tasks.get(name);
    if (!task) {
      return;
    }

    try {
      await task.execute(client);
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * @description Initializes the tasks
   *
   * @param client The client that is running the bot
   */
  public initTasks(client: Client) {
    const tasks = this.getTasks();
    for (const task of tasks) {
      this.handleTaskExecution(task.data.name, client);

      console.log(`Task ${task.data.name} started`);

      setInterval(() => {
        this.handleTaskExecution(task.data.name, client);
      }, task.data.interval);
    }
  }
}

export default new BackgroundTasksService();
