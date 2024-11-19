'use client';

import { withCn } from '@udecode/cn';

import { Toolbar } from './toolbar';

export const FixedToolbar = withCn(
  Toolbar,
  'supports-backdrop-blur:bg-background/60 border-b-border bg-background/95 scrollbar-hide sticky left-0 top-0 z-50 w-full justify-between overflow-x-auto rounded-t-lg border-b p-1 backdrop-blur'
);
