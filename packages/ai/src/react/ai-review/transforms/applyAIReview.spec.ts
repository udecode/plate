import { BaseEditorKit } from '../../../../../../apps/www/src/registry/components/editor/editor-base-kit';
import { createSlateEditor, getPluginType, KEYS, TextApi } from 'platejs';
import {
  convertChildrenDeserialize,
  deserializeMd,
  parseAttributes,
} from '@platejs/markdown';
import { applyAIReview } from './applyAIReview';
import { getAIReviewCommentKey } from '../utils/getAIReviewKey';
import { getCommentKey } from '@platejs/comment';

function createPreviewEditor(value: string) {
  const previewEditor = createSlateEditor({
    plugins: BaseEditorKit,
  });

  previewEditor.children = deserializeMd(previewEditor, value, {
    rules: {
      [KEYS.comment]: {
        mark: true,
        deserialize: (mdastNode, deco, options) => {
          const props = parseAttributes(mdastNode.attributes);
          const aiCommentContent = props.value;
          return convertChildrenDeserialize(
            mdastNode.children,
            {
              [getPluginType(options.editor!, KEYS.comment)]: true,
              [getAIReviewCommentKey()]: aiCommentContent,
              ...deco,
            },
            options
          ) as any;
        },
      },
    },
    memoize: true,
  });

  return previewEditor;
}

describe('applyAIReview', () => {
  it('should apply the AI review to the editor', () => {
    const previewEditor = createPreviewEditor(
      'hello,<comment value="test">hello</comment>,hello,hello.'
    );

    const editor = createSlateEditor({
      plugins: BaseEditorKit,
      value: [
        {
          type: 'p',
          children: [{ text: 'hello,hello,hello,hello.' }],
        },
      ],
    });

    applyAIReview(editor, previewEditor, {
      onComment: ({ range, content, text }) => {
        editor.tf.setNodes(
          {
            [KEYS.comment]: true,
            [getCommentKey('test')]: true,
          },
          {
            at: range,
            match: TextApi.isText,
            split: true,
          }
        );
      },
    });

    expect(editor.children).toEqual([
      {
        type: 'p',
        children: [
          { text: 'hello,' },
          {
            [KEYS.comment]: true,
            [getCommentKey('test')]: true,
            text: 'hello',
          },
          { text: ',hello,hello.' },
        ],
      },
    ]);
  });

  // it.only('should apply the AI review to the editor', () => {
  //   const previewEditor = createPreviewEditor('markdown string');

  //   const editor = createSlateEditor({
  //     plugins: BaseEditorKit,
  //   });

  //   editor.children = deserializeMd(editor, 'markdown string orginal');

  //   applyAIReview(editor, previewEditor, {
  //     onComment: ({ range, content, text }) => {
  //       editor.tf.setNodes(
  //         {
  //           [KEYS.comment]: true,
  //           [getCommentKey('test')]: true,
  //         },
  //         {
  //           at: range,
  //           match: TextApi.isText,
  //           split: true,
  //         }
  //       );
  //     },
  //   });
  // });
});
