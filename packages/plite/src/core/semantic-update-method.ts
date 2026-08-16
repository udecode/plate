import type { EditorCommandDispatch } from '../interfaces/editor';

type UpdateMethod = (...args: any[]) => unknown;
type SemanticUpdateLowering = (
  dispatch: EditorCommandDispatch<any>,
  args: readonly unknown[],
  primitive: UpdateMethod
) => unknown;

const SEMANTIC_UPDATE_METHODS = new WeakMap<
  UpdateMethod,
  SemanticUpdateLowering
>();

/** Attach one-shot semantic lowering to its primitive transaction method. */
export const defineSemanticUpdateMethod = <TMethod extends UpdateMethod>(
  method: (...args: Parameters<TMethod>) => ReturnType<TMethod>,
  lower: (
    dispatch: EditorCommandDispatch<any>,
    args: Parameters<TMethod>,
    primitive: TMethod
  ) => ReturnType<TMethod>
): TMethod => {
  SEMANTIC_UPDATE_METHODS.set(method, lower as SemanticUpdateLowering);

  return method as TMethod;
};

/** @internal Resolve semantic lowering for one declared update method. */
export const getSemanticUpdateLowering = (
  method: UpdateMethod
): SemanticUpdateLowering | undefined => SEMANTIC_UPDATE_METHODS.get(method);

/** @internal Map one update method's arguments without bypassing its command lowering. */
export const mapSemanticUpdateMethodArguments = <TMethod extends UpdateMethod>(
  method: TMethod,
  mapArguments: (args: readonly unknown[]) => readonly unknown[]
): TMethod => {
  const mapped = ((...args: unknown[]) =>
    Reflect.apply(method, undefined, mapArguments(args))) as TMethod;
  const lower = getSemanticUpdateLowering(method);

  if (lower) {
    SEMANTIC_UPDATE_METHODS.set(mapped, (dispatch, args) =>
      lower(dispatch, mapArguments(args), method)
    );
  }

  return mapped;
};
