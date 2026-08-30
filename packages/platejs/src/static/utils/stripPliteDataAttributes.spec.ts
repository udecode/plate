import { stripPliteDataAttributes } from './stripPliteDataAttributes';

describe('stripPliteDataAttributes', () => {
  it('removes Plite renderer data attributes and test ids', () => {
    expect(
      stripPliteDataAttributes(
        '<span data-plite-node="text" data-plite-string="true" data-testid="leaf">Alpha</span>'
      )
    ).toBe('<span>Alpha</span>');
  });

  it('keeps app-owned data attributes', () => {
    expect(
      stripPliteDataAttributes('<p data-id="a" data-custom="b">Alpha</p>')
    ).toBe('<p data-id="a" data-custom="b">Alpha</p>');
  });
});
