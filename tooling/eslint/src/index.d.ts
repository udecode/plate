/// <reference types="../eslint.d.ts" />

import type { FlatCompat } from '@eslint/eslintrc';
import type { FlatConfig } from '@typescript-eslint/utils/ts-eslint';

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
export declare const defineConfig: typeof import('typescript-eslint').config;

export declare const compat: FlatCompat;

export declare const configs: {
  base: FlatConfig.ConfigArray;
  next: FlatConfig.ConfigArray;
  prettier: FlatConfig.ConfigArray;
  react: FlatConfig.ConfigArray;
  getTailwind: (options: {
    config: string;
    cssFiles: string;
  }) => FlatConfig.ConfigArray;
};
