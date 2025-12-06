import { isTruthy, Indent, Wrap } from "./util.js";

export function Import({
  type = false,
  names,
  module,
}: {
  type?: boolean;
  names: string[];
  module: string;
}) {
  return ["import", type && "type", "{", ...names, "}", "from", Literal(module)]
    .filter(isTruthy)
    .join(" ");
}

export function JSDoc(comment: string, width = 80) {
  const lines = Wrap(comment, width).split("\n");
  if (lines.length === 1) {
    return `/** ${lines[0]} */`;
  }
  const body = lines.map((line) => ` * ${line}`).join("\n");
  return ["/**", ...body, " */"].join("\n");
}

type VariableDeclarationProps = {
  comment?: string;
  export?: boolean;
  kind?: "type" | "const";
  name: string;
  value: string;
  cast?: string;
};

function VariableDeclaration({
  comment,
  export: export_ = false,
  kind = "const",
  name,
  value,
  cast,
}: VariableDeclarationProps) {
  return [
    comment && JSDoc(comment),
    comment && "\n",
    export_ && `export `,
    kind,
    name,
    " = ",
    value,
    cast && ` as ${cast}`,
    ";",
  ]
    .filter(isTruthy)
    .join("");
}

type FunctionDeclarationProps = {
  comment?: string;
  export: boolean;
  name: string;
  generics?: string[];
  params: { comment?: string; name: string; type: string; default?: string }[];
  namedParams?: string | boolean;
  returns?: string;
  body: string;
};

function FunctionDeclaration({
  comment,
  export: export_ = false,
  name,
  generics = [],
  params,
  namedParams = true,
  returns,
  body,
}: FunctionDeclarationProps) {
  const headerLength = [
    export_ && "export",
    "function",
    name,
    generics.join(", "),
    ...params.flatMap((param) => [param.name, param.type]),
    returns,
  ]
    .filter(isTruthy)
    .reduce((acc, string) => acc + 1 + string.length, 0);

  const multiLine = params.some((param) => param.comment) || headerLength > 80;

  let renderedParams: string;
  if (namedParams) {
    const destructured = [
      "{",
      multiLine
        ? params
            .map((param) =>
              param.default ? `${param.name} = ${param.default}` : param.name,
            )
            .join(", ")
        : params
            .map((param) =>
              param.default
                ? `  ${param.name} = ${param.default}`
                : `  ${param.name}`,
            )
            .join(",\n") + ",",
      "}: {",
    ]
      .filter(isTruthy)
      .join(multiLine ? "\n" : " ");

    renderedParams = [
      typeof namedParams === "string" ? `${namedParams}: {` : destructured,
      multiLine
        ? params
            .flatMap((param) => [
              param.comment && Indent(`  ${JSDoc(param.comment)}`, 2),
              `  ${param.name}${param.default ? "?" : ""}: ${param.type}`,
            ])
            .filter(isTruthy)
            .join(";\n") + ";"
        : params
            .map(
              (param) =>
                `${param.name}${param.default ? "?" : ""}: ${param.type}`,
            )
            .join("; "),
      "}",
    ].join(multiLine ? "\n" : " ");
  } else {
    renderedParams = params
      .map((param) =>
        multiLine
          ? [
              param.comment && Indent(`  ${JSDoc(param.comment)}`, 2),
              param.default && `  ${param.name} = ${param.default}`,
              !param.default && `  ${param.name}: ${param.type}`,
            ].join("\n")
          : param.default
            ? `${param.name} = ${param.default}`
            : `${param.name}: ${param.type}`,
      )
      .join(multiLine ? "\n" : " ");
  }

  const header = [
    export_ && `export `,
    "function ",
    name,
    generics.length > 0 && `<${generics.join(", ")}>`,
    "(",
    multiLine && "\n",
    renderedParams,
    multiLine && "\n",
    ")",
    returns && `: ${returns}`,
    " {",
  ]
    .filter(isTruthy)
    .join("");

  return [comment && JSDoc(comment), header, Indent(body, 2), "}"].join("\n");
}

