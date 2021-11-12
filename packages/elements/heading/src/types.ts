import { HotkeyPlugin } from '@udecode/plate-common';

export interface HeadingPlugin extends HotkeyPlugin {}

export interface HeadingsPlugin {
  /**
   * Heading levels supported from 1 to `levels`
   */
  levels?: number;
}
