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
        <hmention key="john_doe" value="John Doe">
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
        <hmention key="jane smith" value="Jane Smith">
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
        <hmention key="bob_johnson" value="Bob Johnson">
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
        <hmention key="team_lead" value="Team Lead">
          <htext></htext>
        </hmention>
        <htext> assigned this to </htext>
        <hmention key="qa_team" value="QA Team">
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
        <hmention key="user-123" value="User 123">
          <htext></htext>
        </hmention>
        <htext> and </htext>
        <hmention key="dev.team" value="Dev Team">
          <htext></htext>
        </hmention>
      </hp>,
    ]);
  });

  it('should not convert regular links to mentions even with @ in text', () => {
    const editor = createTestEditor([BaseMentionPlugin]);

    const markdown = `[@mention](/docs/mention)`;
    const value = deserializeMd(editor, markdown);

    expect(value).toEqual([
      <hp>
        <ha url="/docs/mention">
          <htext>@mention</htext>
        </ha>
      </hp>,
    ]);
  });

  it('should handle mixed links and mentions correctly', () => {
    const editor = createTestEditor([BaseMentionPlugin]);

    const markdown = `Check [@docs](https://docs.com) and [Alice](mention:alice) plus @bob`;
    const value = deserializeMd(editor, markdown);

    expect(value).toEqual([
      <hp>
        <htext>Check </htext>
        <ha url="https://docs.com">
          <htext>@docs</htext>
        </ha>
        <htext> and </htext>
        <hmention key="alice" value="Alice">
          <htext></htext>
        </hmention>
        <htext> plus </htext>
        <hmention value="bob">
          <htext></htext>
        </hmention>
      </hp>,
    ]);
  });
});
