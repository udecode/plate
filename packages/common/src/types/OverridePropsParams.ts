import { CSSProperties } from 'react';

export type GetOverridePropsParams = {
  defaultOption: unknown;
  options: unknown[] | undefined;
  classNames: Partial<Record<string | number, unknown>> | undefined;
  value: string | number;
  className: string | undefined;
  style: CSSProperties;
  type: string;
};

export type GetElementOverridePropsParams = OverridePropsParams & {
  types: string[];
};

export type GetLeafOverrideProps = OverridePropsParams;

export type OverridePropsParams = {
  type: string;
  options?: unknown[];
  defaultOption?: unknown;
  classNames?: Partial<Record<string | number, unknown>>;
};
