import { withCn } from '@/lib/utils';

import { Toolbar } from './toolbar';

export const FixedToolbar = withCn(
  Toolbar,
  'supports-backdrop-blur:bg-background/60 sticky left-0 top-[57px] z-50 w-full justify-between overflow-x-auto rounded-t-lg border-b border-b-border bg-background/95 backdrop-blur'
);
