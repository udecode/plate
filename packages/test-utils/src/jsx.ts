import {
  type Descendant,
  type Element,
  type Selection,
  type Text,
  createEditor as createPliteEditor,
} from '@platejs/plite';
import {
  createEditorFixture,
  createHyperscript,
  createText,
  type HyperscriptCreators,
  type HyperscriptShorthands,
  jsx as pliteJsx,
} from '@platejs/plite-hyperscript';

export {
  createEditor,
  createHyperscript,
} from '@platejs/plite-hyperscript';

export type TestEditorFixture = {
  children: Element[];
  selection?: Selection;
};

export type TestEditor = TestEditorFixture;

export const createEditorFromFixture = (fixture: TestEditorFixture) =>
  createPliteEditor({
    initialSelection: fixture.selection,
    ...(fixture.children.length > 0 ? { initialValue: fixture.children } : {}),
  });

type HyperscriptIntrinsicAttributes = {
  [key: string]: unknown;
  children?: unknown;
};

declare global {
  // biome-ignore lint/style/noNamespace: Required for TypeScript JSX typing
  namespace JSX {
    interface IntrinsicElements {
      anchor: HyperscriptIntrinsicAttributes;
      cursor: HyperscriptIntrinsicAttributes;
      editor: HyperscriptIntrinsicAttributes;
      element: HyperscriptIntrinsicAttributes;
      focus: HyperscriptIntrinsicAttributes;
      fragment: HyperscriptIntrinsicAttributes;
      ha: HyperscriptIntrinsicAttributes;
      haudio: HyperscriptIntrinsicAttributes;
      hblockquote: HyperscriptIntrinsicAttributes;
      hcallout: HyperscriptIntrinsicAttributes;
      hcodeblock: HyperscriptIntrinsicAttributes;
      hcodedrawing: HyperscriptIntrinsicAttributes;
      hcodeline: HyperscriptIntrinsicAttributes;
      hcolumn: HyperscriptIntrinsicAttributes;
      hcolumngroup: HyperscriptIntrinsicAttributes;
      hdate: HyperscriptIntrinsicAttributes;
      hdefault: HyperscriptIntrinsicAttributes;
      hequation: HyperscriptIntrinsicAttributes;
      hexcalidraw: HyperscriptIntrinsicAttributes;
      hfile: HyperscriptIntrinsicAttributes;
      hfootnoteDefinition: HyperscriptIntrinsicAttributes;
      hfootnoteReference: HyperscriptIntrinsicAttributes;
      hh1: HyperscriptIntrinsicAttributes;
      hh2: HyperscriptIntrinsicAttributes;
      hh3: HyperscriptIntrinsicAttributes;
      hh4: HyperscriptIntrinsicAttributes;
      hh5: HyperscriptIntrinsicAttributes;
      hh6: HyperscriptIntrinsicAttributes;
      himg: HyperscriptIntrinsicAttributes;
      hinlineequation: HyperscriptIntrinsicAttributes;
      hli: HyperscriptIntrinsicAttributes;
      hlic: HyperscriptIntrinsicAttributes;
      hmediaembed: HyperscriptIntrinsicAttributes;
      hmention: HyperscriptIntrinsicAttributes;
      hmentioninput: HyperscriptIntrinsicAttributes;
      hnli: HyperscriptIntrinsicAttributes;
      hol: HyperscriptIntrinsicAttributes;
      hp: HyperscriptIntrinsicAttributes;
      hplaceholder: HyperscriptIntrinsicAttributes;
      htable: HyperscriptIntrinsicAttributes;
      htd: HyperscriptIntrinsicAttributes;
      htext: {
        [key: string]: unknown;
        bold?: boolean;
        children?: unknown;
        code?: boolean;
        italic?: boolean;
        underline?: boolean;
      };
      hth: HyperscriptIntrinsicAttributes;
      htoc: HyperscriptIntrinsicAttributes;
      htodoli: HyperscriptIntrinsicAttributes;
      htoggle: HyperscriptIntrinsicAttributes;
      htr: HyperscriptIntrinsicAttributes;
      hul: HyperscriptIntrinsicAttributes;
      hvideo: HyperscriptIntrinsicAttributes;
      selection: HyperscriptIntrinsicAttributes;
      text: HyperscriptIntrinsicAttributes;
    }
  }
}

