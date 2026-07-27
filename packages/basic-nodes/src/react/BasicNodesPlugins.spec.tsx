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
import { BaseScriptPlugin } from '../lib/BaseScriptPlugin';
import { BaseStrikethroughPlugin } from '../lib/BaseStrikethroughPlugin';
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
import { ScriptPlugin } from './ScriptPlugin';
import { StrikethroughPlugin } from './StrikethroughPlugin';
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
        BaseScriptPlugin,
        BaseStrikethroughPlugin,
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

  it('switches one script property between subscript and superscript', () => {
    const editor = createBaseEditor({
      plugins: [BaseScriptPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'text' }], type: KEYS.p }],
    });

    editor.update.script.toggle('sub');
    expect(editor.read.children()[0]).toMatchObject({
      children: [{ script: 'sub', text: 'text' }],
    });

    editor.update.script.toggle('sup');
    expect(editor.read.children()[0]).toMatchObject({
      children: [{ script: 'sup', text: 'text' }],
    });

    editor.update.script.toggle('sup');
    expect(editor.read.children()[0]).toMatchObject({
      children: [{ text: 'text' }],
    });
  });

  it('keeps root and descriptor updates on the same bold owner', () => {
    const createEditor = () =>
      createBaseEditor({
        plugins: [BaseBoldPlugin],
        selection: {
          kind: 'text',
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 4, path: [0, 0] },
        },
        initialValue: [{ children: [{ text: 'text' }], type: KEYS.p }],
      });
    const rootEditor = createEditor();
    const portalEditor = createEditor();

    rootEditor.update.bold.toggle();
    portalEditor.plugin(BaseBoldPlugin).update.toggle();

    expect(portalEditor.read.children()).toEqual(rootEditor.read.children());
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
        ScriptPlugin,
        StrikethroughPlugin,
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
