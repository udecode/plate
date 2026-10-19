import type { DeviceEditor } from '@platejs/test/device';

type Leaf = { bold?: boolean; children?: Leaf[]; text?: string; type?: string };

/** The leaf the collapsed caret sits in, with the text before the caret. */
export const caretLeaf = async (editor: DeviceEditor) => {
  const selection = await editor.get.selection();
  const value = (await editor.get.modelValue()) as Leaf;

  if (!selection) return null;

  const { anchor, focus } = selection;
  let node: Leaf | undefined = value;

  for (const index of anchor.path) node = node?.children?.[index];

  return {
    before: (node?.text ?? '').slice(0, anchor.offset),
    collapsed:
      anchor.offset === focus.offset &&
      anchor.path.join(',') === focus.path.join(','),
    leaf: node,
    path: anchor.path,
  };
};

export const blocks = async (editor: DeviceEditor) =>
  ((await editor.get.modelValue()) as Leaf).children ?? [];
