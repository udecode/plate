import { stripPliteDataAttributes } from './stripPliteDataAttributes.internal';

describe('stripPliteDataAttributes', () => {
  it('removes Plite renderer data attributes and test ids', () => {
    expect(
      stripPliteDataAttributes(
        '<span data-editor-node="text" data-editor-node-key="n1" data-editor-path="0,0" data-editor-root="main" data-editor-leaf="true"><span data-editor-end="5" data-editor-start="0" data-editor-string="true" data-testid="leaf">Alpha</span></span>'
      )
    ).toBe('<span><span>Alpha</span></span>');
  });

  it('keeps app-owned data attributes', () => {
    expect(
      stripPliteDataAttributes(
        '<p data-id="a" data-custom="b" data-editor-test="paragraph">Alpha</p>'
      )
    ).toBe(
      '<p data-id="a" data-custom="b" data-editor-test="paragraph">Alpha</p>'
    );
  });
});
