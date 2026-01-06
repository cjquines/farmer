export type Call<PyType extends string> = {
  method: string;
  params: any[];
  returns: PyType;
};

export function call<const P extends string>(
  method: string,
  params: any[],
  returns: P,
): Call<P> {
  return { method, params, returns };
}

export type PythonType<PyType extends string, TSType> = TSType | Call<PyType>;

export type AnyPythonType = PythonType<string, any>;

export type Any = PythonType<"Any", any>;

export type Bool = PythonType<"bool", boolean>;

export type Float = PythonType<"float", number>;

export type Int = PythonType<"int", number>;

export type None = PythonType<"None", null>;

export type Str = PythonType<"str", string>;

export type Dict<K extends AnyPythonType, V extends AnyPythonType> =
  K extends PythonType<infer KP, infer KT extends PropertyKey>
    ? V extends PythonType<infer VP, infer VT>
      ? PythonType<`Dict[${KP}, ${VP}]`, Record<KT, VT>>
      : never
    : never;

export type List<T extends AnyPythonType> =
  T extends PythonType<infer TP, infer TT>
    ? PythonType<`List[${TP}]`, TT[]>
    : never;

export type Tuple<T extends AnyPythonType, U extends AnyPythonType> =
  T extends PythonType<infer TP, infer TT>
    ? U extends PythonType<infer UP, infer UT>
      ? PythonType<`Tuple[${TP}, ${UP}]`, [TT, UT]>
      : never
    : never;
