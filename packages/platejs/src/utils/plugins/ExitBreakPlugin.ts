import type { Node, Path } from '../../facade';
import { insertExitBlock } from '../../internal/plugin/insertExitBlock';
import { definePlugin } from '../../lib/plugin/definePlugin';
import { PLUGINS } from '../plate-keys';

type ExitBreakNodeMatch = (node: Node, path: Path) => boolean;

type ExitBreakOptions = {
  match?: ExitBreakNodeMatch;
  reverse?: boolean;
};

/**
 * Inserts an exit block before or after the current block structure.
 */
export const ExitBreakPlugin = definePlugin(PLUGINS.exitBreak, {
  editOnly: true,
  update: ({ tx }) => ({
    insert: (options: Omit<ExitBreakOptions, 'reverse'> = {}) =>
      insertExitBlock(tx, options),
    insertBefore: (options: Omit<ExitBreakOptions, 'reverse'> = {}) =>
      insertExitBlock(tx, { ...options, reverse: true }),
  }),
});
