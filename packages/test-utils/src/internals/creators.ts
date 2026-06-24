import {
  type Descendant,
  type Editor,
  type Element,
  ElementApi,
  type Node,
  NodeApi,
  type Range,
  RangeApi,
  type Selection,
  type Text,
  TextApi,
} from '@platejs/plite';

import {
  AnchorToken,
  addAnchorToken,
  addFocusToken,
  FocusToken,
  getAnchorOffset,
  getFocusOffset,
  Token,
} from './tokens';

export type TestEditor = Editor & {
  children: Element[];
  selection: Selection;
};

const STRINGS = new WeakSet<Text>();

const resolveDescendants = (children: any[]): Descendant[] => {
  const nodes: Descendant[] = [];

  const addChild = (child: Node | string | Token): void => {
    if (child == null) return;

    const prev = nodes.at(-1);

    let node = child;
    if (typeof child === 'string') {
      const text = { text: child };
      STRINGS.add(text);
      node = text;
    }
    if (TextApi.isText(node)) {
      const c = node;

      if (
        TextApi.isText(prev) &&
        STRINGS.has(prev) &&
        STRINGS.has(c) &&
        TextApi.equals(prev, c, { loose: true })
      ) {
        prev.text += c.text;
      } else {
        nodes.push(c);
      }
    } else if (ElementApi.isElement(node)) {
      nodes.push(node);
    } else if (node instanceof Token) {
      let n = nodes.at(-1);

      if (!TextApi.isText(n)) {
        addChild('');
        n = nodes.at(-1) as Text;
      }
      if (node instanceof AnchorToken) {
        addAnchorToken(n, node);
      } else if (node instanceof FocusToken) {
        addFocusToken(n, node);
      }
    } else {
      throw new TypeError(
        `Unexpected hyperscript child object: ${node as any}`
      );
    }
  };

  for (const child of children.flat(Number.POSITIVE_INFINITY)) {
    addChild(child);
  }

  return nodes;
};

export const createAnchor = (
  _tagName: string,
  attributes: Record<string, any>
): AnchorToken => new AnchorToken(attributes);

export const createCursor = (
  _tagName: string,
  attributes: Record<string, any>
): Token[] => [new AnchorToken(attributes), new FocusToken(attributes)];

export const createElement = (
  _tagName: string,
  attributes: Record<string, any>,
  children: any[]
): Element => ({
  ...(attributes as any),
  children: resolveDescendants(children),
});

export const createFocus = (
  _tagName: string,
  attributes: Record<string, any>
): FocusToken => new FocusToken(attributes);

export const createFragment = (
  _tagName: string,
  _attributes: Record<string, any>,
  children: any[]
): Descendant[] => resolveDescendants(children);

export const createSelection = (
  _tagName: string,
  _attributes: Record<string, any>,
  children: any[]
): Range => {
  const anchor: AnchorToken = children.find((c) => c instanceof AnchorToken)!;
  const focus: FocusToken = children.find((c) => c instanceof FocusToken)!;

  if (anchor?.offset == null || !anchor.path) {
    throw new Error(
      'The <selection> hyperscript tag must have an <anchor> tag as a child with `path` and `offset` attributes defined.'
    );
  }
  if (focus?.offset == null || !focus.path) {
    throw new Error(
      'The <selection> hyperscript tag must have a <focus> tag as a child with `path` and `offset` attributes defined.'
    );
  }

  return {
    anchor: {
      offset: anchor.offset,
      path: anchor.path,
    },
    focus: {
      offset: focus.offset,
      path: focus.path,
    },
    ..._attributes,
  };
};

export const createText = (
  _tagName: string,
  attributes: Record<string, any>,
  children: any[]
): Text => {
  const nodes = resolveDescendants(children);

  if (nodes.length > 1) {
    throw new Error(
      `The <text> hyperscript tag must only contain a single node's worth of children.`
    );
  }

  let [node] = nodes;

  if (node == null) {
    node = { text: '' };
  }
  if (!TextApi.isText(node)) {
    throw new Error(`
    The <text> hyperscript tag can only contain text content as children.`);
  }

  STRINGS.delete(node);

  Object.assign(node, attributes);

  return node;
};

export const createEditor =
  (makeEditor: () => Editor = () => ({}) as Editor) =>
  (
    _tagName: string,
    attributes: Record<string, any>,
    children: any[]
  ): TestEditor => {
    const otherChildren: any[] = [];
    let selectionChild: Range | undefined;

    for (const child of children) {
      if (RangeApi.isRange(child)) {
        selectionChild = child;
      } else {
        otherChildren.push(child);
      }
    }

    const descendants = resolveDescendants(otherChildren) as Element[];
    const selection: Partial<Range> = {};
    const editor = makeEditor() as TestEditor;
    Object.assign(editor, attributes);
    editor.children = descendants;
    editor.selection = null;

    for (const [node, path] of NodeApi.texts(editor as unknown as Node)) {
      const anchor = getAnchorOffset(node);
      const focus = getFocusOffset(node);

      if (anchor != null) {
        const [offset] = anchor;
        selection.anchor = { offset, path };
      }
      if (focus != null) {
        const [offset] = focus;
        selection.focus = { offset, path };
      }
    }

    if (selection.anchor && !selection.focus) {
      throw new Error(
        'Plite hyperscript ranges must have both `<anchor />` and `<focus />` defined if one is defined, but you only defined `<anchor />`. For collapsed selections, use `<cursor />` instead.'
      );
    }
    if (!selection.anchor && selection.focus) {
      throw new Error(
        'Plite hyperscript ranges must have both `<anchor />` and `<focus />` defined if one is defined, but you only defined `<focus />`. For collapsed selections, use `<cursor />` instead.'
      );
    }
    if (selectionChild != null) {
      editor.selection = selectionChild;
    } else if (RangeApi.isRange(selection)) {
      editor.selection = selection;
    }

    return editor;
  };
