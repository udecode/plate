import React from 'react';

import { PlateLeaf, toPlatePlugin } from '@platejs/core/react';
import { Key } from '@udecode/react-hotkeys';

import {
  BaseBlockquotePlugin,
  BaseBoldPlugin,
  BaseCodePlugin,
  BaseH1Plugin,
  BaseH2Plugin,
  BaseH3Plugin,
  BaseH4Plugin,
  BaseH5Plugin,
  BaseH6Plugin,
  BaseHighlightPlugin,
  BaseHorizontalRulePlugin,
  BaseItalicPlugin,
  BaseKbdPlugin,
  BaseScriptPlugin,
  BaseStrikethroughPlugin,
  BaseUnderlinePlugin,
} from '../lib';

export const BlockquotePlugin = toPlatePlugin(BaseBlockquotePlugin);

export const BoldPlugin = toPlatePlugin(BaseBoldPlugin, {
  shortcuts: { toggle: { keys: [[Key.Mod, 'b']] } },
});

export const CodePlugin = toPlatePlugin(BaseCodePlugin);

export const H1Plugin = toPlatePlugin(BaseH1Plugin);
export const H2Plugin = toPlatePlugin(BaseH2Plugin);
export const H3Plugin = toPlatePlugin(BaseH3Plugin);
export const H4Plugin = toPlatePlugin(BaseH4Plugin);
export const H5Plugin = toPlatePlugin(BaseH5Plugin);
export const H6Plugin = toPlatePlugin(BaseH6Plugin);

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
