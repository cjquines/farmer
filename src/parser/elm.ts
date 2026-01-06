export type Result<Error, Value> =
  | { type: "Ok"; value: Value }
  | { type: "Err"; error: Error };

export interface Parser<Context, Problem, Value> {
  parse: (state: State<Context>) => PStep<Context, Problem, Value>;
}

export type PStep<Context, Problem, Value> =
  | {
      type: "Good";
      committed: boolean;
      value: Value;
      state: State<Context>;
    }
  | {
      type: "Bad";
      committed: boolean;
      problems: Bag<Context, Problem>;
    };

export type State<Context> = {
  src: string;
  offset: number;
  indent: number;
  context: Located<Context>[];
  row: number;
  col: number;
};

export type Located<Context> = {
  context: Context;
  row: number;
  col: number;
};

export function run<C, X, A>(
  { parse }: Parser<C, X, A>,
  src: string,
): Result<DeadEnd<C, X>[], A> {
  const result = parse({
    src,
    offset: 0,
    indent: 1,
    context: [],
    row: 1,
    col: 1,
  });

  switch (result.type) {
    case "Good":
      return { type: "Ok", value: result.value };
    case "Bad":
      return { type: "Err", error: bagToList(result.problems, []) };
  }
}

export type DeadEnd<Context, Problem> = {
  row: number;
  col: number;
  problem: Problem;
  contextStack: {
    row: number;
    col: number;
    context: Context;
  }[];
};

export type Bag<C, X> =
  | { type: "Empty" }
  | { type: "AddRight"; left: Bag<C, X>; right: DeadEnd<C, X> }
  | { type: "Append"; left: Bag<C, X>; right: Bag<C, X> };

export function fromState<C, X>(s: State<C>, x: X): Bag<C, X> {
  return {
    type: "AddRight",
    left: { type: "Empty" },
    right: { row: s.row, col: s.col, problem: x, contextStack: s.context },
  };
}

export function fromInfo<C, X>(
  row: number,
  col: number,
  x: X,
  context: Located<C>[],
): Bag<C, X> {
  return {
    type: "AddRight",
    left: { type: "Empty" },
    right: { row, col, problem: x, contextStack: context },
  };
}

/**
 * Given a bag like
 *
 * ```ts
 * {
 *   type: "AddRight",
 *   left: {
 *     type: "AddRight",
 *     left: {
 *       type: "Empty"
 *     },
 *     right: {
 *       row: 1,
 *       col: 1,
 *       problem: "a",
 *       contextStack: []
 *     }
 *   },
 *   right: {
 *     row: 2,
 *     col: 2,
 *     problem: "b",
 *     contextStack: []
 *   }
 * }
 */
export function bagToList<C, X>(
  bag: Bag<C, X>,
  list: DeadEnd<C, X>[],
): DeadEnd<C, X>[] {
  switch (bag.type) {
    case "Empty":
      return list;
    case "AddRight":
      return bagToList(bag.left, [bag.right, ...list]);
    case "Append":
      return bagToList(bag.left, bagToList(bag.right, list));
  }
}

export function succeed<C, X, A>(a: A): Parser<C, X, A> {
  return {
    parse: (state) => ({
      type: "Good",
      committed: false,
      value: a,
      state,
    }),
  };
}

export function problem<C, X, A>(x: X): Parser<C, X, A> {
  return {
    parse: (state) => ({
      type: "Bad",
      committed: false,
      problems: fromState(state, x),
    }),
  };
}

export function map<C, X, A, B>(
  func: (value: A) => B,
  { parse }: Parser<C, X, A>,
): Parser<C, X, B> {
  return {
    parse: (state) => {
      const result = parse(state);
      switch (result.type) {
        case "Bad":
          return result;
        case "Good":
          return { ...result, value: func(result.value) };
      }
    },
  };
}

export function map2<C, X, A, B, Value>(
  func: (a: A, b: B) => Value,
  { parse: parseA }: Parser<C, X, A>,
  { parse: parseB }: Parser<C, X, B>,
): Parser<C, X, Value> {
  return {
    parse: (state) => {
      const resultA = parseA(state);
      switch (resultA.type) {
        case "Bad":
          return resultA;
        case "Good": {
          const resultB = parseB(resultA.state);
          switch (resultB.type) {
            case "Bad":
              return {
                ...resultB,
                committed: resultA.committed || resultB.committed,
              };
            case "Good":
              return {
                ...resultB,
                committed: resultA.committed || resultB.committed,
                value: func(resultA.value, resultB.value),
              };
          }
        }
      }
    },
  };
}

