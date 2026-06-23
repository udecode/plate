import type { Element } from '@platejs/slate';

import { ElementApi } from '@platejs/slate';
import { KEYS } from 'platejs';

export const isHeading = (node: unknown): node is Element =>
  ElementApi.isElement(node) && KEYS.heading.includes(node.type as any);
