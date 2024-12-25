import type { Job } from "../types/job.js";

type Options = Job;

export default function createJob(job: Options): Job {
  return job;
}
