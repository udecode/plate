import { getEditorSchema } from '../core/editor-runtime';
import type { Editor } from '../interfaces/editor';
import type { Element } from '../interfaces/element';
import { type Descendant, NodeApi } from '../interfaces/node';
import type { Text } from '../interfaces/text';

export const isTextBlockElement = (
  editor: Editor,
  node: Descendant | undefined
): node is Element => {
  if (!node || !NodeApi.isElement(node)) {
    return false;
  }

  const schema = getEditorSchema(editor);

  return (
    !schema.isVoid(node) &&
    !schema.isInline(node) &&
    node.children.every(
      (child) =>
        NodeApi.isText(child) ||
        (NodeApi.isElement(child) && schema.isInline(child))
    )
  );
};

export const isBlockElement = (
  editor: Editor,
  node: Descendant | undefined
): node is Element => {
  if (!node || !NodeApi.isElement(node)) {
    return false;
  }

  return !getEditorSchema(editor).isInline(node);
};

export const isStructuralBlockElement = (
  editor: Editor,
  node: Descendant | undefined
): node is Element =>
  isBlockElement(editor, node) && !isTextBlockElement(editor, node);

export const hasSameElementType = (left: Element, right: Element) =>
  (left as Record<string, unknown>).type ===
  (right as Record<string, unknown>).type;

const haveSameTextProps = (left: Text, right: Text) => {
  const leftKeys = Object.keys(left).filter((key) => key !== 'text');
  const rightKeys = Object.keys(right).filter((key) => key !== 'text');

  return (
    leftKeys.length === rightKeys.length &&
    leftKeys.every((key) => left[key] === right[key])
  );
};

export const cloneDescendant = <T extends Descendant>(node: T): T =>
  structuredClone(node);

export const pushBlockChild = (
  editor: Editor,
  children: Descendant[],
  child: Descendant
) => {
  if (NodeApi.isText(child)) {
    const previous = children.at(-1);

    if (
      previous &&
      NodeApi.isText(previous) &&
      haveSameTextProps(previous, child)
    ) {
      const offset = previous.text.length + child.text.length;
      previous.text += child.text;

      return { offset, path: [children.length - 1] };
    }

    children.push({ ...child });

    return { offset: child.text.length, path: [children.length - 1] };
  }

  const schema = getEditorSchema(editor);

  if (schema.isInline(child)) {
    const previous = children.at(-1);

    if (!previous || !NodeApi.isText(previous)) {
      children.push({ text: '' });
    }
  }

  const nextChild = cloneDescendant(child);
  const index = children.length;

  children.push(nextChild);

  if (schema.isInline(child)) {
    children.push({ text: '' });
  }

  const [lastNode, lastPath] = NodeApi.last(nextChild, []);

  return {
    offset: NodeApi.string(lastNode).length,
    path: [index].concat(lastPath),
  };
};
