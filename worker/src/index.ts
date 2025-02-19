import { createClient } from "redis";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { extractRelevantError } from "./utils";

const client = createClient();

async function processSubmission(submission: string) {
  const parsedSubmission = JSON.parse(submission);
  const { problemId, code, language } = parsedSubmission;

  try {
    const result = await evaluateCode(problemId, code, language);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log(`Finished processing submission for problemId ${problemId}.`);
    console.log("Processed Submission:", result);
  } catch (error) {
    console.error("Failed to process submission:", error);
  }
}

async function evaluateCode(
  problemId: string,
  code: string,
  language: string
): Promise<{ success: boolean; error?: string; output?: string }> {
  return new Promise((resolve, reject) => {
    const tempFile = path.join(
      __dirname,
      `temp.${language === "python" ? "py" : "js"}`
    );
    fs.writeFileSync(tempFile, code);

    const command =
      language === "python" ? `python3 ${tempFile}` : `node ${tempFile}`;

    exec(command, { timeout: 5000 }, async (error: any, stdout, stderr) => {
      let result: { success: boolean; error?: string; output?: string };

      if (error || stderr) {
        console.error("Execution error:", error || stderr);
        result = {
          success: false,
          error: extractRelevantError(stderr || error.message, language),
        };
        await client.lPush(
          "solutions",
          JSON.stringify({ problemId, ...result })
        );
        console.log("result", result);
        resolve(result);
      } else {
        const expectedOutput = "1\n2\n3\n4\n5\n6\n7\n8\n9\n10\n";
        const success = stdout.trim() === expectedOutput.trim();
        result = { success, output: stdout.trim() };
        await client.lPush(
          "solutions",
          JSON.stringify({ problemId, ...result })
        );
        resolve(result);
      }
    });
  });
}

async function startWorker() {
  try {
    await client.connect();
    console.log("Worker connected to Redis.");

    // Main loop
    while (true) {
      try {
        const submission = await client.brPop("submissions", 0);
        // @ts-ignore
        await processSubmission(submission.element);
      } catch (error) {
        console.error("Error processing submission:", error);
      }
    }
  } catch (error) {
    console.error("Failed to connect to Redis", error);
  }
}

startWorker();
