import {
  createCompiledHotkeyMatcher,
  type HotkeySpec,
  usesAppleDOMHotkeys,
} from '../../dom/plite-dom.internal';
import type { EditorShortcut } from '../../lib';

export type CompiledPlateShortcut = Readonly<{
  declarationIndex: number;
  handler: NonNullable<EditorShortcut['handler']>;
  id: string;
  match: (event: KeyboardEvent) => boolean;
  pluginIndex: number;
  priority: number;
}>;

type PlateShortcutCompilerInput = Readonly<{
  declarationIndex: number;
  id: string;
  pluginIndex: number;
  shortcut: EditorShortcut;
}>;

const compileShortcutMatch = (keys: HotkeySpec) => {
  const matchApple = createCompiledHotkeyMatcher(keys, { platform: 'apple' });
  const matchOther = createCompiledHotkeyMatcher(keys, { platform: 'other' });

  return (event: KeyboardEvent) =>
    (usesAppleDOMHotkeys(event) ? matchApple : matchOther)(event);
};

export const compilePlateShortcuts = (
  shortcuts: readonly PlateShortcutCompilerInput[]
): readonly CompiledPlateShortcut[] =>
  Object.freeze(
    shortcuts
      .flatMap(
        ({
          declarationIndex,
          id,
          pluginIndex,
          shortcut: { handler, keys, priority = 0 },
        }) => {
          if (!keys || !handler) return [];
          if (!Number.isFinite(priority)) {
            throw new TypeError(
              `Plate shortcut "${id}" priority must be a finite number.`
            );
          }

          return [
            Object.freeze({
              declarationIndex,
              handler,
              id,
              match: compileShortcutMatch(keys),
              pluginIndex,
              priority,
            }),
          ];
        }
      )
      .sort(
        (left, right) =>
          right.priority - left.priority ||
          left.pluginIndex - right.pluginIndex ||
          left.declarationIndex - right.declarationIndex ||
          left.id.localeCompare(right.id)
      )
  );
