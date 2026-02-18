import { describe, expect, it } from 'bun:test';
import { createPlateEditor } from 'platejs/react';

import {
  discussionPlugin,
  type TDiscussion,
  DiscussionKit,
} from './discussion-kit';

describe('discussionPlugin', () => {
  it('should create plugin with default options', () => {
    const editor = createPlateEditor({
      plugins: [discussionPlugin],
    });

    const options = editor.getOptions(discussionPlugin);

    expect(options.currentUserId).toBe('alice');
    expect(options.discussions).toBeInstanceOf(Array);
    expect(options.discussions.length).toBeGreaterThan(0);
    expect(options.users).toHaveProperty('alice');
    expect(options.users).toHaveProperty('bob');
    expect(options.users).toHaveProperty('charlie');
  });

  it('should have correct user data structure', () => {
    const editor = createPlateEditor({
      plugins: [discussionPlugin],
    });

    const options = editor.getOptions(discussionPlugin);
    const alice = options.users.alice;

    expect(alice).toMatchObject({
      id: 'alice',
      name: 'Alice',
      avatarUrl: expect.stringContaining('dicebear.com'),
    });
  });

  it('should have discussion data with correct structure', () => {
    const editor = createPlateEditor({
      plugins: [discussionPlugin],
    });

    const options = editor.getOptions(discussionPlugin);
    const discussion = options.discussions[0] as TDiscussion;

    expect(discussion).toHaveProperty('id');
    expect(discussion).toHaveProperty('comments');
    expect(discussion).toHaveProperty('createdAt');
    expect(discussion).toHaveProperty('isResolved');
    expect(discussion).toHaveProperty('userId');
    expect(discussion.comments).toBeInstanceOf(Array);
  });

  it('should have comments with required fields', () => {
    const editor = createPlateEditor({
      plugins: [discussionPlugin],
    });

    const options = editor.getOptions(discussionPlugin);
    const discussion = options.discussions[0] as TDiscussion;
    const comment = discussion.comments[0];

    expect(comment).toHaveProperty('id');
    expect(comment).toHaveProperty('contentRich');
    expect(comment).toHaveProperty('createdAt');
    expect(comment).toHaveProperty('discussionId');
    expect(comment).toHaveProperty('isEdited');
    expect(comment).toHaveProperty('userId');
  });

  it('should configure BlockDiscussion render component', () => {
    const editor = createPlateEditor({
      plugins: [discussionPlugin],
    });

    const plugin = editor.getPlugin(discussionPlugin);

    expect(plugin.render?.aboveNodes).toBeDefined();
  });
});

describe('discussionPlugin selectors', () => {
  it('should return current user with currentUser selector', () => {
    const editor = createPlateEditor({
      plugins: [discussionPlugin],
    });

    const currentUser = editor.useOption(discussionPlugin, 'currentUser');

    expect(currentUser).toMatchObject({
      id: 'alice',
      name: 'Alice',
      avatarUrl: expect.stringContaining('alice'),
    });
  });

  it('should return specific user with user selector', () => {
    const editor = createPlateEditor({
      plugins: [discussionPlugin],
    });

    const bob = editor.useOption(discussionPlugin, 'user', 'bob');

    expect(bob).toMatchObject({
      id: 'bob',
      name: 'Bob',
      avatarUrl: expect.stringContaining('bob'),
    });
  });

  it('should return charlie with user selector', () => {
    const editor = createPlateEditor({
      plugins: [discussionPlugin],
    });

    const charlie = editor.useOption(discussionPlugin, 'user', 'charlie');

    expect(charlie).toMatchObject({
      id: 'charlie',
      name: 'Charlie',
      avatarUrl: expect.stringContaining('charlie'),
    });
  });

  it('should handle undefined user gracefully', () => {
    const editor = createPlateEditor({
      plugins: [discussionPlugin],
    });

    const unknownUser = editor.useOption(discussionPlugin, 'user', 'unknown');

    expect(unknownUser).toBeUndefined();
  });
});

describe('DiscussionKit', () => {
  it('should be an array containing discussionPlugin', () => {
    expect(DiscussionKit).toBeInstanceOf(Array);
    expect(DiscussionKit.length).toBe(1);
    expect(DiscussionKit[0]).toBe(discussionPlugin);
  });

  it('should work when spread into plugins array', () => {
    const editor = createPlateEditor({
      plugins: [...DiscussionKit],
    });

    const options = editor.getOptions(discussionPlugin);

    expect(options.currentUserId).toBe('alice');
  });
});

describe('TDiscussion type support', () => {
  it('should support optional authorName field', () => {
    const discussion: TDiscussion = {
      id: 'test-1',
      comments: [],
      createdAt: new Date(),
      isResolved: false,
      userId: 'user-1',
      authorName: 'Test Author',
    };

    expect(discussion.authorName).toBe('Test Author');
  });

  it('should support optional authorInitials field', () => {
    const discussion: TDiscussion = {
      id: 'test-2',
      comments: [],
      createdAt: new Date(),
      isResolved: false,
      userId: 'user-2',
      authorInitials: 'TA',
    };

    expect(discussion.authorInitials).toBe('TA');
  });

  it('should support optional paraId field for DOCX roundtrip', () => {
    const discussion: TDiscussion = {
      id: 'test-3',
      comments: [],
      createdAt: new Date(),
      isResolved: false,
      userId: 'user-3',
      paraId: '12345678',
    };

    expect(discussion.paraId).toBe('12345678');
  });

  it('should support optional documentContent field', () => {
    const discussion: TDiscussion = {
      id: 'test-4',
      comments: [],
      createdAt: new Date(),
      isResolved: false,
      userId: 'user-4',
      documentContent: 'commented text',
    };

    expect(discussion.documentContent).toBe('commented text');
  });
});

describe('discussionsData fixtures', () => {
  it('should have discussion1 with 2 comments', () => {
    const editor = createPlateEditor({
      plugins: [discussionPlugin],
    });

    const options = editor.getOptions(discussionPlugin);
    const discussion1 = options.discussions.find(
      (d: TDiscussion) => d.id === 'discussion1'
    );

    expect(discussion1).toBeDefined();
    expect(discussion1?.comments.length).toBe(2);
  });

  it('should have discussion2 with overlapping content', () => {
    const editor = createPlateEditor({
      plugins: [discussionPlugin],
    });

    const options = editor.getOptions(discussionPlugin);
    const discussion2 = options.discussions.find(
      (d: TDiscussion) => d.id === 'discussion2'
    );

    expect(discussion2).toBeDefined();
    expect(discussion2?.documentContent).toBe('overlapping');
    expect(discussion2?.comments.length).toBe(2);
  });

  it('should have unresolved discussions by default', () => {
    const editor = createPlateEditor({
      plugins: [discussionPlugin],
    });

    const options = editor.getOptions(discussionPlugin);

    options.discussions.forEach((d: TDiscussion) => {
      expect(d.isResolved).toBe(false);
    });
  });

  it('should have valid timestamps for comments', () => {
    const editor = createPlateEditor({
      plugins: [discussionPlugin],
    });

    const options = editor.getOptions(discussionPlugin);
    const discussion = options.discussions[0] as TDiscussion;

    discussion.comments.forEach((comment) => {
      expect(comment.createdAt).toBeInstanceOf(Date);
      expect(comment.createdAt.getTime()).toBeLessThanOrEqual(Date.now());
    });
  });
});
