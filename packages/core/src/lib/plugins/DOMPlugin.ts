import type { WithOverride } from '../plugin/types/PlatePlugin';

import { createPlugin } from '../plugin/createPlugin';

const noop = (returnValue?: any) => (() => returnValue) as any;

export const withDOM: WithOverride = ({ editor }) => {
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
export const DOMPlugin = createPlugin({
  key: 'dom',
  withOverrides: withDOM,
});
