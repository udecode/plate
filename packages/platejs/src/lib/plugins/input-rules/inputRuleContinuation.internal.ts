const inputRuleContinuation = Symbol('inputRuleContinuation');
const inputRuleDecline = Symbol('inputRuleDecline');

export type InputRuleContinuation<TInput = undefined> = Readonly<{
  [inputRuleContinuation]: true;
  input: TInput;
}>;

export const createInputRuleContinuation = <TInput>(
  input: TInput
): InputRuleContinuation<TInput> => ({
  [inputRuleContinuation]: true,
  input,
});

export const isInputRuleContinuation = (
  value: unknown
): value is InputRuleContinuation<unknown> =>
  typeof value === 'object' &&
  value !== null &&
  Reflect.get(value, inputRuleContinuation) === true;

export type InputRuleDecline = Readonly<{ [inputRuleDecline]: true }>;

const decline: InputRuleDecline = Object.freeze({ [inputRuleDecline]: true });

export const createInputRuleDecline = (): InputRuleDecline => decline;

export const isInputRuleDecline = (value: unknown): value is InputRuleDecline =>
  value === decline;
