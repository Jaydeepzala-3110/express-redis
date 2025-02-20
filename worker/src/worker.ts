import { CodeExecutor } from "./codeExecutor";
import { RedisManager } from "./redisClient";
import { Submissions } from "./utils/interface";

export class Worker {
  private codeExecutor: CodeExecutor;
  private redisManager: RedisManager;
  private isRunning: boolean = false;

  constructor() {
    this.codeExecutor = new CodeExecutor();
    this.redisManager = new RedisManager();
  }

  private async processSubmission(submissionData: string): Promise<void> {
    try {
      const submission: Submissions = JSON.parse(submissionData);
      const result = await this.codeExecutor.evaluateCode(submission);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await this.redisManager.storeSolution(submission.problemId, result);

      console.log(`Processed submission ${submission.problemId}:`, result);
    } catch (error) {
      console.error("Failed to process submission:", error);
    }
  }

  async start(): Promise<void> {
    try {
      await this.redisManager.connect();
      console.log("Worker connected to Redis");

      this.isRunning = true;
      while (this.isRunning) {
        try {
          const submission = await this.redisManager.getNextSubmission();
          if (submission) {
            await this.processSubmission(submission);
          }
        } catch (error) {
          console.error("Error processing submission:", error);
        }
      }
    } catch (error) {
      console.error("Failed to start worker:", error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    this.isRunning = false;
    await this.redisManager.disconnect();
  }
}

async function main() {
  console.log("inside main");
  const worker = new Worker();
  worker.start();
}

main();
