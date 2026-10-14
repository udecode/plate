import JSZip from 'jszip';

import { RangeApi, type Point } from '../../../core';
import { throwIfDocxAborted } from '../../internal/abort';
import { parseDocxHtml, parseDocxXml } from '../../internal/domParser';
import type { DocxComment, DocxDiagnostic } from '../../internal/types';
import {
  addMetadataDeclaration,
  createTextTokenReplacer,
  nextRelationshipId,
} from './generatedParts';

const WORD_NAMESPACE =
  'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
const WORD_RELATIONSHIPS =
  'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
const WORD14_NAMESPACE = 'http://schemas.microsoft.com/office/word/2010/wordml';
const WORD15_NAMESPACE = 'http://schemas.microsoft.com/office/word/2012/wordml';
const WORD16_COMMENT_ID_NAMESPACE =
  'http://schemas.microsoft.com/office/word/2016/wordml/cid';
const COMMENT_TOKEN = '\uE000PDXC_';

type PreparedComment = Readonly<{
  bodyEnd: string;
  bodyStart: string;
  comment: DocxComment;
  end: string;
  id: number;
  paragraphId: string;
  start: string;
}>;

export type PreparedDocxComments = Readonly<{
  comments: readonly PreparedComment[];
  diagnostics: readonly DocxDiagnostic[];
  html: string;
}>;

const textHost = (document: Document, point: Point) =>
  Array.from(
    document.querySelectorAll<HTMLElement>('[data-editor-node="text"]')
  ).find(
    (element) =>
      (element.dataset.editorRoot ?? 'main') === 'main' &&
      element.dataset.editorPath === point.path.join(',')
  );

const insertTextToken = (
  document: Document,
  host: HTMLElement,
  offset: number,
  token: string
) => {
  const walker = document.createTreeWalker(host, NodeFilter.SHOW_TEXT);
  let remaining = offset;
  let last: Text | null = null;

  while (walker.nextNode()) {
    const text = walker.currentNode as Text;

    last = text;
    if (remaining > text.data.length) {
      remaining -= text.data.length;
      continue;
    }
    const tail = text.splitText(remaining);

    tail.before(document.createTextNode(token));

    return true;
  }
  if (remaining === 0 && last) {
    last.after(document.createTextNode(token));

    return true;
  }

  return false;
};

const textLength = (host: HTMLElement) => {
  const walker = host.ownerDocument.createTreeWalker(
    host,
    NodeFilter.SHOW_TEXT
  );
  let length = 0;

  while (walker.nextNode()) {
    length += (walker.currentNode as Text).data.length;
  }

  return length;
};

