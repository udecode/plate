import {
  cleanDocxBrComments,
  generateSpaces,
  generateTabs,
  getDocxListContentHtml,
  getDocxListIndent,
  isDocxBookmark,
  isDocxFootnote,
  isDocxList,
} from './index';

describe('docx cleaner helpers', () => {
  it('identifies footnotes and bookmarks', () => {
    const document = new DOMParser().parseFromString(
      '<div><span class="MsoFootnoteReference">[4]</span><span style="mso-bookmark:_Ref"></span><span style="mso-bookmark:_Ref">x</span></div>',
      'text/html'
    );
    const [footnote, emptyBookmark, filledBookmark] = Array.from(
      document.body.firstElementChild!.children
    );

    expect(isDocxFootnote(footnote)).toBe(true);
    expect(isDocxFootnote(emptyBookmark)).toBe(false);
    expect(isDocxBookmark(emptyBookmark)).toBe(true);
    expect(isDocxBookmark(filledBookmark)).toBe(false);
  });

  it('removes support-line-break comment payloads after br nodes', () => {
    const document = new DOMParser().parseFromString(
      '<div><br /><!--[if !supportLineBreakNewLine]--><span>drop</span><!--[endif]--><span>keep</span></div>',
      'text/html'
    );

    cleanDocxBrComments(document.body);

    expect(document.body.innerHTML).not.toContain('drop');
    expect(document.body.innerHTML).toContain('keep');
  });

  it('extracts list content without ignore markers and comment wrappers', () => {
    const element = new DOMParser().parseFromString(
      '<p style="mso-list:l0 level2 lfo1"><span style="mso-list:Ignore">1.</span><!--[if !supportLists]--><span>drop</span><!--[endif]-->Item</p>',
      'text/html'
    ).body.firstElementChild as HTMLElement;

    expect(getDocxListContentHtml(element)).not.toContain('mso-list:Ignore');
    expect(getDocxListContentHtml(element)).not.toContain('[if !supportLists]');
    expect(getDocxListContentHtml(element)).toContain('Item');
  });

  it('parses list indent and detects docx lists from either marker style', () => {
    const [ignoreList, commentList, plain] = Array.from(
      new DOMParser().parseFromString(
        [
          '<div style="mso-list:l0 level3 lfo1"><span style="mso-list:Ignore">1.</span>Item</div>',
          '<div style="mso-list:l0 level2 lfo1"><!--[if !supportLists]--><span>1.</span><!--[endif]-->Item</div>',
          '<div style="color:red">plain</div>',
        ].join(''),
        'text/html'
      ).body.children
    );

    expect(getDocxListIndent(ignoreList)).toBe(3);
    expect(getDocxListIndent(plain)).toBe(1);
    expect(isDocxList(ignoreList)).toBe(true);
    expect(isDocxList(commentList)).toBe(true);
    expect(isDocxList(plain)).toBe(false);
  });

  it('generates spaces and tabs deterministically', () => {
    expect(generateSpaces(3)).toBe('   ');
    expect(generateTabs(2)).toBe('\t\t');
  });
});
