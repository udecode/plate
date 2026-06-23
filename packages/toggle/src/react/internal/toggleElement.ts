export type ToggleIndexElement = Record<string, unknown> & {
  id: string;
  indent?: number;
  listStyleType?: unknown;
  type?: string;
};

export const isToggleIndexElement = (
  value: unknown
): value is ToggleIndexElement =>
  !!value &&
  typeof value === 'object' &&
  !Array.isArray(value) &&
  typeof (value as { id?: unknown }).id === 'string';
