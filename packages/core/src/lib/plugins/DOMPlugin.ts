import type { WithOverride } from '../plugin/types/PlatePlugin';

import { createPlugin } from '../plugin/createPlugin';

const noop: {
  (): () => void;
  <T>(returnValue: T): () => T;
} =
  <T>(returnValue?: T) =>
  () =>
    returnValue;

export const withDOM: WithOverride = ({ editor }) => {
  editor.hasEditableTarget = noop(false) as any;
  editor.hasRange = noop(false);
  editor.hasSelectableTarget = noop(false);
  editor.hasTarget = noop(false) as any;
  editor.insertData = noop();
  editor.insertFragmentData = noop() as any;
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
