import {
  type DependencyList,
  type RefCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { useBoundHotkeysProxy } from './BoundHotkeysProxyProvider';
import { useHotkeysContext } from './HotkeysProvider';
import {
  pushToCurrentlyPressedKeys,
  removeFromCurrentlyPressedKeys,
} from './isHotkeyPressed';
import { mapKey, parseHotkey, parseKeysHookInput } from './parseHotkeys';
import type {
  HotkeyCallback,
  Keys,
  Options,
  OptionsOrDependencyArray,
  RefType,
} from './types';
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

function isDependencyList(
  value: OptionsOrDependencyArray | undefined
): value is DependencyList {
  return Array.isArray(value);
}

function isKeyCombinationList(
  keys: Exclude<Keys, string>
): keys is Extract<Keys, readonly (readonly string[])[]> {
  return keys.length > 0 && keys.every((key) => Array.isArray(key));
}

function normalizeKeys(keys: Keys, options: Options | undefined): string {
  if (typeof keys === 'string') return keys;

  if (isKeyCombinationList(keys)) {
    return keys
      .map((combination) => combination.join(options?.splitKey ?? '+'))
      .join(options?.delimiter ?? ',');
  }

  return keys.join(options?.delimiter ?? ',');
}

function dependenciesChanged(
  previous: DependencyList | undefined,
  next: DependencyList
) {
  return (
    previous === undefined ||
    previous.length !== next.length ||
    next.some((value, index) => !Object.is(value, previous[index]))
  );
}

export default function useHotkeys<T extends HTMLElement>(
  keys: Keys,
  callback: HotkeyCallback,
  options?: OptionsOrDependencyArray,
  dependencies?: OptionsOrDependencyArray
): RefCallback<T> {
  const [ref, setRef] = useState<RefType<T>>(null);
  const hasTriggeredRef = useRef(false);

  const resolvedOptions = isDependencyList(options)
    ? isDependencyList(dependencies)
      ? undefined
      : dependencies
    : options;
  const resolvedDependencies = isDependencyList(options)
    ? options
    : isDependencyList(dependencies)
      ? dependencies
      : undefined;
  const normalizedKeys = normalizeKeys(keys, resolvedOptions);
  const callbackRef = useRef(callback);
  const dependenciesRef = useRef<DependencyList | undefined>(undefined);
  const optionsRef = useRef(resolvedOptions);

  useSafeLayoutEffect(() => {
    optionsRef.current = resolvedOptions;

    if (
      !resolvedDependencies ||
      dependenciesChanged(dependenciesRef.current, resolvedDependencies)
    ) {
      callbackRef.current = callback;
    }
    dependenciesRef.current = resolvedDependencies;
  });

  const description = resolvedOptions?.description;
  const delimiter = resolvedOptions?.delimiter;
  const explicitlyDisabled = resolvedOptions?.enabled === false;
  const scopesKey = JSON.stringify(resolvedOptions?.scopes);
  const splitKey = resolvedOptions?.splitKey;
  const targetDocument = resolvedOptions?.document;
  const useKey = resolvedOptions?.useKey;
  const { activeScopes } = useHotkeysContext();
  const proxy = useBoundHotkeysProxy();

  useSafeLayoutEffect(() => {
    const options = optionsRef.current;

    if (explicitlyDisabled || !isScopeActive(activeScopes, options?.scopes)) {
      return;
    }

    const listener = (e: KeyboardEvent, isKeyUp = false) => {
      const currentOptions = optionsRef.current;

      if (
        isKeyboardEventTriggeredByInput(e) &&
        !isHotkeyEnabledOnTag(e, currentOptions?.enableOnFormTags)
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
        e.target instanceof HTMLElement &&
        e.target.isContentEditable &&
        !currentOptions?.enableOnContentEditable
      ) {
        return;
      }

      parseKeysHookInput(normalizedKeys, currentOptions?.delimiter).forEach(
        (key) => {
          const hotkey = parseHotkey(
            key,
            currentOptions?.splitKey,
            currentOptions?.useKey
          );

          if (
            isHotkeyMatchingKeyboardEvent(
              e,
              hotkey,
              currentOptions?.ignoreModifiers
            ) ||
            hotkey.keys?.includes('*')
          ) {
            // DIFF+
            if (
              (currentOptions?.ignoreEventWhenPrevented ?? true) &&
              e.defaultPrevented
            ) {
              // Skip the handler if the event's default action has been prevented
              return;
            }
            if (currentOptions?.ignoreEventWhen?.(e)) {
              return;
            }
            if (isKeyUp && hasTriggeredRef.current) {
              return;
            }
            if (!isHotkeyEnabled(e, hotkey, currentOptions?.enabled)) {
              stopPropagation(e);

              return;
            }

            // Execute the user callback for that hotkey
            callbackRef.current(e, hotkey);

            // DIFF: after callback
            maybePreventDefault(e, hotkey, currentOptions?.preventDefault);

            if (!isKeyUp) {
              hasTriggeredRef.current = true;
            }
          }
        }
      );
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === undefined) {
        // Synthetic event (e.g., Chrome autofill).  Ignore.
        return;
      }

      pushToCurrentlyPressedKeys(mapKey(event.code));

      if (
        (optionsRef.current?.keydown === undefined &&
          optionsRef.current?.keyup !== true) ||
        optionsRef.current?.keydown
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

      if (optionsRef.current?.keyup) {
        listener(event, true);
      }
    };

    const domNode = ref ?? targetDocument ?? document;
    const handleKeyDownEvent: EventListener = (event) => {
      if (event instanceof KeyboardEvent) handleKeyDown(event);
    };
    const handleKeyUpEvent: EventListener = (event) => {
      if (event instanceof KeyboardEvent) handleKeyUp(event);
    };

    domNode.addEventListener('keyup', handleKeyUpEvent);
    domNode.addEventListener('keydown', handleKeyDownEvent);

    if (proxy) {
      for (const key of parseKeysHookInput(normalizedKeys, delimiter)) {
        proxy.addHotkey(parseHotkey(key, splitKey, useKey, description));
      }
    }

    return () => {
      domNode.removeEventListener('keyup', handleKeyUpEvent);
      domNode.removeEventListener('keydown', handleKeyDownEvent);

      if (proxy) {
        for (const key of parseKeysHookInput(normalizedKeys, delimiter)) {
          proxy.removeHotkey(parseHotkey(key, splitKey, useKey, description));
        }
      }
    };
  }, [
    activeScopes,
    delimiter,
    description,
    explicitlyDisabled,
    normalizedKeys,
    proxy,
    ref,
    scopesKey,
    splitKey,
    targetDocument,
    useKey,
  ]);

  return setRef;
}
