'use client';

import {
  FootnoteDefinitionPlugin,
  FootnoteInputPlugin,
  FootnoteReferencePlugin,
} from '@platejs/footnote/react';

import {
  FootnoteDefinitionElement,
  FootnoteInputElement,
  FootnoteReferenceElement,
} from '@/registry/ui/footnote-node';

export const FootnoteKit = [
  FootnoteInputPlugin.configure({ component: FootnoteInputElement }),
  FootnoteReferencePlugin.configure({ component: FootnoteReferenceElement }),
  FootnoteDefinitionPlugin.configure({ component: FootnoteDefinitionElement }),
];
