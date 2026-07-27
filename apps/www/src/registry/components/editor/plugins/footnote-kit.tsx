'use client';

import {
  FootnoteDefinitionPlugin,
  FootnoteInputPlugin,
  FootnotePlugin,
} from '@platejs/footnote/react';

import {
  FootnoteDefinitionElement,
  FootnoteInputElement,
  FootnoteReferenceElement,
} from '@/registry/ui/footnote-node';

export const FootnoteKit = [
  FootnoteInputPlugin.configure({ component: FootnoteInputElement }),
  FootnotePlugin.configure({ component: FootnoteReferenceElement }),
  FootnoteDefinitionPlugin.configure({ component: FootnoteDefinitionElement }),
];
