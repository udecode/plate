import { useMemo } from 'react';

import type { Element, NamedRootKey } from '../..';
import { useEditorContext } from './use-editor-context';
import { useOptionalElement } from './use-element';
import { usePliteChildRoot } from './use-plite-child-root';
import {
  type PliteRootChromeController,
  type UsePliteRootChromeOptions,
  usePliteRootChrome,
} from './use-plite-root-chrome';

/** Options for resolving a schema-owned child content root. */
export type UsePliteContentRootOptions = UsePliteRootChromeOptions & {
  /** Select one schema `contentRoots` slot. Optional for single-slot elements. */
  slot?: string;
};

/** Resolved child root and chrome controller for nested editable content. */
export type PliteContentRootController = {
  chrome: PliteRootChromeController;
  root: NamedRootKey;
};

/**
 * Resolve a schema-owned child content root and its root chrome controller.
 */
export function usePliteContentRoot(
  element?: Element | null,
  options: UsePliteContentRootOptions = {}
): PliteContentRootController {
  const editor = useEditorContext();
  const contextElement = useOptionalElement();
  const targetElement = element ?? contextElement;
  const { slot: slotOverride, ...chromeOptions } = options;
  const declaredSlots = targetElement
    ? editor.read((state) =>
        Object.keys(
          state.schema.element(targetElement.type)?.contentRoots ?? {}
        )
      )
    : [];
  const slot =
    slotOverride ?? (declaredSlots.length === 1 ? declaredSlots[0] : undefined);

  if (!slot || !declaredSlots.includes(slot)) {
    throw new Error(
      '`usePliteContentRoot` needs a declared contentRoots slot; pass options.slot when the element declares more than one.'
    );
  }
  const root = usePliteChildRoot(targetElement, slot);
  const chrome = usePliteRootChrome(root, chromeOptions);

  return useMemo(() => ({ chrome, root }), [chrome, root]);
}
