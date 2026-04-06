import * as React from 'react';

import { render } from '@testing-library/react';
import { afterAll, beforeEach, describe, expect, it, mock } from 'bun:test';

const useBlockDiscussionItemsMock = mock();

let editorRef: any;

mock.module('@platejs/comment', () => ({
  getDraftCommentKey: () => '__draft_comment__',
}));

mock.module('@platejs/comment/react', () => ({
  CommentPlugin: 'comment-plugin',
}));

mock.module('@platejs/suggestion', () => ({
  getTransientSuggestionKey: () => '__transient_suggestion__',
}));

mock.module('@platejs/suggestion/react', () => ({
  SuggestionPlugin: 'suggestion-plugin',
}));

mock.module('lucide-react', () => ({
  MessageSquareTextIcon: () => <div />,
  MessagesSquareIcon: () => <div />,
  PencilLineIcon: () => <div />,
}));

mock.module('platejs', () => ({
  PathApi: {
    equals: (path1: number[], path2: number[]) =>
      JSON.stringify(path1) === JSON.stringify(path2),
  },
}));

mock.module('platejs/react', () => ({
  useEditorRef: () => editorRef,
  usePluginOption: () => null,
}));

mock.module('@/components/ui/button', () => ({
  Button: ({ children }: any) => <button>{children}</button>,
}));

mock.module('@/components/ui/popover', () => ({
  Popover: ({ children }: any) => <div>{children}</div>,
  PopoverAnchor: ({ children }: any) => <div>{children}</div>,
  PopoverContent: ({ children }: any) => <div>{children}</div>,
  PopoverTrigger: ({ children }: any) => <div>{children}</div>,
}));

mock.module('@/registry/components/editor/plugins/comment-kit', () => ({
  commentPlugin: 'comment-plugin',
}));

mock.module('@/registry/components/editor/plugins/suggestion-kit', () => ({
  suggestionPlugin: 'suggestion-plugin',
}));

mock.module('./block-discussion-index', () => ({
  useBlockDiscussionItems: useBlockDiscussionItemsMock,
}));

mock.module('./block-suggestion', () => ({
  BlockSuggestionCard: () => <div />,
  isResolvedSuggestion: () => false,
}));

mock.module('./comment', () => ({
  Comment: () => <div />,
  CommentCreateForm: () => <div />,
}));

describe('BlockDiscussion', () => {
  beforeEach(() => {
    useBlockDiscussionItemsMock.mockReset();
    useBlockDiscussionItemsMock.mockReturnValue({
      resolvedDiscussions: [],
      resolvedSuggestions: [],
    });
  });

  afterAll(() => {
    mock.restore();
  });

  it('recomputes the current block path when the wrapper rerenders', async () => {
    const findPathMock = mock(() => [2]);
    const element = { children: [{ text: 'test' }], type: 'p' };

    editorRef = {
      api: {
        findPath: findPathMock,
      },
      getApi: () => ({
        comment: {
          node: () => {},
          nodes: () => [],
        },
        suggestion: {
          nodes: () => [],
        },
      }),
    };

    const { BlockDiscussion } = await import(
      `./block-discussion?test=${Math.random().toString(36).slice(2)}`
    );

    const Wrapper = BlockDiscussion({
      attributes: {},
      children: 'child',
      editor: editorRef,
      element,
      path: [2],
    } as any) as React.ComponentType<any>;

    const view = render(
      <Wrapper attributes={{}} editor={editorRef} element={element} path={[2]}>
        child
      </Wrapper>
    );

    expect(useBlockDiscussionItemsMock).toHaveBeenNthCalledWith(1, [2]);

    findPathMock.mockReturnValue([1]);

    view.rerender(
      <Wrapper attributes={{}} editor={editorRef} element={element} path={[2]}>
        child
      </Wrapper>
    );

    expect(useBlockDiscussionItemsMock).toHaveBeenNthCalledWith(2, [1]);
  });
});
