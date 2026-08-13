import { createBaseEditor } from '@platejs/core';
import { createPlateEditor } from '@platejs/core/react';

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
  BaseHorizontalRulePlugin,
  BaseItalicPlugin,
  BaseScriptPlugin,
  BaseStrikethroughPlugin,
  BaseUnderlinePlugin,
} from '../lib';
import {
  BlockquotePlugin,
  BoldPlugin,
  CodePlugin,
  H1Plugin,
  H2Plugin,
  H3Plugin,
  H4Plugin,
  H5Plugin,
  H6Plugin,
  HorizontalRulePlugin,
  ItalicPlugin,
  ScriptPlugin,
  StrikethroughPlugin,
  UnderlinePlugin,
} from './BasicNodesPlugins';

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
      initialValue: [{ children: [{ text: 'text' }], type: 'paragraph' }],
    });

    editor.plugin(BaseH1Plugin).update.toggle();
    editor.update.bold.toggle();

    expect(editor.read.children()[0]).toMatchObject({
      children: [{ bold: true, text: 'text' }],
      type: 'h1',
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
      initialValue: [{ children: [{ text: 'text' }], type: 'paragraph' }],
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
        initialValue: [{ children: [{ text: 'text' }], type: 'paragraph' }],
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
      initialValue: [{ children: [{ text: 'text' }], type: 'paragraph' }],
    });

    editor.plugin(BaseH6Plugin).update.toggle();
    editor.update.italic.toggle();

    expect(editor.read.children()[0]).toMatchObject({
      children: [{ italic: true, text: 'text' }],
      type: 'h6',
    });
  });
});
