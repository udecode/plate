import type { PlateEditor } from '../shared/types';

import { createPluginFactory } from '../shared/utils/createPluginFactory';

const noop = (returnValue?: any) => (() => returnValue) as any;

export const withReact = (editor: PlateEditor) => {
  editor.hasEditableTarget = noop(false);
  editor.hasRange = noop(false);
  editor.hasSelectableTarget = noop(false);
  editor.hasTarget = noop(false);
  editor.insertData = noop();
  editor.insertFragmentData = noop();
  editor.insertTextData = noop(false);
  editor.isTargetInsideNonReadonlyVoid = noop(false);
  editor.setFragmentData = noop();

  return editor;
};

/** @see {@link withReact} with noop methods for server-side support. */
export const createReactPlugin = createPluginFactory({
  key: 'react',
  withOverrides: withReact,
});
