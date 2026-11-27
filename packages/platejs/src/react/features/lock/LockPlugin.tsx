import type { Location, NodeKey } from '../../../core';
import { BaseLockPlugin } from '../../../features/lock/lib';
import { toReactPlugin, useEditorSelector } from '../../core';

/** React plugin for client-side per-block locking. */
export const LockPlugin = toReactPlugin(BaseLockPlugin);

const SELECTION_LOCK_DEPENDENCIES = [
  'properties',
  'structure',
  'selection',
] as const;
const TARGET_LOCK_DEPENDENCIES = ['properties', 'structure'] as const;

/**
 * Subscribe to whether the target block (or current selection) is effectively
 * locked via its own `locked` flag, an ancestor, or a locked parent root.
 */
export const useIsLocked = (at?: Location | NodeKey): boolean =>
  useEditorSelector(
    (editor) => editor.plugin(BaseLockPlugin).read.isLocked(at),
    {
      dependsOn:
        at === undefined
          ? SELECTION_LOCK_DEPENDENCIES
          : TARGET_LOCK_DEPENDENCIES,
    }
  );

/**
 * Subscribe to whether the target block (or current selection) directly owns
 * `locked: true`, ignoring ancestor locks. Scopes updates to `nodeKey` when a
 * `NodeKey` is passed to avoid per-block selector fan-out.
 */
export const useIsOwnLocked = (at?: Location | NodeKey): boolean =>
  useEditorSelector(
    (editor) => editor.plugin(BaseLockPlugin).read.isOwnLocked(at),
    {
      dependsOn:
        typeof at === 'string'
          ? [{ kind: 'node', nodeKey: at }]
          : at === undefined
            ? SELECTION_LOCK_DEPENDENCIES
            : TARGET_LOCK_DEPENDENCIES,
    }
  );
