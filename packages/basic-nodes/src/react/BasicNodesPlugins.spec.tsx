import { createBaseEditor } from '@platejs/core';
import { createPlateEditor } from '@platejs/core/react';
import { KEYS } from '@platejs/utils';

import { BaseBlockquotePlugin } from '../lib/BaseBlockquotePlugin';
import { BaseBoldPlugin } from '../lib/BaseBoldPlugin';
import { BaseCodePlugin } from '../lib/BaseCodePlugin';
import {
  BaseH1Plugin,
  BaseH2Plugin,
  BaseH3Plugin,
  BaseH4Plugin,
  BaseH5Plugin,
  BaseH6Plugin,
} from '../lib/BaseHeadingPlugins';
import { BaseHorizontalRulePlugin } from '../lib/BaseHorizontalRulePlugin';
import { BaseItalicPlugin } from '../lib/BaseItalicPlugin';
import { BaseStrikethroughPlugin } from '../lib/BaseStrikethroughPlugin';
import { BaseSubscriptPlugin } from '../lib/BaseSubscriptPlugin';
import { BaseSuperscriptPlugin } from '../lib/BaseSuperscriptPlugin';
import { BaseUnderlinePlugin } from '../lib/BaseUnderlinePlugin';
import { BlockquotePlugin } from './BlockquotePlugin';
import { BoldPlugin } from './BoldPlugin';
import { CodePlugin } from './CodePlugin';
import {
  H1Plugin,
  H2Plugin,
  H3Plugin,
  H4Plugin,
  H5Plugin,
  H6Plugin,
} from './HeadingPlugins';
import { HorizontalRulePlugin } from './HorizontalRulePlugin';
import { ItalicPlugin } from './ItalicPlugin';
import { StrikethroughPlugin } from './StrikethroughPlugin';
import { SubscriptPlugin } from './SubscriptPlugin';
import { SuperscriptPlugin } from './SuperscriptPlugin';
import { UnderlinePlugin } from './UnderlinePlugin';

describe('basic node plugin composition', () => {
  it('keeps explicit Base plugin composition inference-complete', () => {
    const editor = createBaseEditor({
      plugins: [
        BaseBlockquotePlugin,
        BaseH1Plugin,
        BaseH2Plugin,
        BaseH3Plugin,
        BaseH4Plugin,
        BaseH5Plugin,
        BaseH6Plugin,
        BaseHorizontalRulePlugin,
        BaseBoldPlugin,
        BaseCodePlugin,
        BaseItalicPlugin,
        BaseStrikethroughPlugin,
        BaseSubscriptPlugin,
        BaseSuperscriptPlugin,
        BaseUnderlinePlugin,
      ],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'text' }], type: KEYS.p }],
    });

    editor.update.h1.toggle();
    editor.update.bold.toggle();

    expect(editor.read.children()[0]).toMatchObject({
      children: [{ bold: true, text: 'text' }],
      type: KEYS.h1,
    });
  });

  it('keeps explicit React plugin composition inference-complete', () => {
    const editor = createPlateEditor({
      plugins: [
        BlockquotePlugin,
        H1Plugin,
        H2Plugin,
        H3Plugin,
        H4Plugin,
        H5Plugin,
        H6Plugin,
        HorizontalRulePlugin,
        BoldPlugin,
        CodePlugin,
        ItalicPlugin,
        StrikethroughPlugin,
        SubscriptPlugin,
        SuperscriptPlugin,
        UnderlinePlugin,
      ],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'text' }], type: KEYS.p }],
    });

    editor.update.h6.toggle();
    editor.update.italic.toggle();

    expect(editor.read.children()[0]).toMatchObject({
      children: [{ italic: true, text: 'text' }],
      type: KEYS.h6,
    });
  });
});
