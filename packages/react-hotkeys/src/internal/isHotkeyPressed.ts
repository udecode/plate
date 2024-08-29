import { isHotkeyModifier, mapKey } from './parseHotkeys';
(() => {
  if (typeof document !== 'undefined') {
    document.addEventListener('keydown', (e) => {
      if (e.code === undefined) {
        // Synthetic event (e.g., Chrome autofill). Ignore.
        return;
      }

      pushToCurrentlyPressedKeys([mapKey(e.code)]);
    });

    document.addEventListener('keyup', (e) => {
      if (e.code === undefined) {
        // Synthetic event (e.g., Chrome autofill). Ignore.
        return;
      }

      removeFromCurrentlyPressedKeys([mapKey(e.code)]);
    });
  }
  if (typeof window !== 'undefined') {
    window.addEventListener('blur', () => {
      currentlyPressedKeys.clear();
    });
  }
})();

const currentlyPressedKeys: Set<string> = new Set<string>();

// https://github.com/microsoft/TypeScript/issues/17002
export function isReadonlyArray(value: unknown): value is readonly unknown[] {
  return Array.isArray(value);
}

export function isHotkeyPressed(
  key: readonly string[] | string,
  delimiter = ','
): boolean {
  const hotkeyArray = isReadonlyArray(key) ? key : key.split(delimiter);

  return hotkeyArray.every((hotkey) =>
    currentlyPressedKeys.has(hotkey.trim().toLowerCase())
  );
}

export function pushToCurrentlyPressedKeys(key: string | string[]): void {
  const hotkeyArray = Array.isArray(key) ? key : [key];

  /*
  Due to a weird behavior on macOS we need to clear the set if the user pressed down the meta key and presses another key.
  https://stackoverflow.com/questions/11818637/why-does-javascript-drop-keyup-events-when-the-metakey-is-pressed-on-mac-browser
  Otherwise the set will hold all ever pressed keys while the meta key is down which leads to wrong results.
   */
  if (currentlyPressedKeys.has('meta')) {
    currentlyPressedKeys.forEach(
      (key) =>
        !isHotkeyModifier(key) && currentlyPressedKeys.delete(key.toLowerCase())
    );
  }

  hotkeyArray.forEach((hotkey) =>
    currentlyPressedKeys.add(hotkey.toLowerCase())
  );
}

export function removeFromCurrentlyPressedKeys(key: string | string[]): void {
  const hotkeyArray = Array.isArray(key) ? key : [key];

  /*
  Due to a weird behavior on macOS we need to clear the set if the user pressed down the meta key and presses another key.
  https://stackoverflow.com/questions/11818637/why-does-javascript-drop-keyup-events-when-the-metakey-is-pressed-on-mac-browser
  Otherwise the set will hold all ever pressed keys while the meta key is down which leads to wrong results.
   */
  if (key === 'meta') {
    currentlyPressedKeys.clear();
  } else {
    hotkeyArray.forEach((hotkey) =>
      currentlyPressedKeys.delete(hotkey.toLowerCase())
    );
  }
}
