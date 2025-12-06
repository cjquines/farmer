import { dedent as tsdedent } from "ts-dedent";

export function dedent(
  templ: string | TemplateStringsArray,
  ...args: unknown[]
): string {
  return (
    tsdedent(templ, ...args)
      .trim()
      // Workaround https://github.com/tamino-martinius/node-ts-dedent/issues/37
      // by removing lines that only contain spaces.
      .replaceAll(/\n\s*\n/gi, "\n\n")
  );
}

// Aliases for syntax highlighting.
export const python = dedent;
export const typescript = dedent;

export function isTruthy<T>(
  value: T,
): value is Exclude<T, null | undefined | false | 0 | ""> {
  return Boolean(value);
}

export function indent(value: string, amount: number): string {
  return value
    .split("\n")
    .map((line) => " ".repeat(amount) + line)
    .join("\n");
}

export function wrap(value: string, width: number): string {
  const words = value.split("\n").join(" ").split(" ");
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    if (line.length === 0) {
      line = word;
      continue;
    }

    if (line.length + 1 + word.length > width) {
      lines.push(line);
      line = word;
    } else {
      line += ` ${word}`;
    }
  }

  if (line.length > 0) {
    lines.push(line);
  }

  return lines.join("\n");
}
