import { getEditorDOMFromHtmlString } from './htmlStringToEditorDOM';

describe('getEditorDOMFromHtmlString', () => {
  it('returns the first slate editor element from the html string', () => {
    expect(
      getEditorDOMFromHtmlString(
        '<div><section data-slate-editor="true" id="first"></section><section data-slate-editor="true" id="second"></section></div>'
      )?.id
    ).toBe('first');
  });

  it('returns null when the html string does not contain a slate editor', () => {
    expect(
      getEditorDOMFromHtmlString('<div><p>No editor</p></div>')
    ).toBeNull();
  });

  it('parses HTML in an inert document', () => {
    const node = getEditorDOMFromHtmlString(
      '<div data-slate-editor="true"></div>'
    );

    expect(node?.ownerDocument).not.toBe(document);
  });
});
