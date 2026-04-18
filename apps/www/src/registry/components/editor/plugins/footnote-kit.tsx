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
  FootnoteInputPlugin.withComponent(FootnoteInputElement),
  FootnoteReferencePlugin.withComponent(FootnoteReferenceElement),
  FootnoteDefinitionPlugin.withComponent(FootnoteDefinitionElement),
];
