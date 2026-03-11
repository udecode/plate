import { findHtmlParentElement } from './findHtmlParentElement';

describe('findHtmlParentElement', () => {
  it('returns the same element when the node name matches', () => {
    const section = document.createElement('SECTION');

    expect(findHtmlParentElement(section, 'SECTION')).toBe(section);
  });

  it('walks up the parent chain until it finds a match', () => {
    const section = document.createElement('SECTION');
    const div = document.createElement('DIV');
    const span = document.createElement('SPAN');

    section.append(div);
    div.append(span);

    expect(findHtmlParentElement(span, 'SECTION')).toBe(section);
  });

  it('returns null when no matching parent exists', () => {
    const span = document.createElement('SPAN');

    expect(findHtmlParentElement(span, 'SECTION')).toBeNull();
  });

  it('returns null for null input', () => {
    expect(findHtmlParentElement(null, 'DIV')).toBeNull();
  });
});
