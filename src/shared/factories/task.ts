import type { Task } from "../types/task.js";

type Options = Task;

export default function createTask(task: Options): Task {
  return task;
}
