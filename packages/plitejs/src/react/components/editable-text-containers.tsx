import type { Text as TextNode } from '../..';
import {
  isContainerDecorationSlice,
  type DecorationSlice,
} from '../decoration-source';

export type EditableTextPart = {
  decorations: readonly DecorationSlice[];
  end: number;
  identity: string;
  marks: Omit<TextNode, 'text'>;
  start: number;
  text: string;
};

/**
 * Takes container slices out of each part's decorations and picks the
 * container each part renders in. An empty gap joins the open container, or
 * the first one after it at the start of the text, so only text in another
 * container closes it. When no text survives, every part joins the text's own
 * container.
 */
export const partitionTextContainers = (
  parts: readonly EditableTextPart[],
  decorations: readonly DecorationSlice[]
) => {
  const own = parts.map((part) =>
    part.text.length === 0
      ? undefined
      : (part.decorations.find(isContainerDecorationSlice) ?? null)
  );
  const textContainer = decorations.find(isContainerDecorationSlice) ?? null;
  const first = own.find((container) => container !== undefined);
  let open = first === undefined ? textContainer : first;

  return {
    textContainer,
    containers: own.map((container) => {
      if (container !== undefined) open = container;
      return open;
    }),
    parts: parts.map((part) =>
      part.decorations.some(isContainerDecorationSlice)
        ? {
            ...part,
            decorations: part.decorations.filter(
              (decoration) => !isContainerDecorationSlice(decoration)
            ),
          }
        : part
    ),
  };
};
