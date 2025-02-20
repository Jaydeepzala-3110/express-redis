import ProgrammingLanguage from "./enum";

export const LANGUAGE_RESTRICTIONS = {
  [ProgrammingLanguage.JavaScript]: {
    keywords: [
      "process.",
      "global.",
      "Buffer.",
      "setTimeout(",
      "setInterval(",
      "require(",
      "import(",
    ],
    extension: "js",
    command: "node",
  },
  [ProgrammingLanguage.Python]: {
    keywords: ["os.", "sys.", "subprocess.", "threading.", "multiprocessing."],
    extension: "py",
    command: "python3",
  },
  [ProgrammingLanguage.Java]: {
    keywords: ["Runtime.", "System.exit", "ProcessBuilder"],
    extension: "java",
    command: "java",
  },
} as const;

export const COMMON_RESTRICTED_KEYWORDS = [
  "exec(",
  "eval(",
  "child_process",
  "__dirname",
  "__filename",
  "fs.",
  "process.env",
];

export const GETQUEUE = {
  SUBMISSIONS_QUEUE: "SUBMISSIONS_QUEUE",
  SOLUTIONS_QUEUE: "SOLUTIONS_QUEUE",
};
