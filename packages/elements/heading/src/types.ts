import { HotkeyPlugin } from '@udecode/plate-core';

export interface HeadingPlugin extends SerializePlugin, HotkeyPlugin {}

export interface HeadingsPlugin {
  /**
   * Heading levels supported from 1 to `levels`
   */
  levels?: number;
}
