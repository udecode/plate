import { useMemo } from 'react';
import type { Element, RootKey } from '@platejs/plite';
import { useEditor } from './use-editor';
import { useOptionalElementContext } from './use-element';
import { usePliteChildRoot } from './use-plite-child-root';
import {
  type PliteRootChromeController,
  type UsePliteRootChromeOptions,
  usePliteRootChrome,
} from './use-plite-root-chrome';

/** Options for resolving a schema-owned child content root. */
export type UsePliteContentRootOptions = UsePliteRootChromeOptions & {
  /**
   * Override the schema `contentRoot.slot` when one component can render more
   * than one projected content root.
   */
  slot?: string;
};

/** Resolved child root and chrome controller for nested editable content. */
export type PliteContentRootController = {
  chrome: PliteRootChromeController;
  root: RootKey;
};

/**
 * Resolve a schema-owned child content root and its root chrome controller.
 */
export function usePliteContentRoot(
  element?: Element | null,
  options: UsePliteContentRootOptions = {}
): PliteContentRootController {
  const editor = useEditor();
  const contextElement = useOptionalElementContext();
  const targetElement = element ?? contextElement;
  const { slot: slotOverride, ...chromeOptions } = options;
  const slot =
    slotOverride ??
    (targetElement
      ? editor.read(
          (state) =>
            state.schema.getElementSpec(targetElement.type)?.contentRoot
        )?.slot
      : undefined);
  const root = usePliteChildRoot(
    targetElement,
    slot ?? '__missing_content_root__'
  );
  const chrome = usePliteRootChrome(root, chromeOptions);

  if (!slot) {
    throw new Error(
      '`usePliteContentRoot` needs a contentRoot slot in the element spec or options.slot.'
    );
  }

  return useMemo(() => ({ chrome, root }), [chrome, root]);
}
