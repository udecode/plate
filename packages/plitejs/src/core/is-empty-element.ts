import type { EditorElementBehavior } from '../interfaces/editor';
import type { Element } from '../interfaces/element';
import { NodeApi } from '../interfaces/node';

export const isEmptyElement = (
  element: Element,
  behavior: EditorElementBehavior
): boolean =>
  !behavior.void &&
  !behavior.atom &&
  !behavior.object &&
  element.children.every((child) => NodeApi.isText(child) && child.text === '');
