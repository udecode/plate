import { HotkeyPlugin } from '@udecode/plate-common/server';

export interface HeadingPlugin extends HotkeyPlugin {}

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface HeadingsPlugin {
  /**
   * Heading levels supported from 1 to `levels`
   */
  levels?: HeadingLevel | HeadingLevel[];
}
