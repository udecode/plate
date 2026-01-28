import { getTestDataByFileName } from '@tests/helpers/helpers.js';
import { importCommentData } from '@converter/v2/importer/documentCommentsImporter.js';

describe('basic comment import [basic-comment.docx]', () => {
  const dataName = 'basic-comment.docx';
  let content, docx;
  let comments;

  beforeAll(async () => {
    docx = await getTestDataByFileName(dataName);
    const documentXml = docx['word/document.xml'];
    const doc = documentXml.elements[0];
    const body = doc.elements[0];
    content = body.elements;

    // Import comment data
    comments = importCommentData({ docx });
  });

  it('can import basic comments', async () => {
    expect(comments).toHaveLength(1);

    const comment = comments[0];
    expect(comment.commentId).toHaveLength(36); // UUID is generated at import
    expect(comment.creatorName).toBe('Nick Bernal');
    expect(comment.creatorEmail).toBeUndefined();
    expect(comment.createdTime).toBe(1739389620000);
    expect(comment.initials).toBe('NB');
    expect(comment.paraId).toBe('5C17FA99');
    expect(comment.isDone).toBe(false);
    expect(comment.parentCommentId).toBeUndefined();

    const commentText = comment.textJson;
    expect(commentText.type).toBe('paragraph');

    const commentContent = commentText.content;
    expect(commentContent).toHaveLength(1);
    expect(commentContent[0].text).toBe('abcabc');
    expect(commentContent[0].type).toBe('text');
    expect(commentContent[0].marks).toHaveLength(1);

    const firstMark = commentContent[0].marks[0];
    expect(firstMark.type).toBe('textStyle');
    expect(firstMark.attrs.fontSize).toBe('10pt');
  });
});

describe('threaded comment import [threaded-comment.docx]', () => {
  const dataName = 'threaded-comment.docx';
  let content, docx;
  let comments;

  beforeAll(async () => {
    docx = await getTestDataByFileName(dataName);
    const documentXml = docx['word/document.xml'];
    const doc = documentXml.elements[0];
    const body = doc.elements[0];
    content = body.elements;

    // Import comment data
    comments = importCommentData({ docx });
  });

  it('can import threaded comments', async () => {
    expect(comments).toHaveLength(3);
    const parentComment = comments[0];
    expect(parentComment.parentCommentId).toBeUndefined();

    const childComment = comments[1];
    expect(childComment.parentCommentId).toBe(parentComment.commentId);
    expect(childComment.isDone).toBe(false);
  });
});

describe('comment import with resolved comment [basic-resolved-comment.docx]', () => {
  const dataName = 'basic-resolved-comment.docx';
  let content, docx;
  let comments;

  beforeAll(async () => {
    docx = await getTestDataByFileName(dataName);
    const documentXml = docx['word/document.xml'];
    const doc = documentXml.elements[0];
    const body = doc.elements[0];
    content = body.elements;

    // Import comment data
    comments = importCommentData({ docx });
  });

  it('can import threaded comments', async () => {
    expect(comments).toHaveLength(2);

    const notResolved = comments[0];
    const resolvedComment = comments[1];
    expect(notResolved.isDone).toBe(false);
    expect(resolvedComment.isDone).toBe(true);
  });
});
