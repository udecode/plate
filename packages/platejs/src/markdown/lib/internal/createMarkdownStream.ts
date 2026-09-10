import type { Root } from 'mdast';
import remarkParse from 'remark-parse';
import { unified } from 'unified';

import {
  type Descendant,
  type Editor,
  PLUGINS,
  TextApi,
  ElementApi,
} from '../../../core';
import { mdastToSlate } from '../deserializer/mdastToSlate';
import { htmlToJsx } from '../deserializer/utils/htmlToJsx';
import { MarkdownPlugin } from '../MarkdownPlugin';
import {
  deserializeMdWithRuntime,
  getMergedOptionsDeserialize,
  type MarkdownRuntimeState,
  withMarkdownRuntime,
} from './markdownConversion';
import { getRemarkPluginTag } from './remarkPluginTags';

const localRemarkTags = new Set([
  'remarkMdx',
  'remarkMention',
  'remarkGfm',
  'remarkMath',
  'remarkEmoji',
]);
const plainParagraph = /^[A-Za-z][A-Za-z0-9 ,.!?'()-]*$/;

/** One operation's raw source and parsed draft. Never reads text back from nodes. */
export const createMarkdownStream = (editor: Editor) => {
  let source = '';
  let offset = 0;
  let prefix: Descendant[] = [];
  let value: Descendant[] = [];
  let plain = false;
  let settings: MarkdownRuntimeState | undefined;
  let parsedBytes = 0;
  let parses = 0;

  return {
    get source() {
      return source;
    },
    get value(): readonly Descendant[] {
      return value;
    },
    get metrics() {
      return { parsedBytes, parses };
    },
    update(nextSource: string): readonly Descendant[] {
      const nextSettings = editor.plugin(MarkdownPlugin).store.get();
      if (nextSource === source && settings === nextSettings) return value;
      if (!nextSource.startsWith(source) || settings !== nextSettings) {
        offset = 0;
        prefix = [];
        plain = false;
      }
      settings = nextSettings;
      source = nextSource;

      return withMarkdownRuntime(editor, nextSettings, (runtime) => {
        // Unknown transforms may depend on the whole document. Options-bearing
        // tuples and custom filters are deliberately kept on the complete path.
        const local =
          !runtime.options.allowNode &&
          nextSettings.remarkPlugins.every(
            (plugin) =>
              typeof plugin === 'function' &&
              localRemarkTags.has(getRemarkPluginTag(plugin) ?? '')
          );
        // Later definitions can change earlier links, images and footnotes.
        const global = !local || /[[\]]/.test(source);
        if (global) {
          offset = 0;
          prefix = [];
          plain = false;
        }
        const input = source.slice(offset);
        const paragraphType =
          runtime.registry.type(PLUGINS.paragraph) ?? 'paragraph';

        // A single plain line has no open Markdown construct. Appending plain
        // characters cannot change its shape; exclude GFM's www autolinks.

        const wasPlain = plain;
        plain = false;
        const options = getMergedOptionsDeserialize(runtime);
        const blocks = (tree: Root) =>
          mdastToSlate(tree, options).map((node) =>
            TextApi.isText(node)
              ? { type: paragraphType, children: [node] }
              : node
          );
        if (wasPlain && plainParagraph.test(input) && !input.includes('www.')) {
          const text = input.trimEnd();
          const position = {
            start: { line: 1, column: 1, offset: 0 },
            end: { line: 1, column: input.length + 1, offset: input.length },
          };
          value = [
            ...prefix,
            ...blocks({
              type: 'root',
              position,
              children: [
                {
                  type: 'paragraph',
                  position,
                  children: [
                    {
                      type: 'text',
                      value: text,
                      position: {
                        ...position,
                        end: {
                          line: 1,
                          column: text.length + 1,
                          offset: text.length,
                        },
                      },
                    },
                  ],
                },
              ],
            }),
          ];
          plain = true;
          return value;
        }
        parsedBytes += input.length;
        parses += 1;
        try {
          const processed = htmlToJsx(input);
          const processor = unified()
            .use(remarkParse)
            .use(options.remarkPlugins ?? []);
          const tree = processor.runSync(processor.parse(processed)) as Root;
          const last = tree.children.at(-1);
          const boundary = last?.position?.start.offset ?? 0;
          // Only the parser's block boundaries can retire source. Rewriting
          // HTML attributes changes offsets, so retain that whole source tail.
          if (!global && processed === input && boundary > 0 && last) {
            prefix = [
              ...prefix,
              ...blocks({ ...tree, children: tree.children.slice(0, -1) }),
            ];
            offset += boundary;
            value = [...prefix, ...blocks({ ...tree, children: [last] })];
          } else value = [...prefix, ...blocks(tree)];

          const tail = source.slice(offset);
          const node = value.at(-1);
          plain =
            !global &&
            last?.type === 'paragraph' &&
            ElementApi.isElement(node) &&
            node.type === paragraphType &&
            Object.keys(node).length === 2 &&
            node.children.length === 1 &&
            TextApi.isText(node.children[0]) &&
            Object.keys(node.children[0]).length === 1 &&
            plainParagraph.test(tail) &&
            !tail.includes('www.');
        } catch {
          // The Markdown owner supplies its existing incomplete-MDX policy.
          // Recovered preview text never becomes the next parser input.
          value = [
            ...prefix,
            ...deserializeMdWithRuntime(runtime, input).children,
          ];
        }
        return value;
      });
    },
  };
};
