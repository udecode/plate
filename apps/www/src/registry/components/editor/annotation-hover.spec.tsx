import { render } from '@testing-library/react';
import { createEditor, Plate } from 'platejs/react';
import * as React from 'react';

import { BasicBlocksKit } from './basic-blocks';
import { CommentKit } from './comment';
import { Editor } from './editor';
import {
  getBlockSuggestionWrapperClassName,
  suggestionVariants,
} from './suggestion';

describe('annotation hover', () => {
  it('renders comment and suggestion hover feedback with native CSS states', () => {
    const editor = createEditor({
      plugins: [...BasicBlocksKit, ...CommentKit],
      initialValue: [
        {
          children: [
            {
              comment: true,
              comment_discussion1: true,
              text: 'single',
            },
            { text: ' ' },
            {
              comment: true,
              comment_discussion1: true,
              comment_discussion2: true,
              text: 'overlapping',
            },
          ],
          type: 'paragraph',
        },
      ],
    });
    const rendered = render(
      <Plate editor={editor}>
        <Editor />
      </Plate>
    );
    const comments = [...rendered.container.querySelectorAll('.plite-comment')];
    const singleComment = comments.find(
      (comment) => comment.textContent === 'single'
    );
    const overlappingComment = comments.find(
      (comment) => comment.textContent === 'overlapping'
    );

    expect(singleComment?.className).toContain('hover:bg-highlight/25');
    expect(overlappingComment?.className).toContain('hover:bg-highlight/45');
    expect(suggestionVariants()).toContain('hover:bg-emerald-200/80');
    expect(suggestionVariants({ remove: true })).toContain(
      'hover:bg-red-200/80'
    );
    expect(
      getBlockSuggestionWrapperClassName({
        isActive: false,
        isColumnGroup: false,
        isInsert: true,
        isRemove: false,
      })
    ).toContain('hover:bg-emerald-200/80');
    expect(
      getBlockSuggestionWrapperClassName({
        isActive: false,
        isColumnGroup: false,
        isInsert: false,
        isRemove: true,
      })
    ).toContain('hover:bg-red-200/80');
  });
});
