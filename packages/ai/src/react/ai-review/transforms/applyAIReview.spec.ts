import { BaseEditorKit } from '../../../../../../apps/www/src/registry/components/editor/editor-base-kit';
import { createSlateEditor, getPluginType, KEYS } from 'platejs';
import {
  convertChildrenDeserialize,
  deserializeMd,
  parseAttributes,
} from '@platejs/markdown';
import { applyAIReview } from './applyAIReview';
import { getAIReviewCommentKey } from '../utils/getAIReviewKey';

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

    applyAIReview(editor, previewEditor);

    expect(editor.children).toEqual([
      {
        type: 'p',
        children: [
          { text: 'hello,' },
          {
            [KEYS.comment]: true,
            [getAIReviewCommentKey()]: 'test',
            text: 'hello',
          },
          { text: ',hello,hello.' },
        ],
      },
    ]);
  });
});
