import { TextApi, type Point, type SlateEditor } from 'platejs';

import { getFootnoteReferences } from '../queries/getFootnoteReferences';

export const getFootnoteReferenceSelectionPoint = (
  editor: SlateEditor,
  path: number[]
) => {
  const parentEntry = editor.api.parent(path);

  let point: Point | undefined;

  if (parentEntry) {
    const [parent, parentPath] = parentEntry;
    const childIndex = path.at(-1) ?? -1;
    const nextSibling = parent.children[childIndex + 1];
    const previousSibling = parent.children[childIndex - 1];

    if (TextApi.isText(nextSibling)) {
      point = {
        offset: 0,
        path: parentPath.concat([childIndex + 1]),
      };
    } else if (TextApi.isText(previousSibling)) {
      point = {
        offset: previousSibling.text.length,
        path: parentPath.concat([childIndex - 1]),
      };
    }
  }

  point ??= editor.api.start(path.concat([0]));

  return point;
};

export const focusFootnoteReference = (
  editor: SlateEditor,
  {
    identifier,
    index = 0,
  }: {
    identifier: string;
    index?: number;
  }
) => {
  const reference = getFootnoteReferences(editor, { identifier })[index];

  if (!reference) return false;

  const point = getFootnoteReferenceSelectionPoint(editor, reference[1]);

  if (!point) return false;

  return editor.tf.navigation.navigate({
    focus: true,
    scroll: true,
    scrollTarget: point,
    select: {
      anchor: point,
      focus: point,
    },
    target: {
      path: reference[1],
      type: 'node',
    },
  });
};
