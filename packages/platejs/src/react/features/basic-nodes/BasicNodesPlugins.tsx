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
import { Key, PlateLeaf, toPlatePlugin } from '../../core';

export const BlockquotePlugin = toPlatePlugin(BaseBlockquotePlugin);

export const BoldPlugin = toPlatePlugin(BaseBoldPlugin, {
  shortcuts: { toggle: { keys: [[Key.Mod, 'b']] } },
});

export const CodePlugin = toPlatePlugin(BaseCodePlugin);

export const HeadingPlugin = toPlatePlugin(BaseHeadingPlugin);

export const HighlightPlugin = toPlatePlugin(BaseHighlightPlugin);
export const HorizontalRulePlugin = toPlatePlugin(BaseHorizontalRulePlugin);

export const ItalicPlugin = toPlatePlugin(BaseItalicPlugin, {
  shortcuts: { toggle: { keys: [[Key.Mod, 'i']] } },
});

export const KbdPlugin = toPlatePlugin(BaseKbdPlugin);

export const ScriptPlugin = toPlatePlugin(BaseScriptPlugin, {
  component: (props) => (
    <PlateLeaf {...props} as={props.leaf.script === 'sub' ? 'sub' : 'sup'}>
      {props.children}
    </PlateLeaf>
  ),
});

export const StrikethroughPlugin = toPlatePlugin(BaseStrikethroughPlugin);

export const UnderlinePlugin = toPlatePlugin(BaseUnderlinePlugin, {
  shortcuts: { toggle: { keys: [[Key.Mod, 'u']] } },
});
