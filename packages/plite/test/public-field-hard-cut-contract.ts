import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  getOperations as editorGetOperations,
  getSelection as editorGetSelection,
  replace as editorReplace,
  string as editorString,
} from '@platejs/plite/internal';

import {
  type BaseEditor,
  createEditor,
  type Editor as EditorType,
} from '../src';

type PublicStateKeys = Extract<
  keyof EditorType,
  'children' | 'marks' | 'operations' | 'selection'
>;

const editorHasNoPublicStateKeys: PublicStateKeys extends never ? true : never =
  true;

type ApplyOperationsKey = `apply${'Operations'}`;
type SetBlockKey = `set${'Block'}`;
type ToggleAlignmentKey = `toggle${'Alignment'}`;
type ToggleBlockKey = `toggle${'Block'}`;
type ToggleListKey = `toggle${'List'}`;
type WithTransactionKey = `with${'Transaction'}`;

const staleApplyOperationsKey = `apply${'Operations'}` as const;
const staleSetBlockKey = `set${'Block'}` as const;
const staleToggleAlignmentKey = `toggle${'Alignment'}` as const;
const staleToggleBlockKey = `toggle${'Block'}` as const;
const staleToggleListKey = `toggle${'List'}` as const;
const staleWithTransactionKey = `with${'Transaction'}` as const;

type PublicPrimitiveWriterKeys = Extract<
  keyof EditorType,
  | ApplyOperationsKey
  | 'addMark'
  | 'collapse'
  | 'delete'
  | 'deleteBackward'
  | 'deleteForward'
  | 'deleteFragment'
  | 'deselect'
  | 'insertBreak'
  | 'insertFragment'
  | 'insertNode'
  | 'insertNodes'
  | 'insertSoftBreak'
  | 'insertText'
  | 'liftNodes'
  | 'mergeNodes'
  | 'move'
  | 'moveNodes'
  | 'normalize'
  | 'removeMark'
  | 'removeNodes'
  | 'select'
  | SetBlockKey
  | 'setNodes'
  | 'setNormalizing'
  | 'setPoint'
  | 'setSelection'
  | 'splitNodes'
  | ToggleAlignmentKey
  | ToggleBlockKey
  | ToggleListKey
  | 'toggleMark'
  | 'unsetNodes'
  | 'unwrapNodes'
  | 'withoutNormalizing'
  | 'wrapNodes'
>;

const baseEditorHasNoPrimitiveWriters: PublicPrimitiveWriterKeys extends never
  ? true
  : never = true;

type PublicEditorInstanceAliasKeys = Extract<
  keyof BaseEditor,
  | 'end'
  | 'getMarks'
  | 'isElementReadOnly'
  | 'isInline'
  | 'isSelectable'
  | 'isVoid'
  | 'markableVoid'
  | 'node'
  | 'nodes'
  | 'start'
  | WithTransactionKey
>;

const baseEditorHasNoInstanceAliases: PublicEditorInstanceAliasKeys extends never
  ? true
  : never = true;

type PublicEditorNamespaceStateQueryKeys = Extract<
  keyof typeof Editor,
  | 'end'
  | 'marks'
  | 'node'
  | 'nodes'
  | SetBlockKey
  | 'start'
  | ToggleAlignmentKey
  | ToggleBlockKey
  | ToggleListKey
  | WithTransactionKey
>;

const editorNamespaceHasNoStateQueries: PublicEditorNamespaceStateQueryKeys extends never
  ? true
  : never = true;

describe('public editor field hard cuts', () => {
  void editorHasNoPublicStateKeys;
  void baseEditorHasNoPrimitiveWriters;
  void baseEditorHasNoInstanceAliases;
  void editorNamespaceHasNoStateQueries;

  it('does not expose stale state mirrors on editor instances', () => {
    const editor = createEditor();

    for (const property of [
      staleApplyOperationsKey,
      'children',
      'end',
      'getMarks',
      'addMark',
      'collapse',
      'delete',
      'deleteBackward',
      'deleteForward',
      'deleteFragment',
      'deselect',
      'isElementReadOnly',
      'isInline',
      'isSelectable',
      'isVoid',
      'insertBreak',
      'insertFragment',
      'insertNode',
      'insertNodes',
      'insertSoftBreak',
      'insertText',
      'liftNodes',
      'markableVoid',
      'mergeNodes',
      'move',
      'moveNodes',
      'marks',
      'node',
      'nodes',
      'operations',
      'removeMark',
      'removeNodes',
      'select',
      'selection',
      staleSetBlockKey,
      'setNodes',
      'setNormalizing',
      'setPoint',
      'setSelection',
      'splitNodes',
      'start',
      staleToggleAlignmentKey,
      staleToggleBlockKey,
      staleToggleListKey,
      'toggleMark',
      'unsetNodes',
      'unwrapNodes',
      staleWithTransactionKey,
      'withoutNormalizing',
      'wrapNodes',
    ] as const) {
      assert.equal(property in editor, false);
      assert.equal((editor as Record<string, unknown>)[property], undefined);
    }
  });

  it('keeps tx methods as the normal public write path', () => {
    const editor = createEditor();

    editorReplace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ text: 'alpha' }],
        },
      ],
      selection: {
        anchor: { path: [0, 0], offset: 5 },
        focus: { path: [0, 0], offset: 5 },
      },
      marks: null,
    });

    editor.update((tx) => {
      tx.text.insert('!');
    });

    assert.equal(editorString(editor, []), 'alpha!');
    assert.deepEqual(editorGetSelection(editor), {
      anchor: { path: [0, 0], offset: 6 },
      focus: { path: [0, 0], offset: 6 },
    });
    assert.equal(editorGetOperations(editor).length, 1);
  });

  it('does not expose editor-state query helpers on the Editor namespace', () => {
    for (const property of [
      'end',
      'marks',
      'node',
      'nodes',
      staleSetBlockKey,
      'start',
      staleToggleAlignmentKey,
      staleToggleBlockKey,
      staleToggleListKey,
      staleWithTransactionKey,
    ] as const) {
      assert.equal(property in Editor, false);
      assert.equal((Editor as Record<string, unknown>)[property], undefined);
    }
  });
});
