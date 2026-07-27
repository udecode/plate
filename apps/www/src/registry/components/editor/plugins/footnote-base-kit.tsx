import {
  BaseFootnoteDefinitionPlugin,
  BaseFootnotePlugin,
} from '@platejs/footnote';

import {
  FootnoteDefinitionElementStatic,
  FootnoteReferenceElementStatic,
} from '@/registry/ui/footnote-node-static';

export const BaseFootnoteKit = [
  BaseFootnotePlugin.configure({
    component: FootnoteReferenceElementStatic,
  }),
  BaseFootnoteDefinitionPlugin.configure({
    component: FootnoteDefinitionElementStatic,
  }),
];
