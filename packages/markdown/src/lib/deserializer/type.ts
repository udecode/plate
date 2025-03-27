import type * as mdast from '../mdast';

export type Decoration = Readonly<
  Partial<
    Record<
      (mdast.Delete | mdast.Emphasis | mdast.InlineCode | mdast.Strong)['type'],
      true
    >
  >
>;
