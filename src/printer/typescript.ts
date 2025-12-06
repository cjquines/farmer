import { indent, wrap } from "./util.js";

export function Import({
  type = false,
  names,
  module,
}: {
  type?: boolean;
  names: string[];
  module: string;
}) {
  const modifier = type ? "type " : "";
  return `import ${modifier}{ ${names.join(", ")} } from ${Literal(module)};`;
}

export function JSDoc(comment: string, width = 80) {
  const lines = wrap(comment, width).split("\n");
  if (lines.length === 1) {
    return `/** ${lines[0]} */`;
  }
  const body = lines.map((line) => ` * ${line}`).join("\n");
  return `/**\n${body}\n */`;
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
  const prefix = comment ? `${JSDoc(comment)}\n` : "";
  const exportKeyword = export_ ? "export " : "";
  const castSuffix = cast ? ` as ${cast}` : "";
  return `${prefix}${exportKeyword}${kind} ${name} = ${value}${castSuffix};`;
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
  const genericsPart = generics.length > 0 ? `<${generics.join(", ")}>` : "";

  const renderParamsInline = () => {
    if (namedParams) {
      const destructured = params
        .map((param) =>
          param.default ? `${param.name} = ${param.default}` : param.name,
        )
        .join(", ");
      const typed = params
        .map(
          (param) => `${param.name}${param.default ? "?" : ""}: ${param.type}`,
        )
        .join("; ");
      return `{ ${destructured} }: { ${typed} }`;
    }

    return params
      .map((param) =>
        param.default
          ? `${param.name} = ${param.default}`
          : `${param.name}: ${param.type}`,
      )
      .join(", ");
  };

  const previewHeader = `${export_ ? "export " : ""}function ${name}${genericsPart}(${renderParamsInline()})${returns ? `: ${returns}` : ""} {`;
  const multiLine =
    params.some((param) => param.comment) || previewHeader.length > 80;

  const renderParams = () => {
    if (namedParams) {
      if (multiLine) {
        const destructured = params
          .map((param) =>
            param.default
              ? `${param.name} = ${param.default},`
              : `${param.name},`,
          )
          .map((line) => indent(line, 2))
          .join("\n");

        const typed = params
          .map((param) => {
            const lines = [];
            if (param.comment) {
              lines.push(indent(JSDoc(param.comment), 2));
            }
            lines.push(
              indent(
                `${param.name}${param.default ? "?" : ""}: ${param.type};`,
                2,
              ),
            );
            return lines.join("\n");
          })
          .join("\n");

        const destructuredBlock =
          typeof namedParams === "string"
            ? `${namedParams}`
            : `{\n${destructured}\n}`;

        return `${destructuredBlock}: {\n${typed}\n}`;
      }

      const destructured = params
        .map((param) =>
          param.default ? `${param.name} = ${param.default}` : param.name,
        )
        .join(", ");
      const typed = params
        .map(
          (param) => `${param.name}${param.default ? "?" : ""}: ${param.type}`,
        )
        .join("; ");
      return `${typeof namedParams === "string" ? namedParams : `{ ${destructured} }`}: { ${typed} }`;
    }

    if (multiLine) {
      return params
        .map((param) => {
          const rendered = param.default
            ? `${param.name} = ${param.default},`
            : `${param.name}: ${param.type},`;
          const lines = [];
          if (param.comment) {
            lines.push(indent(JSDoc(param.comment), 2));
          }
          lines.push(indent(rendered, 2));
          return lines.join("\n");
        })
        .join("\n");
    }

    return params
      .map((param) =>
        param.default
          ? `${param.name} = ${param.default}`
          : `${param.name}: ${param.type}`,
      )
      .join(", ");
  };

  const paramsBlock = renderParams();
  const header = `${export_ ? "export " : ""}function ${name}${genericsPart}(${multiLine ? "\n" : ""}${multiLine ? indent(paramsBlock, 2) : paramsBlock}${multiLine ? "\n" : ""})${returns ? `: ${returns}` : ""} {`;

  const parts = [
    comment ? `${JSDoc(comment)}\n` : "",
    header,
    "\n",
    indent(body, 2),
    "\n}",
  ];

  return parts.join("");
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

  if (multiLine) {
    const body = entries
      .map((prop) => {
        if (typeof prop === "string") {
          return indent(`${prop},`, 2);
        }
        const lines = [];
        if (prop.comment) {
          lines.push(indent(JSDoc(prop.comment), 2));
        }
        lines.push(indent(`${prop.value},`, 2));
        return lines.join("\n");
      })
      .join("\n");

    return `[\n${body}\n]`;
  }

  const body = entries
    .map((prop) => (typeof prop === "string" ? prop : prop.value))
    .join(", ");
  return `[${body}]`;
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

  if (multiLine) {
    const body = entries
      .map(([key, prop]) => {
        if (typeof prop === "string") {
          return indent(`${key}: ${prop},`, 2);
        }
        const lines = [];
        if (prop.comment) {
          lines.push(indent(JSDoc(prop.comment), 2));
        }
        lines.push(indent(`${key}: ${prop.value},`, 2));
        return lines.join("\n");
      })
      .join("\n");

    return `{\n${body}\n}`;
  }

  const body = entries
    .map(
      ([key, prop]) =>
        `${key}: ${typeof prop === "string" ? prop : prop.value}`,
    )
    .join(", ");
  return `{ ${body} }`;
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
  const genericsPart = generics.length > 0 ? `<${generics.join(", ")}>` : "";
  const inlineParams = params.join(", ");
  const callInline = `${name}${genericsPart}(${inlineParams})`;
  const multiLine = callInline.length > 80;

  if (!multiLine) {
    return callInline;
  }

  const renderedParams = params
    .map((param) => indent(`${param},`, 2))
    .join("\n");
  return `${name}${genericsPart}(\n${renderedParams}\n)`;
}

export function Return(value: string) {
  return `return ${value};`;
}
