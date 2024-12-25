import BackgroundJobsService from "../../../services/BackgroundJobsService.js";
import createEvent from "../../../shared/factories/event.js";

export default createEvent({
  name: "ready",
  execute: async (client) => {
    const jobs = BackgroundJobsService.getJobs();
    for (const job of jobs) {
      BackgroundJobsService.handleJobExecution(job.data.name, client);

      console.log(`Job ${job.data.name} started`);

      setInterval(() => {
        BackgroundJobsService.handleJobExecution(job.data.name, client);
      }, job.data.interval);
    }
  },
});
