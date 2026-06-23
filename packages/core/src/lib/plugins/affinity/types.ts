import type { Element, NodeEntry, Text } from '@platejs/plite';

export type EdgeNodes =
  | [NodeEntry<Element | Text>, NodeEntry<Element | Text>]
  | [NodeEntry<Element | Text>, null]
  | [null, NodeEntry<Element | Text>];
