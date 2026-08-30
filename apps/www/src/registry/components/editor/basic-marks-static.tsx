import {
  BaseBoldPlugin,
  BaseCodePlugin,
  BaseHighlightPlugin,
  BaseItalicPlugin,
  BaseKbdPlugin,
  BaseScriptPlugin,
  BaseStrikethroughPlugin,
  BaseUnderlinePlugin,
} from 'platejs';
import { type PliteLeafProps, PliteLeaf } from 'platejs/static';
import * as React from 'react';

import { CodeLeafStatic } from '@/registry/components/editor/code-static';
import { HighlightLeafStatic } from '@/registry/components/editor/highlight-static';
import { KbdLeafStatic } from '@/registry/components/editor/kbd-static';

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
