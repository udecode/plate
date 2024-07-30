import type { HotkeyPluginOptions } from '@udecode/plate-common/server';

export interface HeadingPluginOptions extends HotkeyPluginOptions {}

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface HeadingsPluginOptions {
  /** Heading levels supported from 1 to `levels` */
  levels?: HeadingLevel | HeadingLevel[];
}
