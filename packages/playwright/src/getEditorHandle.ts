import type { Locator, Page } from '@playwright/test';
import type { PlateEditor } from '@udecode/plate-common/react';

import type { EditorHandle } from './types';

import { getEditable } from './getEditable';
import { getAdapter } from './internal/getAdapter';

export const getEditorHandle = async <E extends PlateEditor = PlateEditor>(
  page: Page,
  editable?: Locator
): Promise<EditorHandle<E>> => {
  const editableLocator = editable ?? getEditable(page);
  const editableCount = await editableLocator.count();

  if (editableCount === 0) {
    const error = editable
      ? new Error(
          'getEditorHandle: the given locator did not match any element'
        )
      : new Error(
          'getEditorHandle: could not find a [data-slate-editor] on the page'
        );

    throw error;
  } else if (editableCount > 1) {
    const error = editable
      ? new Error(
          'getEditorHandle: the given locator matched more than one element'
        )
      : new Error(
          'getEditorHandle: matched more than one editor. Pass a locator as the second argument of getEditorHandle to disambiguate.'
        );

    throw error;
  }
  // eslint-disable-next-line unicorn/prefer-dom-node-dataset
  if ((await editableLocator.getAttribute('data-slate-editor')) === null) {
    throw new Error(
      'getEditorHandle: the element matched by the given locator is not a [data-slate-editor]. Use getEditable to locate the editable element before passing it to getEditorHandle.'
    );
  }

  const editableHandle = await editableLocator.elementHandle();

  const adapterHandle = await getAdapter(page);

  return page.evaluateHandle(
    ([adapter, editable]) => {
      const editor = adapter.EDITABLE_TO_EDITOR.get(editable as any);

      if (!editor) {
        throw new Error(
          'getEditorHandle: could not get the editor instance for the editable. Ensure that <PlatePlaywrightAdapter /> is rendered as a child of the Plate editor.'
        );
      }

      return editor as E;
    },
    [adapterHandle, editableHandle] as const
  );
};
