import {
  schema,
  type SchemaContentRootInput,
  type SchemaElement,
} from 'plitejs';

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
  Equal<
    NonNullable<SchemaElement['contentRoots']>,
    Readonly<Record<string, SchemaContentRootInput>>
  >
>;

const blockVoid = { void: 'block' } as const;
const inlineVoid = { void: 'inline' } as const;
const markableInlineVoid = {
  void: 'markable-inline',
} as const;
const editableIslandVoid = {
  void: 'editable-island',
} as const;
const editorOnlyRootedContent = {
  contentRoots: { body: schema.content.open() },
} as const satisfies SchemaElement;
const nonVoid = {} as const;

void blockVoid;
void inlineVoid;
void markableInlineVoid;
void editableIslandVoid;
void editorOnlyRootedContent;
void nonVoid;