export function Declaration(
  props: VariableDeclarationProps | FunctionDeclarationProps,
) {
  if ("params" in props) {
    return FunctionDeclaration(props);
  }
  return VariableDeclaration(props);
}

function ArrayLiteral(
  entries: (string | { comment?: string; value: string })[],
) {
  const entriesLength = entries.reduce(
    (acc, prop) =>
      acc + 1 + (typeof prop === "string" ? prop.length : prop.value.length),
    0,
  );

  const multiLine =
    entries.some((prop) => typeof prop === "object" && prop.comment) ||
    entriesLength > 80;

  return [
    "[",
    multiLine
      ? entries
          .map((prop) => {
            if (typeof prop === "string") {
              return [Indent(prop, 2), ","].join("");
            }
            return [
              prop.comment && Indent(JSDoc(prop.comment), 2),
              prop.comment && "\n",
              Indent(prop.value, 2),
              ",",
            ].join("");
          })
          .join("\n")
      : entries
          .map((prop) => {
            return `${typeof prop === "string" ? prop : prop.value},`;
          })
          .join(" "),
    "]",
  ].join(multiLine ? "\n" : " ");
}

function ObjectLiteral(
  entries: (readonly [string, string | { comment?: string; value: string }])[],
) {
  const entriesLength = entries.reduce(
    (acc, [key, prop]) =>
      acc +
      1 +
      key.length +
      (typeof prop === "string" ? prop.length : prop.value.length),
    0,
  );

  const multiLine =
    entries.some(([, prop]) => typeof prop === "object" && prop.comment) ||
    entriesLength > 80;

  return [
    "{",
    multiLine
      ? entries
          .flatMap(([key, prop]) => {
            if (typeof prop === "string") {
              return [`  ${key}: ${prop},`];
            }
            return [
              prop.comment && Indent(JSDoc(prop.comment), 2),
              `  ${key}: ${prop.value},`,
            ];
          })
          .join("\n")
      : entries
          .map(([key, prop]) => {
            return `${key}: ${typeof prop === "string" ? prop : prop.value},`;
          })
          .join(" "),
    "}",
  ].join(multiLine ? "\n" : " ");
}

function Literal_(value: unknown): string {
  switch (typeof value) {
    case "object": {
      if (value === null) {
        return "null";
      }
      if (Array.isArray(value)) {
        return ArrayLiteral(value.map(Literal));
      }
      return ObjectLiteral(
        Object.entries(value).map(([key, value]) => [key, Literal(value)]),
      );
    }
    case "string": {
      return `"${value}"`;
    }
    case "bigint":
    case "number":
    case "boolean": {
      return value.toString();
    }
    case "undefined": {
      return "undefined";
    }
    default: {
      throw new Error(`Unsupported type: ${typeof value}`);
    }
  }
}

(Literal_ as any).Array = ArrayLiteral;
(Literal_ as any).Object = ObjectLiteral;

export const Literal: {
  (value: unknown): string;
  Array: (entries: (string | { comment?: string; value: string })[]) => string;
  Object: (
    entries: (readonly [
      string,
      string | { comment?: string; value: string },
    ])[],
  ) => string;
} = Literal_ as any;

export const Type = {
  Union(types: string[]) {
    return types.join(" | ");
  },
  Generic({ name, types }: { name: string; types: string[] }) {
    return `${name}<${types.join(", ")}>`;
  },
};

export function Call({
  name,
  generics = [],
  params,
}: {
  name: string;
  generics?: string[];
  params: string[];
}) {
  const callLength =
    name.length + generics.length > 0
      ? generics.reduce((acc, type) => acc + type.length + 1, 0) + 2
      : 0 + params.reduce((acc, param) => acc + param.length, 0);

  const multiLine = callLength > 80;

  return [
    name,
    generics?.length > 0 && `<${generics.join(", ")}>`,
    "(",
    multiLine && "\n",
    multiLine
      ? params.map((param) => Indent(param, 2)).join(",\n")
      : params.join(", "),
    ")",
  ].join("");
}

export function Return(value: string) {
  return `return ${value};`;
}
