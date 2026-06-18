type YjsTextDeltaPart = {
  readonly attributes?: Readonly<Record<string, unknown>>;
  readonly insert?: unknown;
};

export const getYjsTextDeltaPartText = (part: YjsTextDeltaPart): string =>
  typeof part.insert === 'string' ? part.insert : '';

export const isNonEmptyYjsTextDeltaPart = (
  part: YjsTextDeltaPart
): part is YjsTextDeltaPart & { readonly insert: string } =>
  typeof part.insert === 'string' && part.insert.length > 0;
