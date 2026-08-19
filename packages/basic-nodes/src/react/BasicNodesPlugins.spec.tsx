import { createBaseEditor } from '@platejs/core';
import { createPlateEditor } from '@platejs/core/react';

import {
  BaseBlockquotePlugin,
  BaseBoldPlugin,
  BaseCodePlugin,
  BaseHeadingPlugin,
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
  HeadingPlugin,
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
        BaseHeadingPlugin,
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

    editor.plugin(BaseHeadingPlugin).update.toggle({ level: 1 });
    editor.update.bold.toggle();

    expect(editor.read.children()[0]).toMatchObject({
      children: [{ bold: true, text: 'text' }],
      level: 1,
      type: 'heading',
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
        HeadingPlugin,
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

    editor.plugin(BaseHeadingPlugin).update.toggle({ level: 6 });
    editor.update.italic.toggle();

    expect(editor.read.children()[0]).toMatchObject({
      children: [{ italic: true, text: 'text' }],
      level: 6,
      type: 'heading',
    });
  });
});
