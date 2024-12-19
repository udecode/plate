'use client';

import React, { memo } from 'react';

import { withProps } from '@udecode/cn';
import { AIChatPlugin, useLastAssistantMessage } from '@udecode/plate-ai/react';
import {
  BaseBoldPlugin,
  BaseCodePlugin,
  BaseItalicPlugin,
  BaseStrikethroughPlugin,
  BaseUnderlinePlugin,
} from '@udecode/plate-basic-marks';
import { BaseBlockquotePlugin } from '@udecode/plate-block-quote';
import {
  BaseCodeBlockPlugin,
  BaseCodeLinePlugin,
  BaseCodeSyntaxPlugin,
} from '@udecode/plate-code-block';
import { useEditorPlugin } from '@udecode/plate-common/react';
import {
  type SlateEditor,
  BaseParagraphPlugin,
  SlateLeaf,
} from '@udecode/plate-common';
import { HEADING_KEYS } from '@udecode/plate-heading';
import { BaseHorizontalRulePlugin } from '@udecode/plate-horizontal-rule';
import { BaseLinkPlugin } from '@udecode/plate-link';
import { deserializeMd } from '@udecode/plate-markdown';

import { BlockquoteElementStatic } from './blockquote-element-static';
import { CodeBlockElementStatic } from './code-block-element-static';
import { CodeLeafStatic } from './code-leaf-static';
import { CodeLineElementStatic } from './code-line-element-static';
import { CodeSyntaxLeafStatic } from './code-syntax-leaf-static';
import { EditorStatic } from './editor-static';
import { HeadingElementStatic } from './heading-element-static';
import { HrElementStatic } from './hr-element-static';
import { LinkElementStatic } from './link-element-static';
import { ParagraphElementStatic } from './paragraph-element-static';

const staticComponents = {
  [BaseBlockquotePlugin.key]: BlockquoteElementStatic,
  [BaseBoldPlugin.key]: withProps(SlateLeaf, { as: 'strong' }),
  [BaseCodeBlockPlugin.key]: CodeBlockElementStatic,
  [BaseCodeLinePlugin.key]: CodeLineElementStatic,
  [BaseCodePlugin.key]: CodeLeafStatic,
  [BaseCodeSyntaxPlugin.key]: CodeSyntaxLeafStatic,
  [BaseHorizontalRulePlugin.key]: HrElementStatic,
  [BaseItalicPlugin.key]: withProps(SlateLeaf, { as: 'em' }),
  [BaseLinkPlugin.key]: LinkElementStatic,
  [BaseParagraphPlugin.key]: ParagraphElementStatic,
  [BaseStrikethroughPlugin.key]: withProps(SlateLeaf, { as: 's' }),
  [BaseUnderlinePlugin.key]: withProps(SlateLeaf, { as: 'u' }),
  [HEADING_KEYS.h1]: withProps(HeadingElementStatic, { variant: 'h1' }),
  [HEADING_KEYS.h2]: withProps(HeadingElementStatic, { variant: 'h2' }),
  [HEADING_KEYS.h3]: withProps(HeadingElementStatic, { variant: 'h3' }),
};

export const AIChatEditor = memo(
  ({
    aiEditorRef,
  }: {
    aiEditorRef: React.MutableRefObject<SlateEditor | null>;
  }) => {
    const { getOptions } = useEditorPlugin(AIChatPlugin);
    const lastAssistantMessage = useLastAssistantMessage();
    const content = lastAssistantMessage?.content ?? '';

    const aiEditor = React.useMemo(() => {
      const editor = getOptions().createAIEditor();

      const fragment = deserializeMd(editor, content);
      editor.children =
        fragment.length > 0 ? fragment : editor.api.create.value();

      return editor;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    React.useEffect(() => {
      if (aiEditor && content) {
        aiEditorRef.current = aiEditor;

        setTimeout(() => {
          aiEditor.tf.setValue(deserializeMd(aiEditor, content));
        }, 0);
      }
    }, [aiEditor, aiEditorRef, content]);

    if (!content) return null;

    return (
      <EditorStatic
        variant="aiChat"
        components={staticComponents}
        editor={aiEditor}
      />
    );
  }
);
