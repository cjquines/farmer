export type Call<PyType extends string> = {
  method: string;
  params: any[];
  returns: PyType;
};

export type PythonType<PyType extends string, TSType> = TSType | Call<PyType>;

export type Any = PythonType<"Any", any>;

export type Bool = PythonType<"bool", boolean>;

export type Float = PythonType<"float", number>;

export type Int = PythonType<"int", number>;

export type None = PythonType<"None", null>;

export type Str = PythonType<"str", string>;
