import { txLocate, type EditorBreakExitOptions } from '../../facade';
import { definePlugin } from '../../lib/plugin/definePlugin';
import { PLUGINS } from '../plate-keys';

type ExitBreakOptions = Omit<EditorBreakExitOptions, 'before'>;

/**
 * Inserts an exit block before or after the current block structure.
 */
export const ExitBreakPlugin = definePlugin(PLUGINS.exitBreak, {
  editOnly: true,
  update: ({ tx }) => {
    const exitClaimingKey = (options: EditorBreakExitOptions) => {
      if (!tx.selection.isCollapsed()) return false;

      tx.break.exit(options);

      return true;
    };

    return {
      insert: txLocate(false, (options: ExitBreakOptions = {}) =>
        exitClaimingKey(options)
      ),
      insertBefore: txLocate(false, (options: ExitBreakOptions = {}) =>
        exitClaimingKey({ ...options, before: true })
      ),
    };
  },
});
