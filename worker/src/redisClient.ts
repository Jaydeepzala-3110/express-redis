import { createClient } from "redis";
import { GETQUEUE } from "./utils/config";
import { EvaluationResult } from "./utils/interface";

export class RedisManager {
  private client;

  constructor() {
    this.client =  createClient();

    this.client.on("error", (error: any) => {
      console.error("Redis Client Error:", error);
    });
  }

  async connect(): Promise<void> {
    await this.client.connect();
    console.log("client is connected.");
  }

  async disconnect(): Promise<void> {
    await this.client.disconnect();
  }

  async getNextSubmission(): Promise<string> {
    const result = await this.client.brPop(GETQUEUE.SUBMISSIONS_QUEUE, 0);

    console.log("result in getNextSubmission", result);

    return result?.element;
  }

  async storeSolution(
    problemId: string,
    result: EvaluationResult
  ): Promise<void> {
    await this.client.lPush(
      GETQUEUE.SOLUTIONS_QUEUE,
      JSON.stringify({ problemId, ...result })
    );
  }
}
