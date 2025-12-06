import { TS } from "../printer/index.js";
import { parseAST } from "./ast.js";

export function parseBuiltins(
  builtins: string,
): { filename: string; content: string }[] {
  const { enums, methods } = parseAST(builtins);

  const files: { filename: string; content: string }[] = [];

  const typeToModule = new Map<string, string>();
  for (const enumDef of enums) {
    const baseType = enumDef.items[0]?.type;
    if (baseType) {
      typeToModule.set(baseType, `./${enumDef.name.toLowerCase()}.js`);
    }
  }

  for (const enumDef of enums) {
    if (enumDef.items.length === 0) {
      continue;
    }

    const baseType = enumDef.items[0]?.type ?? enumDef.name;
    const entries = enumDef.items.map((item) => [
      normalizeEnumKey(item.name),
      { comment: item.docstring, value: TS.Literal(item.name) },
    ]) as Parameters<typeof TS.Literal.Object>[0];

    const content = [
      TS.Import({
        type: true,
        names: ["PythonType"],
        module: "./python.js",
      }),
      TS.Declaration({
        export: true,
        kind: "const",
        name: enumDef.name,
        value: TS.Literal.Object(entries),
        cast: "const",
      }),
      TS.Declaration({
        export: true,
        kind: "type",
        name: `TS${baseType}`,
        value: `(typeof ${enumDef.name})[keyof typeof ${enumDef.name}]`,
      }),
      TS.Declaration({
        export: true,
        kind: "type",
        name: baseType,
        value: `PythonType<"${baseType}", TS${baseType}>`,
      }),
    ].join("\n\n");

    files.push({
      filename: `${enumDef.name.toLowerCase()}.ts`,
      content,
    });
  }

  if (methods.length > 0) {
    const imports = new Map<string, Set<string>>();
    const pythonTypeImports = new Set<string>();
    const knownTypes = new Set(typeToModule.keys());

    const methodDeclarations = methods.map((method) => {
      const params = method.params.map((param) => {
        const tsType = mapPythonType(param.type, knownTypes);
        registerImports(tsType, typeToModule, pythonTypeImports, imports);
        return {
          name: param.name,
          type: tsType,
          default: mapDefault(param.default),
        };
      });

      const returnType = mapPythonType(method.returns, knownTypes);
      registerImports(returnType, typeToModule, pythonTypeImports, imports);

      const body = TS.Return(
        TS.Call({
          name: "call",
          params: [
            TS.Literal(method.name),
            TS.Literal.Array(method.params.map((param) => param.name)),
            TS.Literal(method.returns || "None"),
          ],
        }),
      );

      return TS.Declaration({
        comment: method.docstring,
        export: true,
        name: toCamel(method.name),
        params,
        returns: returnType,
        body,
      });
    });

    if (pythonTypeImports.size > 0) {
      imports.set("./python.js", pythonTypeImports);
    }

    const importLines = [...imports.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([module, names]) =>
        TS.Import({
          type: true,
          names: [...names].sort(),
          module,
        }),
      );
    importLines.push(TS.Import({ names: ["call"], module: "./python.js" }));

    const importBlock = importLines.join("\n");
    const content = [importBlock, methodDeclarations.join("\n\n")]
      .filter(Boolean)
      .join("\n\n");

    files.push({ filename: "methods.ts", content });
  }

  return files;
}

const PYTHON_TYPE_MAP: Record<string, string> = {
  Any: "Any",
  None: "None",
  bool: "Bool",
  int: "Int",
  float: "Float",
  str: "Str",
};
const PYTHON_TS_TYPES = new Set(Object.values(PYTHON_TYPE_MAP));

function mapPythonType(type: string, knownTypes: Set<string>): string {
  const cleaned = type.replace(/\s+/g, "");
  if (cleaned.includes("|")) {
    return cleaned
      .split("|")
      .map((part) => mapPythonType(part, knownTypes))
      .join(" | ");
  }

  if (cleaned in PYTHON_TYPE_MAP) {
    return PYTHON_TYPE_MAP[cleaned]!;
  }

  if (knownTypes.has(cleaned)) {
    return cleaned;
  }

  return "Any";
}

function normalizeEnumKey(name: string) {
  return name
    .split("_")
    .filter(Boolean)
    .map((part) => part[0]!.toUpperCase() + part.slice(1))
    .join("");
}

function toCamel(name: string) {
  return name.replace(/_([a-zA-Z])/g, (_, char: string) => char.toUpperCase());
}

function mapDefault(defaultValue: string | undefined): string | undefined {
  if (defaultValue === undefined) {
    return undefined;
  }
  if (defaultValue === "None") {
    return "null";
  }
  if (defaultValue === "True") {
    return "true";
  }
  if (defaultValue === "False") {
    return "false";
  }
  return defaultValue;
}

function registerImports(
  type: string,
  typeToModule: Map<string, string>,
  pythonTypeImports: Set<string>,
  otherImports: Map<string, Set<string>>,
) {
  const parts = type.split("|").map((part) => part.trim());
  for (const part of parts) {
    if (PYTHON_TS_TYPES.has(part)) {
      pythonTypeImports.add(part);
      continue;
    }
    const module = typeToModule.get(part);
    if (module) {
      const names = otherImports.get(module) ?? new Set<string>();
      names.add(part);
      otherImports.set(module, names);
    }
  }
}
