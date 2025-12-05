export const Primitive = {
  bool: "bool",
  int: "int",
  float: "float",
} as const;

export type Primitive = (typeof Primitive)[keyof typeof Primitive];

export type Call<P extends Primitive> = {
  method: string;
  params: any[];
  returns: P;
};

export type Bool = boolean | Call<"bool">;

export type Int = number | Call<"int">;

export type Float = number | Call<"float">;
