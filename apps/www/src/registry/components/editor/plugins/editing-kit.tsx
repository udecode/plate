'use client';

import { TrailingBlockPlugin } from '@udecode/plate';

import { DeleteKit } from './delete-kit';
import { ExitBreakKit } from './exit-break-kit';

export const EditingKit = [
  ...ExitBreakKit,
  // ...ResetBlockTypeKit,
  ...DeleteKit,
  TrailingBlockPlugin,
];
