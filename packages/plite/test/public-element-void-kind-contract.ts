import {
  element,
  type SchemaElement,
  type SchemaElementContentRoot,
} from '@platejs/plite';

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
type ElementVoidKind = NonNullable<SchemaElement['void']>;

type _VoidKindIsExplicitPreset = Assert<
  Equal<ElementVoidKind, ExplicitVoidKind>
>;
type _BooleanIsNotVoidKind = Assert<
  boolean extends ElementVoidKind ? false : true
>;
type _ContentRootSpecIsObjectOnly = Assert<
  Equal<NonNullable<SchemaElement['contentRoot']>, SchemaElementContentRoot>
>;

const blockVoid = element({ void: 'block' });
const inlineVoid = element({ void: 'inline' });
const markableInlineVoid = element({
  void: 'markable-inline',
});
const editableIslandVoid = element({
  void: 'editable-island',
});
const editorOnlyRootedContent = element({
  contentRoot: { slot: 'body' },
});
const nonVoid = element({});

void blockVoid;
void inlineVoid;
void markableInlineVoid;
void editableIslandVoid;
void editorOnlyRootedContent;
void nonVoid;
