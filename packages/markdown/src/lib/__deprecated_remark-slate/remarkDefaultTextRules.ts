import type { SlateEditor } from '@udecode/plate';

import type { MdastNode, RemarkPluginOptions, RemarkTextRules } from './types';

import { MarkdownPlugin } from '../MarkdownPlugin';

export const getRemarkDefaultTextRules = (
  editor: SlateEditor
): RemarkTextRules => {
  const components = editor.getOptions(MarkdownPlugin).nodes;

  return {
    delete: {
      transform: (node: MdastNode, options: RemarkPluginOptions) => {
        if (components?.strikethrough?.deserialize) {
          return components.strikethrough.deserialize(node, options);
        }
        return {
          [editor.getType({ key: 'strikethrough' })]: true,
          text: node.value || '',
        };
      },
    },
    emphasis: {
      transform: (node: MdastNode, options: RemarkPluginOptions) => {
        if (components?.italic?.deserialize) {
          return components.italic.deserialize(node, options);
        }
        return {
          [editor.getType({ key: 'italic' })]: true,
          text: node.value || '',
        };
      },
    },
    html: {
      transform: (node: MdastNode, options: RemarkPluginOptions) => {
        if (components?.html?.deserialize) {
          return components.html.deserialize(node, options);
        }
        return {
          text: (node.value || '').replaceAll('<br>', '\n'),
        };
      },
    },
    inlineCode: {
      transform: (node: MdastNode, options: RemarkPluginOptions) => {
        if (components?.code?.deserialize) {
          return components.code.deserialize(node, options);
        }
        return {
          [editor.getType({ key: 'code' })]: true,
          text: node.value || '',
        };
      },
    },
    strong: {
      transform: (node: MdastNode, options: RemarkPluginOptions) => {
        if (components?.bold?.deserialize) {
          return components.bold.deserialize(node, options);
        }
        return {
          [editor.getType({ key: 'bold' })]: true,
          text: node.value || '',
        };
      },
    },
    text: {
      transform: (node: MdastNode, _options: RemarkPluginOptions) => {
        if (components?.text?.deserialize) {
          return components.text.deserialize(node, _options);
        }
        return {
          text: node.value || '',
        };
      },
    },
  };
};
