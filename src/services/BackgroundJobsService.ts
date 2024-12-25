import type { Client } from "discord.js";
import { getJavascriptPaths, importUsingRoot } from "../shared/helpers/path.js";
import type { Job } from "../shared/types/job.js";

class BackgroundJobsService {
  private jobs: Map<string, Job> = new Map();

  private validateJobImport(job: unknown, path: string): asserts job is Job {
    if (
      typeof job !== "object" ||
      job === null ||
      !("data" in job) ||
      !("execute" in job)
    ) {
      throw new Error(`Invalid command import: ${path}`);
    }
  }

  public async loadJobs() {
    const paths = getJavascriptPaths("./dist/src/features/backgroundJobs/jobs/");

    for (const path of paths) {
      const job = (await importUsingRoot(path)).default;
      this.validateJobImport(job, path);
      this.jobs.set(job.data.name, job);
    }
  }

  public getJob(name: string) {
    if (this.jobs.size === 0) {
      throw new Error("Jobs not loaded");
    }

    return this.jobs.get(name);
  }

  public getJobs() {
    if (this.jobs.size === 0) {
      throw new Error("Jobs not loaded");
    }

    return [...this.jobs.values()];
  }

  public async handleJobExecution(name: string, client: Client) {
    const job = this.jobs.get(name);
    if (!job) {
      return;
    }

    try {
      await job.execute(client);
    } catch (error) {
      console.error(error);
    }
  }
}

export default new BackgroundJobsService();
