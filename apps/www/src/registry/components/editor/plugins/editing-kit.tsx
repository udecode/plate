'use client';

import { TrailingBlockPlugin } from '@udecode/plate';

import { DeleteKit } from './delete-kit';
import { ExitBreakKit } from './exit-break-kit';
import { ResetBlockTypeKit } from './reset-block-type-kit';
import { SoftBreakKit } from './soft-break-kit';

export const EditingKit = [
  ...ExitBreakKit,
  ...ResetBlockTypeKit,
  ...DeleteKit,
  ...SoftBreakKit,
  TrailingBlockPlugin,
];
