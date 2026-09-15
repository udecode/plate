import React from 'react';

import {
  BaseBlockquotePlugin,
  BaseBoldPlugin,
  BaseCodePlugin,
  BaseHeadingPlugin,
  BaseHighlightPlugin,
  BaseHorizontalRulePlugin,
  BaseItalicPlugin,
  BaseKbdPlugin,
  BaseScriptPlugin,
  BaseStrikethroughPlugin,
  BaseUnderlinePlugin,
} from '../../../features/basic-nodes/lib';
import { EditorElement, EditorLeaf, toReactPlugin } from '../../core';

export const BlockquotePlugin = toReactPlugin(BaseBlockquotePlugin);

export const BoldPlugin = toReactPlugin(BaseBoldPlugin, {
  shortcuts: { toggle: { keys: 'mod+b' } },
});

export const CodePlugin = toReactPlugin(BaseCodePlugin);

export const HeadingPlugin = toReactPlugin(BaseHeadingPlugin, {
  component: (props) => {
    const Tag = `h${props.element.level}` as const;

    return <EditorElement {...props} as={Tag} />;
  },
});

export const HighlightPlugin = toReactPlugin(BaseHighlightPlugin);
export const HorizontalRulePlugin = toReactPlugin(BaseHorizontalRulePlugin);

export const ItalicPlugin = toReactPlugin(BaseItalicPlugin, {
  shortcuts: { toggle: { keys: 'mod+i' } },
});

export const KbdPlugin = toReactPlugin(BaseKbdPlugin);

export const ScriptPlugin = toReactPlugin(BaseScriptPlugin, {
  component: (props) => (
    <EditorLeaf {...props} as={props.leaf.script === 'sub' ? 'sub' : 'sup'}>
      {props.children}
    </EditorLeaf>
  ),
});

export const StrikethroughPlugin = toReactPlugin(BaseStrikethroughPlugin);

export const UnderlinePlugin = toReactPlugin(BaseUnderlinePlugin, {
  shortcuts: { toggle: { keys: 'mod+u' } },
});
