import { createParser } from 'nuqs';

export const replaceQueryOptions = {
  history: 'replace',
} as const;

export const clampNumber = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

export const parseAsBoundedInteger = (min: number, max: number) =>
  createParser({
    parse: (value) => {
      if (value.trim() === '') {
        return null;
      }

      const parsed = Number(value);

      return Number.isInteger(parsed) ? clampNumber(parsed, min, max) : null;
    },
    serialize: (value) => clampNumber(value, min, max).toString(),
  });
