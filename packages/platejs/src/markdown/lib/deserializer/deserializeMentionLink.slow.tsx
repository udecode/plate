/** @jsx jsx */
import { jsx } from '#platejs-test-internal';

import { createTestEditor } from '../__tests__/createTestEditor';

jsx;

describe('editor.api.markdown.deserialize - mention link format', () => {
  it('deserialize [display text](mention:id) format', () => {
    const editor = createTestEditor();

    const markdown = 'Hello [John Doe](mention:john_doe), how are you?';
    const value = editor.api.markdown.deserialize(markdown);

    expect(value.children).toEqual([
      <hp>
        <htext>Hello </htext>
        <hmention label="John Doe" ref="john_doe">
          <htext />
        </hmention>
        <htext>, how are you?</htext>
      </hp>,
    ]);
  });

  it('deserialize mentions with spaces in ID', () => {
    const editor = createTestEditor();

    const markdown = 'CC: [Jane Smith](mention:jane%20smith)';
    const value = editor.api.markdown.deserialize(markdown);

    expect(value.children).toEqual([
      <hp>
        <htext>CC: </htext>
        <hmention label="Jane Smith" ref="jane smith">
          <htext />
        </hmention>
      </hp>,
    ]);
  });

  it('deserialize mixed mention formats', () => {
    const editor = createTestEditor();

    const markdown =
      '@alice mentioned [Bob Johnson](mention:bob_johnson) and @charlie';
    const value = editor.api.markdown.deserialize(markdown);

    expect(value.children).toEqual([
      <hp>
        <hmention ref="alice">
          <htext />
        </hmention>
        <htext> mentioned </htext>
        <hmention label="Bob Johnson" ref="bob_johnson">
          <htext />
        </hmention>
        <htext> and </htext>
        <hmention ref="charlie">
          <htext />
        </hmention>
      </hp>,
    ]);
  });

  it('handle multiple link mentions in one paragraph', () => {
    const editor = createTestEditor();

    const markdown =
      '[Team Lead](mention:team_lead) assigned this to [QA Team](mention:qa_team)';
    const value = editor.api.markdown.deserialize(markdown);

    expect(value.children).toEqual([
      <hp>
        <hmention label="Team Lead" ref="team_lead">
          <htext />
        </hmention>
        <htext> assigned this to </htext>
        <hmention label="QA Team" ref="qa_team">
          <htext />
        </hmention>
      </hp>,
    ]);
  });

  it('handle special characters in mention IDs', () => {
    const editor = createTestEditor();

    const markdown =
      '[User 123](mention:user-123) and [Dev Team](mention:dev.team)';
    const value = editor.api.markdown.deserialize(markdown);

    expect(value.children).toEqual([
      <hp>
        <hmention label="User 123" ref="user-123">
          <htext />
        </hmention>
        <htext> and </htext>
        <hmention label="Dev Team" ref="dev.team">
          <htext />
        </hmention>
      </hp>,
    ]);
  });

  it('does not convert regular links to mentions even with @ in text', () => {
    const editor = createTestEditor();

    const markdown = '[@mention](/docs/mention)';
    const value = editor.api.markdown.deserialize(markdown);

    expect(value.children).toEqual([
      <hp>
        <ha url="/docs/mention">
          <htext>@mention</htext>
        </ha>
      </hp>,
    ]);
  });

  it('handle mixed links and mentions correctly', () => {
    const editor = createTestEditor();

    const markdown =
      'Check [@docs](https://docs.com) and [Alice](mention:alice) plus @bob';
    const value = editor.api.markdown.deserialize(markdown);

    expect(value.children).toEqual([
      <hp>
        <htext>Check </htext>
        <ha url="https://docs.com">
          <htext>@docs</htext>
        </ha>
        <htext> and </htext>
        <hmention label="Alice" ref="alice">
          <htext />
        </hmention>
        <htext> plus </htext>
        <hmention ref="bob">
          <htext />
        </hmention>
      </hp>,
    ]);
  });
});
