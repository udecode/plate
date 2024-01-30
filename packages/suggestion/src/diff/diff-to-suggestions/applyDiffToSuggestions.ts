import {
  addRangeMarks,
  getNode,
  getNodeParent,
  getPreviousPath,
  insertNodes,
  isText,
  nanoid,
  PlateEditor,
  setNodes,
  TDescendant,
  TInsertNodeOperation,
  TInsertTextOperation,
  TMergeNodeOperation,
  TOperation,
  TRemoveNodeOperation,
  TRemoveTextOperation,
  withoutNormalizing,
} from '@udecode/plate-common';
import { Path } from 'slate';

import { getSuggestionProps } from '../../transforms';
import { TSuggestionText } from '../../types';

const insertTextSuggestion = (
  editor: PlateEditor,
  op: TInsertTextOperation,
  {
    idFactory,
  }: {
    idFactory: () => string;
  }
) => {
  const text = op.text;
  const id = idFactory();

  const target = getNode(editor, op.path);

  insertNodes<TSuggestionText>(
    editor,
    {
      ...target,
      text,
      ...getSuggestionProps(editor, id),
    },
    {
      at: {
        path: op.path,
        offset: op.offset,
      },
    }
  );
};

export const insertNodeSuggestion = (
  editor: PlateEditor,
  op: TInsertNodeOperation,
  {
    idFactory,
  }: {
    idFactory: () => string;
  }
) => {
  const id = idFactory();

  insertNodes<TSuggestionText>(
    editor,
    {
      ...(op.node as any),
      ...getSuggestionProps(editor, id),
    },
    {
      at: op.path,
    }
  );
};

export const mergeNodeSuggestion = (
  editor: PlateEditor,
  op: TMergeNodeOperation,
  {
    idFactory,
  }: {
    idFactory: () => string;
  }
) => {
  const { path } = op;
  const node = getNode<TDescendant>(editor, path);

  if (!node) return;

  const prevPath = getPreviousPath(path);
  if (!prevPath) return;

  const prev = getNode<TDescendant>(editor, prevPath);
  if (!prev) return;

  const parent = getNodeParent(editor, path);
  if (!parent) return;

  if (isText(node) && isText(prev)) {
    removeTextSuggestion(
      editor,
      {
        type: 'remove_text',
        path: path,
        offset: 0,
        text: node.text,
      },
      { idFactory }
    );

    insertNodeSuggestion(
      editor,
      {
        type: 'insert_node',
        node: {
          ...prev,
          text: node.text,
        },
        path: Path.next(path),
      },
      { idFactory }
    );
  } else if (!isText(node) && !isText(prev)) {
    let index = prev.children.length;
    node.children.forEach((child) => {
      insertNodeSuggestion(
        editor,
        {
          type: 'insert_node',
          node: child,
          path: prevPath.concat([index]),
        },
        { idFactory }
      );
      index += 1;
    });

    removeNodeSuggestion(
      editor,
      {
        type: 'remove_node',
        path,
        node,
      },
      { idFactory }
    );
  } else {
    return;
  }
};

export const removeTextSuggestion = (
  editor: PlateEditor,
  op: TRemoveTextOperation,
  {
    idFactory,
  }: {
    idFactory: () => string;
  }
) => {
  const id = idFactory();

  addRangeMarks(
    editor,
    getSuggestionProps(editor, id, { suggestionDeletion: true }),
    {
      at: {
        anchor: {
          path: op.path,
          offset: op.offset,
        },
        focus: {
          path: op.path,
          offset: op.offset + op.text.length,
        },
      },
    }
  );
};

export const removeNodeSuggestion = (
  editor: PlateEditor,
  op: TRemoveNodeOperation,
  {
    idFactory,
  }: {
    idFactory: () => string;
  }
) => {
  setNodes(
    editor,
    getSuggestionProps(editor, idFactory(), {
      suggestionDeletion: true,
    }),
    { at: op.path }
  );
};

export const applyDiffToSuggestions = (
  editor: PlateEditor,
  diffOperations: TOperation[],
  {
    idFactory = nanoid,
  }: {
    idFactory?: () => string;
  } = {}
) => {
  withoutNormalizing(editor, () => {
    diffOperations.forEach((op) => {
      switch (op.type) {
        case 'insert_text': {
          insertTextSuggestion(editor, op, { idFactory });
          return;
        }
        case 'remove_text': {
          removeTextSuggestion(editor, op, { idFactory });
          return;
        }
        case 'insert_node': {
          insertNodeSuggestion(editor, op, { idFactory });
          return;
        }
        case 'remove_node': {
          removeNodeSuggestion(editor, op, { idFactory });
          return;
        }
        case 'merge_node': {
          mergeNodeSuggestion(editor, op, { idFactory });
          return;
        }
        case 'split_node': {
          editor.apply(op);
          return;
        }
        case 'set_node': {
          editor.apply(op);
          return;
        }
        case 'move_node': {
          // never
          editor.apply(op);
          return;
        }
        case 'set_selection': {
          // never
          editor.apply(op);
          return;
        }
        // No default
      }
    });
  });
};
