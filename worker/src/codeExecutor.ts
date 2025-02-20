import { exec } from "child_process";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import {
  COMMON_RESTRICTED_KEYWORDS,
  LANGUAGE_RESTRICTIONS,
} from "./utils/config";
import ProgrammingLanguage from "./utils/enum";
import { EvaluationResult, Submissions } from "./utils/interface";
import { stderr } from "process";

export class CodeExecutor {
  private readonly tempDir: string;
  private readonly maxExecutionTime: number = 10000;
  private readonly maxCodeLength: number = 10000;

  constructor() {
    this.tempDir = path.join(__dirname, "temp");
  }

  async createTempFolder(): Promise<void> {
    try {
      if (!fs.existsSync(this.tempDir)) {
        fs.mkdirSync(this.tempDir);
      }
      console.log("created temp folder");
    } catch (error) {
      console.error("Failed to create temp directory:", error);
      throw error;
    }
  }

  private createTempFile(code: string, language: ProgrammingLanguage): string {
    try {
      const hash = crypto.randomBytes(5).toString("hex");
      const ext = LANGUAGE_RESTRICTIONS[language].extension;
      const fileName = `${hash}.${ext}`;
      const filePath = path.join(this.tempDir, fileName);

      fs.writeFileSync(filePath, code);
      console.log("creted temp file", filePath);

      return filePath;
    } catch (error) {
      console.error("Failed to create temp file:", error);
      throw error;
    }
  }

  private cleanupTempFile(filepath: string): void {
    try {
      fs.unlinkSync(filepath);
      console.log("deleting file", filepath);
    } catch (error) {
      console.error("Failed to cleanup temp file:", error);
    }
  }

  private async executeCommand(
    command: string,
    timeout: number
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();

      //    { timeout }
      exec(command, (error, stdout, stderr) => {
        const executionTime = Date.now() - startTime;

        console.log("EXECUTING COMMMAND");
        if (error) {
          reject(new Error(stderr || error?.message));
          // } else if (executionTime > timeout) {
          //   reject(new Error("Execution timeout"));
        } else {
          resolve(stdout);
        }
      });
    });
  }

  private validateCode(code: string, language: ProgrammingLanguage): void {
    if (!code || code.trim().length === 0) {
      throw new Error("Code submission cannot be empty");
    }
    // if (code.length > this.maxCodeLength) {
    //   throw new Error(
    //     `Code length exceeds maximum limit of ${this.maxCodeLength} characters`
    //   );
    // }

    for (const keyword of COMMON_RESTRICTED_KEYWORDS) {
      if (code.includes(keyword)) {
        throw new Error(`Restricted keyword found: ${keyword}`);
      }
    }

    const languageRestrictions = LANGUAGE_RESTRICTIONS[language];
    if (!languageRestrictions) {
      throw new Error(`Unsupported programming language: ${language}`);
    }

    for (const keyword of languageRestrictions.keywords) {
      if (code.includes(keyword)) {
        throw new Error(
          `Language-specific restricted keyword found: ${keyword}`
        );
      }
    }
  }

  private async validateOutput(
    command: string,
    expectedOutput: string,
    timeout: number
  ): Promise<EvaluationResult> {
    try {
      const startTime = Date.now();
      const output = await this.executeCommand(command, timeout);
      const executionTime = Date.now() - startTime;

      const success = output.trim() === expectedOutput.trim();

      return {
        success,
        output: output.trim(),
        executionTime,
      };
    } catch (error) {
      return {
        success: false,
        error:
          stderr || error instanceof Error
            ? error.message
            : "Unknown error occurred",
        executionTime: 0,
      };
    }
  }

  async evaluateCode(submission: Submissions): Promise<EvaluationResult> {
    let tempFilePath: string | null = null;

    try {
      if (!(submission.language in ProgrammingLanguage)) {
        throw new Error(
          `Unsupported programming language: ${submission.language}`
        );
      }

      const language = ProgrammingLanguage[submission.language];

      this.validateCode(submission.code, language);

      await this.createTempFolder();
      const languageConfig = LANGUAGE_RESTRICTIONS[language];
      tempFilePath = this.createTempFile(submission.code, language);
      const command = `${languageConfig.command} ${tempFilePath}`;

      const expectedOutput = "1\n2\n3\n4\n5\n6\n7\n8\n9\n10\n";
      const result = await this.validateOutput(
        command,
        expectedOutput,
        this.maxExecutionTime
      );

      console.log("result", result);

      return {
        ...result,
        error: result.error,
        executionTime: result.executionTime,
      };
    } catch (error) {
      return {
        success: false,
        error: this.extractRelevantError(
          error || stderr,
          ProgrammingLanguage[submission.language]
        ),
        executionTime: 0,
      };
    } finally {
      if (tempFilePath) {
        // this.cleanupTempFile(tempFilePath);
      }
    }
  }

  extractRelevantError(fullError: any, language: string): string {
    if (typeof fullError !== "string") {
      return "Unknown error";
    }

    let errorMatch;

    if (language === "js") {
      errorMatch = fullError.match(
        /(SyntaxError|ReferenceError|TypeError|RangeError|EvalError|URIError|InternalError|AggregateError):[^\n]+/
      );
    } else if (language === "python") {
      errorMatch = fullError.match(
        /(SyntaxError|IndentationError|TypeError|ValueError|NameError|IndexError|KeyError|AttributeError|ModuleNotFoundError|ImportError|ZeroDivisionError|RuntimeError|RecursionError|FileNotFoundError|EOFError):[^\n]+/
      );
    }

    return errorMatch ? errorMatch[0] : "Unknown error";
  }
}