export function keeper<C, X, A, B>(
  parseFunc: Parser<C, X, (value: A) => B>,
  parseArg: Parser<C, X, A>,
): Parser<C, X, B> {
  return map2((fn, arg) => fn(arg), parseFunc, parseArg);
}

export function ignorer<C, X, Keep, Ignore>(
  keepParser: Parser<C, X, Keep>,
  ignoreParser: Parser<C, X, Ignore>,
): Parser<C, X, Keep> {
  return map2((keep) => keep, keepParser, ignoreParser);
}

/*
const p = P.tuple()
  ._(P.token("("))
  ._(P.spaces())
  .$(P.number())
  ._(P.spaces())
  ._(P.token(","))
  ._(P.spaces())
  .$(P.number())
  ._(P.spaces())
  ._(P.token(")"));

const enum = P.object()
  ._(P.name("class"))
  .$("name", P.name())
  ._(P.op(":"))
  ._(P.string().maybe())
  .$("items",
  )

const enumParser = P.object("enum")
  ._(P.name("class"))
  .$("name", P.name())
  ._(P.op(":"))
  ._(P.string().maybe())
  .$(
    "items",
    P.object("enum-item")
      .$("name", P.name())
      ._(P.op(":"))
      .$("type", P.name())
      .$("docstring", P.string())
      .many(),
  );

const methodParser = P.object("method")
  ._(P.keyword("def"))
  .$("name", P.name())
  ._(P.op("("))
  .$(
    "params",
    P.op(",", { trailing: "optional" })
      .join(
        P.object("param")
          .$("name", P.name())
          ._(P.op(":"))
          .$("type", P.name().default("Any")),
      )
      .default([]),
  )
  ._(P.op(")"))
  ._(P.op("->"))
  .$("returns", P.name().default("Any"))
  ._(P.op(":"))
  .$("docstring", P.string())
  ._(P.op("..."));

P.many()
  .object("name", { example: `thing` })

P.many("items", { sep: ",", trailing: true })
  .or(
    P....
  )

P.many(
  "items",
  { sep: ",", trailing: true },
  P.or(
    ...
  )
);

P.op(",")
  .sep({ trailing: true })
  .object ...

terminal-likes

- special (or)
  - sequence-likes (object, tuple) / terminal-likes
    - _ => sequence-like
    - $ => sequence-like
  - post-combinator (maybe, many, some)

combinators (or, sep, maybe, not, many, ahead, commit)

which can be followed by which? can you combine combinators?

python only allows ! for simple terminals, unions of terminals, or token; ditto with &

ditto with sep

so maybe it should be P.sep(",")

P.or(P._("]"), P._("|"), P._(",")) // => simple union ? vs. complex union...?

maybe "or" can only be for terminal-likes, and sequence-likes use "union"

const assignment = P.union("assignment")
  .option(
    P.object("name-type", {
      examples: [`x: int = 1`],
    })
      .$("name", name)
      ._(":")
      .$("type", expression)
      .$("rhs", P._("=").$(annotatedRhs).maybe()),
  )
  .option(
    P.object("target-type", {
      examples: [`x.y: int = 1`],
    })
      .$(
        "target",
        P.union()
          .option(P._("(").$(singleTarget)._(")"))
          .option(singleSubscriptAttributeTarget),
      )
      ._(":")
      .$("type", expression)
      .$("rhs", P._("=").$(annotatedRhs).maybe()),
  )
  .option(
    P.object("non-type", {
      examples: [`x, y = 1, 2`],
    })
      .$("targets", P.$(starTargets)._("=").some())
      .$("rhs", annotatedRhs)
      ._(P.not._("="))
      .$("typeComment", typeComment.maybe()),
  )
  .option(
    P.object("augmented", {
      examples: [`x += 1`],
    })
      .$("target", singleTarget)
      .$("augAssign", augAssign)
      .commit()
      .$("rhs", annotatedRhs),
  );
*/