export const voidChildren: Text[] = [{ text: '' }];

export const elements = {
  ha: { type: 'a' },
  haudio: { type: 'audio' },
  hblockquote: { type: 'blockquote' },
  hcallout: { type: 'callout' },
  hcodeblock: { type: 'code_block' },
  hcodedrawing: { type: 'code_drawing' },
  hcodeline: { type: 'code_line' },
  hcolumn: { type: 'column' },
  hcolumngroup: { type: 'column_group' },
  hdate: { type: 'date' },
  hdefault: { type: 'p' },
  hequation: { type: 'equation' },
  hexcalidraw: { type: 'excalidraw' },
  hfile: { type: 'file' },
  hfootnoteDefinition: { type: 'footnoteDefinition' },
  hfootnoteReference: { type: 'footnoteReference' },
  hh1: { type: 'h1' },
  hh2: { type: 'h2' },
  hh3: { type: 'h3' },
  hh4: { type: 'h4' },
  hh5: { type: 'h5' },
  hh6: { type: 'h6' },
  himg: { type: 'img' },
  hinlineequation: { type: 'inline_equation' },
  hli: { type: 'li' },
  hlic: { type: 'lic' },
  hmediaembed: { type: 'media_embed' },
  hmention: { type: 'mention' },
  hmentioninput: { type: 'mention_input' },
  hnli: { type: 'nli' },
  hol: { type: 'ol' },
  hp: { type: 'p' },
  hplaceholder: { type: 'placeholder' },
  htable: { type: 'table' },
  htd: { type: 'td' },
  hth: { type: 'th' },
  htoc: { type: 'toc' },
  htodoli: { type: 'action_item' },
  htoggle: { type: 'toggle' },
  htr: { type: 'tr' },
  hul: { type: 'ul' },
  hvideo: { type: 'video' },
} as const satisfies HyperscriptShorthands;

const createElementWithDefaultText =
  (type: string) =>
  (
    _tagName: string,
    attributes: Record<string, unknown>,
    children: unknown[]
  ): Element => ({
    type,
    ...attributes,
    children:
      children.length > 0
        ? pliteJsx('fragment', {}, ...children)
        : voidChildren.map((child) => ({ ...child })),
  });

const defaultTextElementCreators = {
  haudio: createElementWithDefaultText('audio'),
  hcodedrawing: createElementWithDefaultText('code_drawing'),
  hdate: createElementWithDefaultText('date'),
  hfile: createElementWithDefaultText('file'),
  himg: createElementWithDefaultText('img'),
  hmediaembed: createElementWithDefaultText('media_embed'),
  hmention: createElementWithDefaultText('mention'),
  hmentioninput: createElementWithDefaultText('mention_input'),
  hplaceholder: createElementWithDefaultText('placeholder'),
  hvideo: createElementWithDefaultText('video'),
} satisfies HyperscriptCreators<Element>;

const plateHyperscript = createHyperscript({
  creators: {
    ...defaultTextElementCreators,
    editor: createEditorFixture,
    htext: createText,
  },
  elements,
});

type PlateElementTag = keyof typeof elements;
type PlateHyperscriptTag = Parameters<typeof plateHyperscript>[0];

export function jsx(
  tagName: 'editor',
  attributes?: object | null,
  ...children: unknown[]
): TestEditor;
export function jsx(
  tagName: 'fragment',
  attributes?: object | null,
  ...children: unknown[]
): Descendant[];
export function jsx(
  tagName: 'htext' | 'text',
  attributes?: object | null,
  ...children: unknown[]
): Text;
export function jsx(
  tagName: PlateElementTag,
  attributes?: object | null,
  ...children: unknown[]
): Element;
export function jsx(
  tagName: PlateHyperscriptTag,
  attributes?: object | null,
  ...children: unknown[]
): unknown {
  return plateHyperscript(tagName, attributes ?? undefined, ...children);
}

export const jsxt = jsx;
export const hjsx = jsx;
