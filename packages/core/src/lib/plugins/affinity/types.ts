import type { Element, NodeEntry, Text } from '@platejs/slate';

export type EdgeNodes =
  | [NodeEntry<Element | Text>, NodeEntry<Element | Text>]
  | [NodeEntry<Element | Text>, null]
  | [null, NodeEntry<Element | Text>];
