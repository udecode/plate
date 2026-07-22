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
