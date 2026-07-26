import {
  BaseBoldPlugin,
  BaseCodePlugin,
  BaseHighlightPlugin,
  BaseItalicPlugin,
  BaseKbdPlugin,
  BaseStrikethroughPlugin,
  BaseSubscriptPlugin,
  BaseSuperscriptPlugin,
  BaseUnderlinePlugin,
} from '@platejs/basic-nodes';

import { CodeLeafStatic } from '@/registry/ui/code-node-static';
import { HighlightLeafStatic } from '@/registry/ui/highlight-node-static';
import { KbdLeafStatic } from '@/registry/ui/kbd-node-static';

export const BaseBasicMarksKit = [
  BaseBoldPlugin,
  BaseItalicPlugin,
  BaseUnderlinePlugin,
  BaseCodePlugin.configure({ component: CodeLeafStatic }),
  BaseStrikethroughPlugin,
  BaseSubscriptPlugin,
  BaseSuperscriptPlugin,
  BaseHighlightPlugin.configure({
    component: HighlightLeafStatic,
  }),
  BaseKbdPlugin.configure({ component: KbdLeafStatic }),
];
