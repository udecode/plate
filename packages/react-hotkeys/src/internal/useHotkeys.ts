import {
  type DependencyList,
  type RefCallback,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import type { Key } from './key';
import type {
  HotkeyCallback,
  Keys,
  Options,
  OptionsOrDependencyArray,
  RefType,
} from './types';

import { useBoundHotkeysProxy } from './BoundHotkeysProxyProvider';
import { useHotkeysContext } from './HotkeysProvider';
import {
  pushToCurrentlyPressedKeys,
  removeFromCurrentlyPressedKeys,
} from './isHotkeyPressed';
import { mapKey, parseHotkey, parseKeysHookInput } from './parseHotkeys';
import useDeepEqualMemo from './useDeepEqualMemo';
import {
  isHotkeyEnabled,
  isHotkeyEnabledOnTag,
  isHotkeyMatchingKeyboardEvent,
  isKeyboardEventTriggeredByInput,
  isScopeActive,
  maybePreventDefault,
} from './validators';

const stopPropagation = (e: KeyboardEvent): void => {
  e.stopPropagation();
  e.preventDefault();
  e.stopImmediatePropagation();
};

const useSafeLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect;

export default function useHotkeys<T extends HTMLElement>(
  keys: Keys,
  callback: HotkeyCallback,
  options?: OptionsOrDependencyArray,
  dependencies?: OptionsOrDependencyArray
) {
  const [ref, setRef] = useState<RefType<T>>(null);
  const hasTriggeredRef = useRef(false);

  const _options: Options | undefined = Array.isArray(options)
    ? Array.isArray(dependencies)
      ? undefined
      : (dependencies as Options)
    : (options as Options);

  const _keys = useMemo(() => {
    if (Array.isArray(keys) && keys.length > 0 && Array.isArray(keys[0])) {
      // Handle Keys[][] case
      return (keys as (keyof typeof Key)[][])
        .map((keyCombo) =>
          keyCombo.map((k) => k.toString()).join(_options?.splitKey || '+')
        )
        .join(_options?.delimiter || ',');
    } else if (Array.isArray(keys)) {
      return keys.join(_options?.delimiter || ',');
    }

    return keys as string;
  }, [keys, _options?.splitKey, _options?.delimiter]);

  const _deps: DependencyList | undefined = Array.isArray(options)
    ? options
    : Array.isArray(dependencies)
      ? dependencies
      : undefined;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoisedCB = useCallback(callback, _deps ?? []);
  const cbRef = useRef<HotkeyCallback>(memoisedCB);

  cbRef.current = _deps ? memoisedCB : callback;

  const memoisedOptions = useDeepEqualMemo(_options);

  const { activeScopes } = useHotkeysContext();
  const proxy = useBoundHotkeysProxy();

  useSafeLayoutEffect(() => {
    if (
      memoisedOptions?.enabled === false ||
      !isScopeActive(activeScopes, memoisedOptions?.scopes)
    ) {
      return;
    }

    const listener = (e: KeyboardEvent, isKeyUp = false) => {
      if (
        isKeyboardEventTriggeredByInput(e) &&
        !isHotkeyEnabledOnTag(e, memoisedOptions?.enableOnFormTags)
      ) {
        return;
      }
      // TODO: SINCE THE EVENT IS NOW ATTACHED TO THE REF, THE ACTIVE ELEMENT CAN NEVER BE INSIDE THE REF. THE HOTKEY ONLY TRIGGERS IF THE
      // REF IS THE ACTIVE ELEMENT. THIS IS A PROBLEM SINCE FOCUSED SUB COMPONENTS WON'T TRIGGER THE HOTKEY.
      if (ref !== null) {
        const rootNode = ref.getRootNode();

        if (
          (rootNode instanceof Document || rootNode instanceof ShadowRoot) &&
          rootNode.activeElement !== ref &&
          !ref.contains(rootNode.activeElement)
        ) {
          stopPropagation(e);

          return;
        }
      }
      if (
        (e.target as HTMLElement)?.isContentEditable &&
        !memoisedOptions?.enableOnContentEditable
      ) {
        return;
      }

      parseKeysHookInput(_keys, memoisedOptions?.delimiter).forEach((key) => {
        const hotkey = parseHotkey(
          key,
          memoisedOptions?.splitKey,
          memoisedOptions?.useKey
        );

        if (
          isHotkeyMatchingKeyboardEvent(
            e,
            hotkey,
            memoisedOptions?.ignoreModifiers
          ) ||
          hotkey.keys?.includes('*')
        ) {
          // DIFF+
          if (
            (memoisedOptions?.ignoreEventWhenPrevented ?? true) &&
            e.defaultPrevented
          ) {
            // Skip the handler if the event's default action has been prevented
            return;
          }
          if (memoisedOptions?.ignoreEventWhen?.(e)) {
            return;
          }
          if (isKeyUp && hasTriggeredRef.current) {
            return;
          }

          // DIFF-
          // maybePreventDefault(e, hotkey, memoisedOptions?.preventDefault);

          if (!isHotkeyEnabled(e, hotkey, memoisedOptions?.enabled)) {
            stopPropagation(e);

            return;
          }

          // Execute the user callback for that hotkey
          cbRef.current(e, hotkey);

          maybePreventDefault(e, hotkey, memoisedOptions?.preventDefault);

          if (!isKeyUp) {
            hasTriggeredRef.current = true;
          }
        }
      });
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === undefined) {
        // Synthetic event (e.g., Chrome autofill).  Ignore.
        return;
      }

      pushToCurrentlyPressedKeys(mapKey(event.code));

      if (
        (memoisedOptions?.keydown === undefined &&
          memoisedOptions?.keyup !== true) ||
        memoisedOptions?.keydown
      ) {
        listener(event);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === undefined) {
        // Synthetic event (e.g., Chrome autofill).  Ignore.
        return;
      }

      removeFromCurrentlyPressedKeys(mapKey(event.code));

      hasTriggeredRef.current = false;

      if (memoisedOptions?.keyup) {
        listener(event, true);
      }
    };

    const domNode = ref || _options?.document || document;

    domNode.addEventListener('keyup', handleKeyUp as any);
    domNode.addEventListener('keydown', handleKeyDown as any);

    if (proxy) {
      parseKeysHookInput(_keys, memoisedOptions?.delimiter).forEach((key) =>
        proxy.addHotkey(
          parseHotkey(
            key,
            memoisedOptions?.splitKey,
            memoisedOptions?.useKey,
            memoisedOptions?.description
          )
        )
      );
    }

    return () => {
      domNode.removeEventListener('keyup', handleKeyUp as any);
      domNode.removeEventListener('keydown', handleKeyDown as any);

      if (proxy) {
        parseKeysHookInput(_keys, memoisedOptions?.delimiter).forEach((key) =>
          proxy.removeHotkey(
            parseHotkey(
              key,
              memoisedOptions?.splitKey,
              memoisedOptions?.useKey,
              memoisedOptions?.description
            )
          )
        );
      }
    };
  }, [ref, _keys, memoisedOptions, activeScopes]);

  return setRef as RefCallback<T>;
}
