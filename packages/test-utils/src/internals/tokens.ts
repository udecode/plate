import type { Node, Path, Text } from '@platejs/slate';

const ANCHOR = new WeakMap<Node, [number, AnchorToken]>();
const FOCUS = new WeakMap<Node, [number, FocusToken]>();

export class Token {}

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

export const addAnchorToken = (text: Text, token: AnchorToken) => {
  const offset = text.text.length;
  ANCHOR.set(text, [offset, token]);
};

export const getAnchorOffset = (
  text: Text
): [number, AnchorToken] | undefined => ANCHOR.get(text);

export const addFocusToken = (text: Text, token: FocusToken) => {
  const offset = text.text.length;
  FOCUS.set(text, [offset, token]);
};

export const getFocusOffset = (text: Text): [number, FocusToken] | undefined =>
  FOCUS.get(text);