export const prepareDocxComments = (
  html: string,
  comments: readonly DocxComment[] | undefined,
  bodyHtmlById: ReadonlyMap<string, string> = new Map()
): PreparedDocxComments => {
  if (!comments?.length) {
    return Object.freeze({
      comments: Object.freeze([]),
      diagnostics: Object.freeze([]),
      html,
    });
  }
  const document = parseDocxHtml(html);
  const nonce =
    globalThis.crypto?.randomUUID?.().replaceAll('-', '') ??
    `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
  const diagnostics: DocxDiagnostic[] = [];
  const prepared: PreparedComment[] = [];

  comments.forEach((comment, index) => {
    if (!comment.target) {
      diagnostics.push({
        code: 'lossy-content',
        feature: 'comment-range',
        message: `Comment ${comment.id} has no exportable range.`,
        severity: 'warning',
        sourceId: comment.id,
      });
      return;
    }
    const start = RangeApi.start(comment.target.range);
    const end = RangeApi.end(comment.target.range);
    const startHost = textHost(document, start);
    const endHost = textHost(document, end);

    if (!startHost || !endHost) {
      diagnostics.push({
        code: 'lossy-content',
        feature: 'comment-range',
        message: `Comment ${comment.id} addresses content outside the selected DOCX projection.`,
        severity: 'warning',
        sourceId: comment.id,
      });
      return;
    }
    const prefix = `${COMMENT_TOKEN}${nonce}_${index}_`;
    const record: PreparedComment = {
      bodyEnd: `${prefix}body_end\uE001`,
      bodyStart: `${prefix}body_start\uE001`,
      comment,
      end: `${prefix}end\uE001`,
      id: prepared.length,
      paragraphId: (prepared.length + 1).toString(16).padStart(8, '0'),
      start: `${prefix}start\uE001`,
    };
    const insertions = [
      { host: endHost, offset: end.offset, token: record.end },
      { host: startHost, offset: start.offset, token: record.start },
    ].sort((left, right) =>
      left.host === right.host ? right.offset - left.offset : 0
    );

    if (
      insertions.some(
        ({ host, offset }) =>
          !Number.isSafeInteger(offset) ||
          offset < 0 ||
          offset > textLength(host)
      ) ||
      !insertions.every(({ host, offset, token }) =>
        insertTextToken(document, host, offset, token)
      )
    ) {
      diagnostics.push({
        code: 'lossy-content',
        feature: 'comment-range',
        message: `Comment ${comment.id} has an invalid text offset.`,
        severity: 'warning',
        sourceId: comment.id,
      });
      return;
    }
    const bodyStart = document.createElement('p');

    bodyStart.textContent = record.bodyStart;
    document.body.append(bodyStart);
    const bodyDocument = parseDocxHtml(bodyHtmlById.get(comment.id) ?? '');
    const bodyRoot =
      bodyDocument.querySelector('[data-editor-node="editor"]') ??
      bodyDocument.body;
    const body = Array.from(bodyRoot.children);

    if (body.length === 0) {
      document.body.append(document.createElement('p'));
    } else {
      body.forEach((block) => {
        document.body.append(document.importNode(block, true));
      });
    }
    const bodyEnd = document.createElement('p');

    bodyEnd.textContent = record.bodyEnd;
    document.body.append(bodyEnd);
    prepared.push(record);
  });

  return Object.freeze({
    comments: Object.freeze(prepared),
    diagnostics: Object.freeze(diagnostics),
    html: document.body.innerHTML,
  });
};

const invalidGeneratedXml = () => new Error('Generated DOCX XML is invalid.');

const wordElement = (document: Document, name: string) =>
  document.createElementNS(WORD_NAMESPACE, `w:${name}`);

const wordText = (element: Element) =>
  Array.from(element.getElementsByTagName('*'))
    .filter((child) => child.localName === 't' || child.localName === 'delText')
    .map((child) => child.textContent ?? '')
    .join('');

const rangeMarkers = (
  document: Document,
  id: number,
  kind: 'end' | 'start'
): Node[] => {
  const marker = wordElement(
    document,
    `commentRange${kind === 'start' ? 'Start' : 'End'}`
  );

  marker.setAttributeNS(WORD_NAMESPACE, 'w:id', String(id));
  if (kind === 'start') return [marker];
  const referenceRun = wordElement(document, 'r');
  const properties = wordElement(document, 'rPr');
  const style = wordElement(document, 'rStyle');
  const reference = wordElement(document, 'commentReference');

  style.setAttributeNS(WORD_NAMESPACE, 'w:val', 'CommentReference');
  properties.append(style);
  reference.setAttributeNS(WORD_NAMESPACE, 'w:id', String(id));
  referenceRun.append(properties, reference);

  return [marker, referenceRun];
};

const markerParagraph = (document: Document, marker: string) =>
  Array.from(document.getElementsByTagName('*')).find(
    (element) => element.localName === 'p' && wordText(element) === marker
  );

/** Move prepared main-document markers into Word comment parts. */
export const addDocxComments = async (
  blob: Blob,
  prepared: PreparedDocxComments,
  signal?: AbortSignal
) => {
  throwIfDocxAborted(signal);
  if (prepared.comments.length === 0) return blob;
  const source = await blob.arrayBuffer();

  throwIfDocxAborted(signal);
  const zip = await JSZip.loadAsync(source);

  throwIfDocxAborted(signal);
  const documentFile = zip.file('word/document.xml');
  const relationshipsFile = zip.file('word/_rels/document.xml.rels');
  const contentTypesFile = zip.file('[Content_Types].xml');

  if (!documentFile || !relationshipsFile || !contentTypesFile) {
    throw new Error(
      'Generated DOCX package is missing comment metadata owners.'
    );
  }
  const document = parseDocxXml(
    await documentFile.async('string'),
    invalidGeneratedXml
  );
  throwIfDocxAborted(signal);
  const comments = parseDocxXml(
    `<w:comments xmlns:w="${WORD_NAMESPACE}" xmlns:w14="${WORD14_NAMESPACE}"/>`,
    invalidGeneratedXml
  );
  const commentsRoot = comments.documentElement;

  const replace = createTextTokenReplacer(document, COMMENT_TOKEN);

  for (const item of prepared.comments) {
    if (
      !replace(item.start, rangeMarkers(document, item.id, 'start')) ||
      !replace(item.end, rangeMarkers(document, item.id, 'end'))
    ) {
      throw new Error('Generated DOCX lost a comment range marker.');
    }
    const bodyStart = markerParagraph(document, item.bodyStart);
    const bodyEnd = markerParagraph(document, item.bodyEnd);

    if (
      !bodyStart ||
      !bodyEnd ||
      bodyStart.parentElement !== bodyEnd.parentElement
    ) {
      throw new Error('Generated DOCX lost a comment body marker.');
    }
    const body: Node[] = [];
    let sibling = bodyStart.nextSibling;

    while (sibling && sibling !== bodyEnd) {
      const next = sibling.nextSibling;

      if (sibling.nodeType === Node.ELEMENT_NODE) {
        body.push(sibling.cloneNode(true));
      }
      sibling.remove();
      sibling = next;
    }
    bodyStart.remove();
    bodyEnd.remove();
    const comment = wordElement(comments, 'comment');

    comment.setAttributeNS(WORD_NAMESPACE, 'w:id', String(item.id));
    if (item.comment.author) {
      comment.setAttributeNS(
        WORD_NAMESPACE,
        'w:author',
        item.comment.author.name
      );
      if (item.comment.author.initials) {
        comment.setAttributeNS(
          WORD_NAMESPACE,
          'w:initials',
          item.comment.author.initials
        );
      }
    }
    if (item.comment.createdAt) {
      comment.setAttributeNS(WORD_NAMESPACE, 'w:date', item.comment.createdAt);
    }
    for (const node of body) comment.append(comments.importNode(node, true));
    const paragraph = Array.from(comment.getElementsByTagName('*')).find(
      (element) => element.localName === 'p'
    );

    paragraph?.setAttributeNS(WORD14_NAMESPACE, 'w14:paraId', item.paragraphId);
    commentsRoot.append(comment);
  }

  zip.file(
    'word/document.xml',
    new XMLSerializer().serializeToString(document)
  );
  zip.file(
    'word/comments.xml',
    new XMLSerializer().serializeToString(comments)
  );
  let [relationships, contentTypes] = await Promise.all([
    relationshipsFile.async('string'),
    contentTypesFile.async('string'),
  ]);

  throwIfDocxAborted(signal);
  relationships = addMetadataDeclaration(
    relationships,
    '</Relationships>',
    `<Relationship Id="${nextRelationshipId(relationships, 'rIdComments')}" Type="${WORD_RELATIONSHIPS}/comments" Target="comments.xml"/>`
  );
  contentTypes = addMetadataDeclaration(
    contentTypes,
    '</Types>',
    '<Override PartName="/word/comments.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.comments+xml"/>'
  );
  const withExtensions = prepared.comments.some(
    ({ comment }) => comment.parentId !== null || comment.resolved !== null
  );
  const withDurableIds = prepared.comments.some(
    ({ comment }) => comment.durableId !== null
  );

  if (withExtensions) {
    const paragraphById = new Map(
      prepared.comments.map((item) => [item.comment.id, item.paragraphId])
    );
    const items = prepared.comments
      .map(({ comment, paragraphId }) => {
        const parent = comment.parentId
          ? paragraphById.get(comment.parentId)
          : undefined;

        return `<w15:commentEx w15:paraId="${paragraphId}"${parent ? ` w15:paraIdParent="${parent}"` : ''}${comment.resolved === null ? '' : ` w15:done="${comment.resolved ? 1 : 0}"`}/>`;
      })
      .join('');

    zip.file(
      'word/commentsExtended.xml',
      `<w15:commentsEx xmlns:w15="${WORD15_NAMESPACE}">${items}</w15:commentsEx>`
    );
    relationships = addMetadataDeclaration(
      relationships,
      '</Relationships>',
      `<Relationship Id="${nextRelationshipId(relationships, 'rIdCommentsExtended')}" Type="http://schemas.microsoft.com/office/2011/relationships/commentsExtended" Target="commentsExtended.xml"/>`
    );
    contentTypes = addMetadataDeclaration(
      contentTypes,
      '</Types>',
      '<Override PartName="/word/commentsExtended.xml" ContentType="application/vnd.ms-word.commentsExtended+xml"/>'
    );
  }
  if (withDurableIds) {
    const items = prepared.comments
      .filter(({ comment }) => comment.durableId)
      .map(
        ({ comment, paragraphId }) =>
          `<w16cid:commentId w16cid:paraId="${paragraphId}" w16cid:durableId="${comment.durableId}"/>`
      )
      .join('');

    zip.file(
      'word/commentsIds.xml',
      `<w16cid:commentsIds xmlns:w16cid="${WORD16_COMMENT_ID_NAMESPACE}">${items}</w16cid:commentsIds>`
    );
    relationships = addMetadataDeclaration(
      relationships,
      '</Relationships>',
      `<Relationship Id="${nextRelationshipId(relationships, 'rIdCommentsIds')}" Type="http://schemas.microsoft.com/office/2016/relationships/commentsIds" Target="commentsIds.xml"/>`
    );
    contentTypes = addMetadataDeclaration(
      contentTypes,
      '</Types>',
      '<Override PartName="/word/commentsIds.xml" ContentType="application/vnd.ms-word.commentsIds+xml"/>'
    );
  }
  zip.file('word/_rels/document.xml.rels', relationships);
  zip.file('[Content_Types].xml', contentTypes);
  const bytes = await zip.generateAsync({ type: 'arraybuffer' });

  throwIfDocxAborted(signal);

  return new Blob([bytes], { type: blob.type });
};
