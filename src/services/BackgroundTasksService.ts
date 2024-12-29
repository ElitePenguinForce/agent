import type { Client } from "discord.js";
import { getJavascriptPaths, importUsingRoot } from "../shared/helpers/path.js";
import type { Task } from "../shared/types/task.js";

class BackgroundTasksService {
  private tasks: Map<string, Task> = new Map();

  private validateTaskImport(task: unknown, path: string): asserts task is Task {
    if (
      typeof task !== "object" ||
      task === null ||
      !("data" in task) ||
      !("execute" in task)
    ) {
      throw new Error(`Invalid command import: ${path}`);
    }
  }

  public async load() {
    const paths = getJavascriptPaths("./dist/src/app/tasks/");

    for (const path of paths) {
      const task = (await importUsingRoot(path)).default;
      this.validateTaskImport(task, path);
      this.tasks.set(task.data.name, task);
    }
  }

  public getTask(name: string) {
    if (this.tasks.size === 0) {
      throw new Error("Tasks not loaded");
    }

    return this.tasks.get(name);
  }

  public getTasks() {
    if (this.tasks.size === 0) {
      throw new Error("Tasks not loaded");
    }

    return [...this.tasks.values()];
  }

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
