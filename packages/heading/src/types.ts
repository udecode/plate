import { HotkeyPlugin } from '@udecode/plate-common';

export interface HeadingPlugin extends HotkeyPlugin {}

export type HEADING_LEVEL = 1 | 2 | 3 | 4 | 5 | 6;

export interface HeadingsPlugin {
  /**
   * Heading levels supported from 1 to `levels`
   */
  levels?: HEADING_LEVEL | HEADING_LEVEL[];
}
