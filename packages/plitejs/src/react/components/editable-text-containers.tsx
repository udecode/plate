import React, { type ReactNode } from 'react';

import type { Text as TextNode } from '../..';
import type { NativeAuthoredFragment } from '../../core/authored-runtime';
import {
  getDecorationSliceIdentity,
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

export type EditableTextRenderPart =
  | { kind: 'text'; segment: EditableTextPart }
  | { kind: 'retained'; fragment: NativeAuthoredFragment };

/**
 * Takes container slices out of each part's decorations and picks the
 * container each part renders in. A retained fragment or an empty gap joins
 * the open container, or the first one after it at the start of the text, so
 * only text in another container closes it. When no text survives, every part
 * joins the text's own container.
 */
export const partitionTextContainers = (
  parts: readonly EditableTextRenderPart[],
  decorations: readonly DecorationSlice[]
) => {
  const own = parts.map((part) =>
    part.kind === 'retained' || part.segment.text.length === 0
      ? undefined
      : (part.segment.decorations.find(isContainerDecorationSlice) ?? null)
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
      part.kind === 'text' &&
      part.segment.decorations.some(isContainerDecorationSlice)
        ? {
            ...part,
            segment: {
              ...part.segment,
              decorations: part.segment.decorations.filter(
                (decoration) => !isContainerDecorationSlice(decoration)
              ),
            },
          }
        : part
    ),
  };
};

export const wrapDecorationContainers = (
  nodes: readonly ReactNode[],
  containers: ReadonlyArray<DecorationSlice | null>
) => {
  const content: ReactNode[] = [];
  let group: ReactNode[] = [];
  let container: DecorationSlice | null = null;
  const flush = () => {
    if (container) {
      content.push(
        <span
          key={`container:${getDecorationSliceIdentity(container)}`}
          {...container.attributes}
        >
          {group}
        </span>
      );
    } else {
      content.push(...group);
    }
    group = [];
  };

  nodes.forEach((node, index) => {
    const next = containers[index] ?? null;

    if (next !== container) {
      flush();
      container = next;
    }
    group.push(node);
  });
  flush();

  return content;
};
