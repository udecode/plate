import { getEditorDOMFromHtmlString } from './htmlStringToEditorDOM';

describe('getEditorDOMFromHtmlString', () => {
  it('returns the first slate editor element from the html string', () => {
    expect(
      getEditorDOMFromHtmlString(
        '<div><section data-plite-editor="true" id="first"></section><section data-plite-editor="true" id="second"></section></div>'
      )?.id
    ).toBe('first');
  });

  it('returns null when the html string does not contain a slate editor', () => {
    expect(
      getEditorDOMFromHtmlString('<div><p>No editor</p></div>')
    ).toBeNull();
  });
});
