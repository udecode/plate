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
  SelectionApi,
  type Text,
  type TextSelection,
  TextApi,
} from '@platejs/plite';
import { replace as replaceEditor } from '@platejs/plite/internal';
import {
  AnchorToken,
  addAnchorToken,
  addFocusToken,
  FocusToken,
  getAnchorOffset,
  getFocusOffset,
  Token,
} from './tokens';

export type HyperscriptEditorFixture = {
  children: Descendant[];
  selection: Selection;
};

type MutableRangeDraft = {
  anchor?: Range['anchor'];
  focus?: Range['focus'];
};

type MutableTextDraft = {
  [key: string]: unknown;
  text: string;
};

/**
 * Resolve the descendants of a node by normalizing the children that can be
 * passed into a hyperscript creator function.
 */

const STRINGS = new WeakSet<object>();

const isStringDraft = (value: unknown): value is MutableTextDraft =>
  TextApi.isText(value) && STRINGS.has(value);

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
      if (
        isStringDraft(prev) &&
        isStringDraft(normalizedChild) &&
        TextApi.equals(prev, normalizedChild, { loose: true })
      ) {
        prev.text += normalizedChild.text;
      } else {
        nodes.push(normalizedChild);
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
  _tagName: string,
  attributes: { [key: string]: any },
  _children: any[]
): AnchorToken {
  return new AnchorToken(attributes);
}

/**
 * Create an anchor and a focus token.
 */

export function createCursor(
  _tagName: string,
  attributes: { [key: string]: any },
  _children: any[]
): Token[] {
  return [new AnchorToken(attributes), new FocusToken(attributes)];
}

/**
 * Create an `Element` object.
 */

export function createElement(
  _tagName: string,
  attributes: { [key: string]: any },
  children: any[]
): Element {
  const fixture = {
    ...attributes,
    children: resolveDescendants(children),
  };

  // A raw <element> is a pre-ingress fixture and may omit `type`; custom
  // element shorthands supply it before the value crosses editor ingress.
  return fixture as unknown as Element;
}

/**
 * Create a focus token.
 */

export function createFocus(
  _tagName: string,
  attributes: { [key: string]: any },
  _children: any[]
): FocusToken {
  return new FocusToken(attributes);
}

/**
 * Create a fragment.
 */

export function createFragment(
  _tagName: string,
  _attributes: { [key: string]: any },
  children: any[]
): Descendant[] {
  return resolveDescendants(children);
}

/**
 * Create a `Selection` object.
 */

export function createSelection(
  _tagName: string,
  attributes: { [key: string]: any },
  children: any[]
): TextSelection {
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
    kind: 'text',
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
  _tagName: string,
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
 * Resolve a top-level editor fixture without running editor normalization.
 */

const resolveEditorFixture = (children: any[]): HyperscriptEditorFixture => {
  const otherChildren: any[] = [];
  let selectionChild: TextSelection | undefined;

  for (const child of children) {
    if (SelectionApi.isText(child)) {
      selectionChild = child;
    } else {
      otherChildren.push(child);
    }
  }

  const descendants = resolveDescendants(otherChildren);

  const selection: MutableRangeDraft = {};
  const root: Element = { children: descendants, type: 'root' };

  for (const [node, path] of NodeApi.texts(root)) {
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

  return {
    children: descendants,
    selection:
      selectionChild ??
      (RangeApi.isRange(selection) ? SelectionApi.text(selection) : null),
  };
};

/**
 * Create a plain editor fixture for a custom hyperscript factory.
 */

export function createEditorFixture(
  _tagName: string,
  attributes: { [key: string]: any },
  children: any[]
): HyperscriptEditorFixture {
  return {
    ...attributes,
    ...resolveEditorFixture(children),
  };
}

/**
 * Create a top-level `Editor` object.
 */

export const createEditor =
  (makeEditor: () => Editor) =>
  (
    _tagName: string,
    attributes: { [key: string]: any },
    children: any[]
  ): Editor => {
    const fixture = resolveEditorFixture(children);

    const editor = makeEditor();
    Object.assign(editor, attributes);

    replaceEditor(editor, {
      children: fixture.children,
      selection: fixture.selection,
    });

    return editor;
  };
