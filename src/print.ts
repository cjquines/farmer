import * as F from "./types/index.js";

type AnyPythonType = F.PythonType<string, any>;

function printValue(
  value:
    | F.Bool
    | F.Float
    | F.Int
    | F.None
    | F.Str
    | F.Dict<AnyPythonType, AnyPythonType>
    | F.List<AnyPythonType>
    | F.Tuple<AnyPythonType, AnyPythonType>,
): string {
  if (
    typeof value === "object" &&
    value !== null &&
    "method" in value &&
    typeof value.method === "string" &&
    "params" in value &&
    Array.isArray(value.params) &&
    "returns" in value &&
    typeof value.returns === "string"
  ) {
    const params = value.params.map((param) => printValue(param));
    return `${value.method}(${params.join(", ")})`;
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => printValue(item)).join(", ")}]`;
  }
  switch (typeof value) {
    case "object": {
      if (value === null) {
        return "None";
      }

      const entries = Object.entries(value).map(
        ([k, v]) => `${printValue(k)}: ${printValue(v)}`,
      );
      return `{ ${entries.join(", ")} }`;
    }
    case "string": {
      // ughh
      const isEnum =
        Object.values(F.Directions).includes(value as any) ||
        (value.includes(".") && value[0]?.toUpperCase() === value[0]);
      return isEnum ? value : `"${value}"`;
    }
    case "number": {
      return value.toString();
    }
    case "boolean": {
      return value ? "True" : "False";
    }
  }
}

export function printProgram(program: AnyPythonType[]): string {
  return program.map((call) => printValue(call)).join("\n");
}
