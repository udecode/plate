import * as React from 'react';

import {
  BaseBoldPlugin,
  BaseCodePlugin,
  BaseHighlightPlugin,
  BaseItalicPlugin,
  BaseKbdPlugin,
  BaseScriptPlugin,
  BaseStrikethroughPlugin,
  BaseUnderlinePlugin,
} from '@platejs/basic-nodes';
import { type PliteLeafProps, PliteLeaf } from 'platejs/static';

import { CodeLeafStatic } from '@/registry/ui/code-node-static';
import { HighlightLeafStatic } from '@/registry/ui/highlight-node-static';
import { KbdLeafStatic } from '@/registry/ui/kbd-node-static';

const ScriptLeafStatic = (props: PliteLeafProps<typeof BaseScriptPlugin>) => (
  <PliteLeaf {...props} as={props.leaf.script === 'sub' ? 'sub' : 'sup'}>
    {props.children}
  </PliteLeaf>
);

export const BaseBasicMarksKit = [
  BaseBoldPlugin,
  BaseItalicPlugin,
  BaseUnderlinePlugin,
  BaseCodePlugin.configure({ component: CodeLeafStatic }),
  BaseStrikethroughPlugin,
  BaseScriptPlugin.configure({ component: ScriptLeafStatic }),
  BaseHighlightPlugin.configure({
    component: HighlightLeafStatic,
  }),
  BaseKbdPlugin.configure({ component: KbdLeafStatic }),
];
