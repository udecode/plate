/** @jsx jsx */
import { BaseMentionPlugin } from '@platejs/mention';
import { jsx } from '@platejs/test-utils';

import { createTestEditor } from '../__tests__/createTestEditor';
import { deserializeMd } from './deserializeMd';

jsx;

describe('deserializeMd - mention link format', () => {
  it('should deserialize [display text](mention:id) format', () => {
    const editor = createTestEditor([BaseMentionPlugin]);

    const markdown = 'Hello [John Doe](mention:john_doe), how are you?';
    const value = deserializeMd(editor, markdown);

    expect(value).toEqual([
      <hp>
        <htext>Hello </htext>
        <hmention value="john_doe">
          <htext></htext>
        </hmention>
        <htext>, how are you?</htext>
      </hp>,
    ]);
  });

  it('should deserialize mentions with spaces in ID', () => {
    const editor = createTestEditor([BaseMentionPlugin]);

    const markdown = 'CC: [Jane Smith](mention:jane%20smith)';
    const value = deserializeMd(editor, markdown);

    expect(value).toEqual([
      <hp>
        <htext>CC: </htext>
        <hmention value="jane smith">
          <htext></htext>
        </hmention>
      </hp>,
    ]);
  });

  it('should deserialize mixed mention formats', () => {
    const editor = createTestEditor([BaseMentionPlugin]);

    const markdown =
      '@alice mentioned [Bob Johnson](mention:bob_johnson) and @charlie';
    const value = deserializeMd(editor, markdown);

    expect(value).toEqual([
      <hp>
        <hmention value="alice">
          <htext></htext>
        </hmention>
        <htext> mentioned </htext>
        <hmention value="bob_johnson">
          <htext></htext>
        </hmention>
        <htext> and </htext>
        <hmention value="charlie">
          <htext></htext>
        </hmention>
      </hp>,
    ]);
  });

  it('should handle multiple link mentions in one paragraph', () => {
    const editor = createTestEditor([BaseMentionPlugin]);

    const markdown =
      '[Team Lead](mention:team_lead) assigned this to [QA Team](mention:qa_team)';
    const value = deserializeMd(editor, markdown);

    expect(value).toEqual([
      <hp>
        <hmention value="team_lead">
          <htext></htext>
        </hmention>
        <htext> assigned this to </htext>
        <hmention value="qa_team">
          <htext></htext>
        </hmention>
      </hp>,
    ]);
  });

  it('should handle special characters in mention IDs', () => {
    const editor = createTestEditor([BaseMentionPlugin]);

    const markdown =
      '[User 123](mention:user-123) and [Dev Team](mention:dev.team)';
    const value = deserializeMd(editor, markdown);

    expect(value).toEqual([
      <hp>
        <hmention value="user-123">
          <htext></htext>
        </hmention>
        <htext> and </htext>
        <hmention value="dev.team">
          <htext></htext>
        </hmention>
      </hp>,
    ]);
  });
});
