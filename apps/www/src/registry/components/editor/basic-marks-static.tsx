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
import { type EditorLeafProps, EditorLeaf } from 'platejs/static';
import * as React from 'react';

import { CodeLeafStatic } from '@/registry/components/editor/code-static';
import { HighlightLeafStatic } from '@/registry/components/editor/highlight-static';
import { KbdLeafStatic } from '@/registry/components/editor/kbd-static';

const ScriptLeafStatic = (props: EditorLeafProps<typeof BaseScriptPlugin>) => (
  <EditorLeaf {...props} as={props.leaf.script === 'sub' ? 'sub' : 'sup'}>
    {props.children}
  </EditorLeaf>
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
