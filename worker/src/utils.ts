function extractRelevantError(fullError: any, language: string): string {
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

export { extractRelevantError };
