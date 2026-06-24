import type { EditorElementSpec, EditorElementVoidKind } from '@platejs/plite';

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;
type Assert<T extends true> = T;

type ExplicitVoidKind =
  | 'block'
  | 'editable-island'
  | 'inline'
  | 'markable-inline';

type _VoidKindIsExplicitPreset = Assert<
  Equal<EditorElementVoidKind, ExplicitVoidKind>
>;
type _BooleanIsNotVoidKind = Assert<
  boolean extends EditorElementVoidKind ? false : true
>;
type _SpecVoidUsesExplicitPreset = Assert<
  Equal<NonNullable<EditorElementSpec['void']>, ExplicitVoidKind>
>;
type _ContentRootSpecIsObjectOnly = Assert<
  Equal<NonNullable<EditorElementSpec['contentRoot']>, { slot: string }>
>;

const blockVoid: EditorElementSpec = { type: 'image', void: 'block' };
const inlineVoid: EditorElementSpec = { type: 'emoji', void: 'inline' };
const markableInlineVoid: EditorElementSpec = {
  type: 'mention',
  void: 'markable-inline',
};
const editableIslandVoid: EditorElementSpec = {
  type: 'editable-void',
  void: 'editable-island',
};
const editorOnlyRootedContent: EditorElementSpec = {
  type: 'details-content',
  contentRoot: { slot: 'body' },
};
const nonVoid: EditorElementSpec = { type: 'paragraph' };

void blockVoid;
void inlineVoid;
void markableInlineVoid;
void editableIslandVoid;
void editorOnlyRootedContent;
void nonVoid;
