import {
  type Descendant,
  type Editor,
  type Element,
  ElementApi,
  type Node,
  NodeApi,
  type Range,
  RangeApi,
  type Text,
  TextApi,
} from '@platejs/plite';
import { setEditorChildren } from '@platejs/plite/internal';
import {
  AnchorToken,
  addAnchorToken,
  addFocusToken,
  FocusToken,
  getAnchorOffset,
  getFocusOffset,
  Token,
} from './tokens';

/**
 * Resolve the descendants of a node by normalizing the children that can be
 * passed into a hyperscript creator function.
 */

const STRINGS: WeakSet<Text> = new WeakSet();

const resolveDescendants = (children: any[]): Descendant[] => {
  const nodes: Descendant[] = [];

  const addChild = (child: Node | Token): void => {
    if (child == null) {
      return;
    }

    let normalizedChild = child;
    const prev = nodes.at(-1);

    if (typeof normalizedChild === 'string') {
      const text = { text: normalizedChild };
      STRINGS.add(text);
      normalizedChild = text;
    }

    if (TextApi.isText(normalizedChild)) {
      const textChild = normalizedChild;

      if (
        TextApi.isText(prev) &&
        STRINGS.has(prev) &&
        STRINGS.has(textChild) &&
        TextApi.equals(prev, textChild, { loose: true })
      ) {
        prev.text += textChild.text;
      } else {
        nodes.push(textChild);
      }
    } else if (ElementApi.isElement(normalizedChild)) {
      nodes.push(normalizedChild);
    } else if (normalizedChild instanceof Token) {
      let n = nodes.at(-1);

      if (!TextApi.isText(n)) {
        addChild('');
        n = nodes.at(-1) as Text;
      }

      if (normalizedChild instanceof AnchorToken) {
        addAnchorToken(n, normalizedChild);
      } else if (normalizedChild instanceof FocusToken) {
        addFocusToken(n, normalizedChild);
      }
    } else {
      throw new Error(
        `Unexpected hyperscript child object: ${normalizedChild}`
      );
    }
  };

  for (const child of children.flat(Number.POSITIVE_INFINITY)) {
    addChild(child);
  }

  return nodes;
};

/**
 * Create an anchor token.
 */

export function createAnchor(
  tagName: string,
  attributes: { [key: string]: any },
  children: any[]
): AnchorToken {
  return new AnchorToken(attributes);
}

/**
 * Create an anchor and a focus token.
 */

export function createCursor(
  tagName: string,
  attributes: { [key: string]: any },
  children: any[]
): Token[] {
  return [new AnchorToken(attributes), new FocusToken(attributes)];
}

/**
 * Create an `Element` object.
 */

export function createElement(
  tagName: string,
  attributes: { [key: string]: any },
  children: any[]
): Element {
  return { ...attributes, children: resolveDescendants(children) } as Element;
}

/**
 * Create a focus token.
 */

export function createFocus(
  tagName: string,
  attributes: { [key: string]: any },
  children: any[]
): FocusToken {
  return new FocusToken(attributes);
}

/**
 * Create a fragment.
 */

export function createFragment(
  tagName: string,
  attributes: { [key: string]: any },
  children: any[]
): Descendant[] {
  return resolveDescendants(children);
}

/**
 * Create a `Selection` object.
 */

export function createSelection(
  tagName: string,
  attributes: { [key: string]: any },
  children: any[]
): Range {
  const anchor = children.find((c) => c instanceof AnchorToken);
  const focus = children.find((c) => c instanceof FocusToken);

  if (!anchor || anchor.offset == null || anchor.path == null) {
    throw new Error(
      'The <selection> hyperscript tag must have an <anchor> tag as a child with `path` and `offset` attributes defined.'
    );
  }

  if (!focus || focus.offset == null || focus.path == null) {
    throw new Error(
      'The <selection> hyperscript tag must have a <focus> tag as a child with `path` and `offset` attributes defined.'
    );
  }

  return {
    ...attributes,
    anchor: {
      offset: anchor.offset,
      path: anchor.path,
    },
    focus: {
      offset: focus.offset,
      path: focus.path,
    },
  };
}

/**
 * Create a `Text` object.
 */

export function createText(
  tagName: string,
  attributes: { [key: string]: any },
  children: any[]
): Text {
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

  // Explicit <text> tags stay distinct from adjacent string children.
  STRINGS.delete(node);

  Object.assign(node, attributes);
  return node;
}

/**
 * Create a top-level `Editor` object.
 */

export const createEditor =
  (makeEditor: () => Editor) =>
  (
    tagName: string,
    attributes: { [key: string]: any },
    children: any[]
  ): Editor => {
    const otherChildren: any[] = [];
    let selectionChild: Range | undefined;

    for (const child of children) {
      if (RangeApi.isRange(child)) {
        selectionChild = child;
      } else {
        otherChildren.push(child);
      }
    }

    const descendants = resolveDescendants(otherChildren);
    const selection: Partial<Range> = {};
    const editor = makeEditor();
    Object.assign(editor, attributes);

    // Search the document's texts to see if any of them have tokens associated
    // that need incorporated into the selection.
    for (const [node, path] of NodeApi.texts({
      children: descendants,
    } as Node)) {
      const anchor = getAnchorOffset(node);
      const focus = getFocusOffset(node);

      if (anchor != null) {
        const [offset] = anchor;
        selection.anchor = { path, offset };
      }

      if (focus != null) {
        const [offset] = focus;
        selection.focus = { path, offset };
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

    if (selectionChild != null || RangeApi.isRange(selection)) {
      editor.update((tx) => {
        tx.value.replace({
          children: descendants,
          selection: selectionChild ?? (selection as Range),
          marks: null,
        });
      });
    } else {
      setEditorChildren(editor, descendants as Element[]);
    }

    return editor;
  };
