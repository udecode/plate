import {
  type Descendant,
  type Editor,
  type EditorSelection,
  type Element,
  type Range,
  type Selection,
  type Text,
  RangeApi,
  createEditor,
} from 'platejs';
import {
  createEditorFixture,
  createHyperscript,
  createText,
  type HyperscriptCreators,
  type HyperscriptShorthands,
  jsx as plateJsx,
} from 'platejs/hyperscript';

export { createHyperscript } from 'platejs/hyperscript';

export type TestEditorFixture = {
  children: Element[];
  selection?: Selection<EditorSelection>;
};

export type TestEditor = TestEditorFixture;

export const projectTestSelectionRange = (
  selection: Selection | undefined
): Range | null => {
  if (!selection) return null;
  if (!RangeApi.isRange(selection)) {
    throw new Error('Expected a range-backed test selection.');
  }

  return { anchor: selection.anchor, focus: selection.focus };
};

export const createEditorFromFixture = (fixture: TestEditorFixture): Editor =>
  createEditor({
    initialSelection: fixture.selection,
    ...(fixture.children.length > 0 ? { initialValue: fixture.children } : {}),
  });

type HyperscriptIntrinsicAttributes = {
  [key: string]: unknown;
  children?: unknown;
};

declare global {
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
      hdetails: HyperscriptIntrinsicAttributes;
      hequation: HyperscriptIntrinsicAttributes;
      hexcalidraw: HyperscriptIntrinsicAttributes;
      hfile: HyperscriptIntrinsicAttributes;
      hfootnoteDefinition: HyperscriptIntrinsicAttributes;
      hfootnoteReference: HyperscriptIntrinsicAttributes;
      hheading: HyperscriptIntrinsicAttributes;
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
      hsummary: HyperscriptIntrinsicAttributes;
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
  ha: { type: 'link' },
  haudio: { type: 'audio' },
  hblockquote: { type: 'blockquote' },
  hcallout: { type: 'callout' },
  hcodeblock: { type: 'codeBlock' },
  hcodedrawing: { type: 'codeDrawing' },
  hcodeline: { type: 'codeLine' },
  hcolumn: { type: 'column' },
  hcolumngroup: { type: 'columnGroup' },
  hdate: { type: 'date' },
  hdefault: { type: 'paragraph' },
  hdetails: { type: 'details' },
  hequation: { type: 'equation' },
  hexcalidraw: { type: 'excalidraw' },
  hfile: { type: 'file' },
  hfootnoteDefinition: { type: 'footnoteDefinition' },
  hfootnoteReference: { type: 'footnoteReference' },
  hheading: { type: 'heading' },
  himg: { type: 'image' },
  hinlineequation: { type: 'inlineEquation' },
  hli: { type: 'listItem' },
  hlic: { type: 'listItemContent' },
  hmediaembed: { type: 'mediaEmbed' },
  hmention: { type: 'mention' },
  hmentioninput: { type: 'mentionInput' },
  hnli: { type: 'nli' },
  hol: { type: 'numberedList' },
  hp: { type: 'paragraph' },
  hplaceholder: { type: 'placeholder' },
  hsummary: { type: 'summary' },
  htable: { type: 'table' },
  htd: { type: 'tableCell' },
  hth: { header: true, type: 'tableCell' },
  htoc: { type: 'toc' },
  htodoli: { type: 'todoList' },
  htr: { type: 'tableRow' },
  hul: { type: 'bulletedList' },
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
        ? plateJsx('fragment', {}, ...children)
        : voidChildren.map((child) => ({ ...child })),
  });

const defaultTextElementCreators = {
  haudio: createElementWithDefaultText('audio'),
  hcodedrawing: createElementWithDefaultText('codeDrawing'),
  hdate: createElementWithDefaultText('date'),
  hfile: createElementWithDefaultText('file'),
  himg: createElementWithDefaultText('image'),
  hmediaembed: createElementWithDefaultText('mediaEmbed'),
  hmention: createElementWithDefaultText('mention'),
  hmentioninput: createElementWithDefaultText('mentionInput'),
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
