import type { Path, TNode, TText } from '@udecode/slate';

/** A weak map to hold anchor tokens. */

const ANCHOR = new WeakMap<TNode, [number, AnchorToken]>();

/** A weak map to hold focus tokens. */

const FOCUS = new WeakMap<TNode, [number, FocusToken]>();

/** All tokens inherit from a single constructor for `instanceof` checking. */

export class Token {}

/** Anchor tokens represent the selection's anchor point. */

export class AnchorToken extends Token {
  offset?: number;
  path?: Path;

  constructor(
    props: {
      offset?: number;
      path?: Path;
    } = {}
  ) {
    super();
    const { offset, path } = props;
    this.offset = offset;
    this.path = path;
  }
}

/** Focus tokens represent the selection's focus point. */

export class FocusToken extends Token {
  offset?: number;
  path?: Path;

  constructor(
    props: {
      offset?: number;
      path?: Path;
    } = {}
  ) {
    super();
    const { offset, path } = props;
    this.offset = offset;
    this.path = path;
  }
}

/** Add an anchor token to the end of a text node. */

export const addAnchorToken = (text: TText, token: AnchorToken) => {
  const offset = text.text.length;
  ANCHOR.set(text, [offset, token]);
};

/** Get the offset if a text node has an associated anchor token. */

export const getAnchorOffset = (
  text: TText
): [number, AnchorToken] | undefined => {
  return ANCHOR.get(text);
};

/** Add a focus token to the end of a text node. */

export const addFocusToken = (text: TText, token: FocusToken) => {
  const offset = text.text.length;
  FOCUS.set(text, [offset, token]);
};

/** Get the offset if a text node has an associated focus token. */

export const getFocusOffset = (
  text: TText
): [number, FocusToken] | undefined => {
  return FOCUS.get(text);
};
