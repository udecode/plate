import { useMemo } from 'react';
import type { Element, RootKey } from '@platejs/slate';
import { useEditor } from './use-editor';
import { useOptionalElementContext } from './use-element';
import { useSlateChildRoot } from './use-slate-child-root';
import {
  type SlateRootChromeController,
  type UseSlateRootChromeOptions,
  useSlateRootChrome,
} from './use-slate-root-chrome';

/** Options for resolving a schema-owned child content root. */
export type UseSlateContentRootOptions = UseSlateRootChromeOptions & {
  /**
   * Override the schema `contentRoot.slot` when one component can render more
   * than one projected content root.
   */
  slot?: string;
};

/** Resolved child root and chrome controller for nested editable content. */
export type SlateContentRootController = {
  chrome: SlateRootChromeController;
  root: RootKey;
};

/**
 * Resolve a schema-owned child content root and its root chrome controller.
 */
export function useSlateContentRoot(
  element?: Element | null,
  options: UseSlateContentRootOptions = {}
): SlateContentRootController {
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
  const root = useSlateChildRoot(
    targetElement,
    slot ?? '__missing_content_root__'
  );
  const chrome = useSlateRootChrome(root, chromeOptions);

  if (!slot) {
    throw new Error(
      '`useSlateContentRoot` needs a contentRoot slot in the element spec or options.slot.'
    );
  }

  return useMemo(() => ({ chrome, root }), [chrome, root]);
}
