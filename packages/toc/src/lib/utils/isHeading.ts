import type { Element } from '@platejs/plite';

import { ElementApi } from '@platejs/plite';
import { KEYS } from 'platejs';

export const isHeading = (node: unknown): node is Element =>
  ElementApi.isElement(node) && KEYS.heading.includes(node.type as any);
