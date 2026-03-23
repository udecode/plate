import {
  buildCommentToken,
  extractComments,
  getCommentTokenPrefix,
  getCommentTokenSuffix,
  preprocessMammothHtml,
} from './preprocessMammothHtml';

describe('preprocessMammothHtml', () => {
  it('extracts comments, removes definitions, and replaces anchors with tokens', () => {
    const html = `
      <p>
        Alpha<sup><a id="comment-ref-1" href="#comment-1">[1]</a></sup>
        Beta <a id="comment-ref-2" href="#comment-2">[2]</a>
      </p>
      <dl>
        <dt id="comment-1">Comment 1</dt>
        <dd> First note <a href="#comment-ref-1">↑</a></dd>
        <dt id="comment-2">Comment 2</dt>
        <dd><p>Second note</p><p>more detail <a href="#comment-ref-2">↑</a></p></dd>
      </dl>
    `;

    const result = preprocessMammothHtml(html);

    expect(result.commentIds).toEqual(['1', '2']);
    expect(result.commentById.get('1')).toBe('First note');
    expect(result.commentById.get('2')).toBe('Second note more detail');
    expect(result.html).toContain(buildCommentToken('1'));
    expect(result.html).toContain(buildCommentToken('2'));
    expect(result.html).not.toContain('<dl>');
    expect(result.html).not.toContain('comment-ref-1');
  });

  it('keeps first-seen order and de-duplicates repeated references', () => {
    const html = `
      <p>
        <a id="comment-ref-2" href="#comment-2">[2]</a>
        <a id="comment-ref-1" href="#comment-1">[1]</a>
        <a id="comment-ref-2" href="#comment-2">[2]</a>
      </p>
      <dl>
        <dt id="comment-1">Comment 1</dt>
        <dd>First</dd>
        <dt id="comment-2">Comment 2</dt>
        <dd>Second</dd>
      </dl>
    `;

    const result = preprocessMammothHtml(html);

    expect(result.commentIds).toEqual(['2', '1']);
    expect(result.html.match(/\[\[DOCX_COMMENT_REF:2\]\]/g)).toHaveLength(2);
  });
});

describe('comment token helpers', () => {
  it('builds extractable ordered comments', () => {
    const comments = extractComments(
      new Map([
        ['2', 'Second'],
        ['1', 'First'],
      ]),
      ['2', '3', '1']
    );

    expect(comments).toEqual([
      { id: '2', text: 'Second' },
      { id: '3', text: '' },
      { id: '1', text: 'First' },
    ]);
  });

  it('exposes the token format helpers', () => {
    expect(getCommentTokenPrefix()).toBe('[[DOCX_COMMENT_REF:');
    expect(getCommentTokenSuffix()).toBe(']]');
    expect(buildCommentToken('42')).toBe('[[DOCX_COMMENT_REF:42]]');
  });
});
