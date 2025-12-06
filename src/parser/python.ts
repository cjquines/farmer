type EnumItem = {
  name: string;
  type: string;
  docstring: string;
};

type Enum = {
  name: string;
  items: EnumItem[];
};

type Method = {
  name: string;
  params: {
    name: string;
    default?: string;
    type: string;
  }[];
  returns: string;
  docstring: string;
};

export function parseFile(content: string): {
  enums: Enum[];
  methods: Method[];
} {
  throw new Error("Not implemented");
}

type Parsed<T> =
  | { success: true; value: T; nextIndex: number }
  | { success: false };

function parseEnum(content: string, startIndex: number): Parsed<Enum> {
  throw new Error("Not implemented");
}

function parseMethod(content: string, startIndex: number): Parsed<Method> {
  throw new Error("Not implemented");
}
