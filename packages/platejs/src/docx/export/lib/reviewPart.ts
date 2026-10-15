import JSZip from 'jszip';

import { throwIfDocxAborted } from '../../internal/abort';
import { parseDocxXml } from '../../internal/domParser';
import {
  REVIEW_PART_NAMESPACE,
  reviewBindingBookmarks,
  reviewBindingFingerprints,
  reviewPackageKeys,
  wordAttribute,
  type ReviewPart,
} from '../../internal/reviewPart';
import type { DocxDiagnostic } from '../../internal/types';
import {
  addMetadataDeclaration,
  createTextTokenReplacer,
  nextRelationshipId,
} from './generatedParts';
import { REVIEW_RUN_NAMESPACE } from './internal/xml-builder';
import {
  REVIEW_TOKEN,
  type DocxRevision,
  type PreparedDocxReview,
  type ReviewRun,
} from './reviewProjection';

const WORD = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
const RELATIONSHIPS =
  'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
const CUSTOM_XML =
  'http://schemas.openxmlformats.org/officeDocument/2006/customXml';
const ITEM_ID = '{3F8A7C52-1D6B-4E29-9C0B-5A4E7D2B9F61}';
const XML_DECLARATION =
  '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';

// The order Word's schema gives a run's properties.
const RUN_PROPERTY_ORDER = [
  'rStyle',
  'rFonts',
  'b',
  'bCs',
  'i',
  'iCs',
  'caps',
  'smallCaps',
  'strike',
  'dstrike',
  'outline',
  'shadow',
  'emboss',
  'imprint',
  'noProof',
  'snapToGrid',
  'vanish',
  'webHidden',
  'color',
  'spacing',
  'w',
  'kern',
  'position',
  'sz',
  'szCs',
  'highlight',
  'u',
  'effect',
  'bdr',
  'shd',
  'fitText',
  'vertAlign',
  'rtl',
  'cs',
  'em',
  'lang',
  'eastAsianLayout',
  'specVanish',
  'oMath',
];

const RUN_PROPERTY_OF_MARK: ReadonlyMap<
  string,
  Readonly<{ name: string; value?: string }>
> = new Map([
  ['bold', { name: 'b' }],
  ['italic', { name: 'i' }],
  ['strikethrough', { name: 'strike' }],
  ['subscript', { name: 'vertAlign', value: 'subscript' }],
  ['superscript', { name: 'vertAlign', value: 'superscript' }],
  ['underline', { name: 'u', value: 'single' }],
]);

const wordElement = (document: Document, name: string) =>
  document.createElementNS(WORD, `w:${name}`);

const revisionElement = (
  document: Document,
  name: string,
  { at, author, id }: DocxRevision
) => {
  const element = wordElement(document, name);

  element.setAttributeNS(WORD, 'w:id', String(id));
  element.setAttributeNS(WORD, 'w:author', author);
  if (at > 0) {
    element.setAttributeNS(WORD, 'w:date', new Date(at).toISOString());
  }

  return element;
};

const insertInOrder = (properties: Element, property: Element) => {
  const rank = RUN_PROPERTY_ORDER.indexOf(property.localName);
  const next = Array.from(properties.children).find(
    (child) => RUN_PROPERTY_ORDER.indexOf(child.localName) > rank
  );

  if (next) next.before(property);
  else properties.append(property);
};

// happy-dom parses prefixed attributes, `xml:space` and `w:val` among them,
// without their namespace, and setAttributeNS refuses a prefix with none.
const copyAttributes = (from: Element, to: Element) => {
  for (const attribute of Array.from(from.attributes)) {
    if (attribute.namespaceURI) {
      to.setAttributeNS(
        attribute.namespaceURI,
        attribute.name,
        attribute.value
      );
    } else {
      to.setAttribute(attribute.name, attribute.value);
    }
  }
};

// A clone keeps the source prefix only in some DOMs, so copy by qualified name.
const copyElement = (element: Element): Element => {
  const copy = element.ownerDocument.createElementNS(
    element.namespaceURI,
    element.tagName
  );

  copyAttributes(element, copy);
  copy.append(...Array.from(element.children).map(copyElement));

  return copy;
};

const previousProperties = (
  properties: Element,
  previous: Readonly<Record<string, unknown>>
) => {
  const before = copyElement(properties);

  for (const [key, value] of Object.entries(previous)) {
    const runProperty = RUN_PROPERTY_OF_MARK.get(key);

    if (!runProperty) continue;
    for (const child of Array.from(before.children)) {
      if (
        child.namespaceURI === WORD &&
        child.localName === runProperty.name &&
        (runProperty.value === undefined ||
          wordAttribute(child, 'val') === runProperty.value)
      ) {
        child.remove();
      }
    }
    if (value !== true) continue;
    const property = wordElement(properties.ownerDocument, runProperty.name);

    if (runProperty.value) {
      property.setAttributeNS(WORD, 'w:val', runProperty.value);
    }
    insertInOrder(before, property);
  }

  return before;
};

const wrap = (inner: Element, wrapper: Element) => {
  inner.replaceWith(wrapper);
  wrapper.append(inner);

  return wrapper;
};

const writeRun = (marker: Element, review: ReviewRun) => {
  const document = marker.ownerDocument;
  const properties = marker.parentElement;
  const run = properties?.parentElement;

  marker.remove();
  if (!(properties && run)) return;
  if (review.format) {
    const change = revisionElement(document, 'rPrChange', review.format);

    change.append(previousProperties(properties, review.format.previous));
    properties.append(change);
  }
  let outer: Element = run;

  if (review.deletion) {
    for (const text of Array.from(run.children)) {
      if (text.namespaceURI !== WORD || text.localName !== 't') continue;
      const deleted = wordElement(document, 'delText');

      copyAttributes(text, deleted);
      deleted.textContent = text.textContent;
      text.replaceWith(deleted);
    }
    outer = wrap(outer, revisionElement(document, 'del', review.deletion));
  }
  for (const insertion of review.insertions.toReversed()) {
    outer = wrap(outer, revisionElement(document, 'ins', insertion));
  }
};

const bookmarkElements = (document: Document, id: string, name: string) => {
  const start = wordElement(document, 'bookmarkStart');
  const end = wordElement(document, 'bookmarkEnd');

  start.setAttributeNS(WORD, 'w:id', id);
  start.setAttributeNS(WORD, 'w:name', name);
  end.setAttributeNS(WORD, 'w:id', id);

  return [start, end] as const;
};

const lostBinding = (index: number): DocxDiagnostic => ({
  code: 'lossy-content',
  feature: 'authored-review',
  message: `The generated document lost the bookmark of review binding ${index + 1}.`,
  severity: 'warning',
});

/**
 * Write each reviewed run's Word revisions, bind each stored block to a
 * bookmark around its rendering, and store the blocks and their records in a
 * custom XML part Word keeps when it saves.
 */
export const addDocxReview = async (
  blob: Blob,
  review: PreparedDocxReview,
  signal?: AbortSignal
): Promise<
  Readonly<{ blob: Blob; diagnostics: readonly DocxDiagnostic[] }>
> => {
  throwIfDocxAborted(signal);
  if (
    review.runs.length === 0 &&
    review.bindings.length === 0 &&
    review.records === undefined
  ) {
    return { blob, diagnostics: [] };
  }
  const zip = await JSZip.loadAsync(await blob.arrayBuffer());

  throwIfDocxAborted(signal);
  const documentFile = zip.file('word/document.xml');
  const relationshipsFile = zip.file('word/_rels/document.xml.rels');
  const contentTypesFile = zip.file('[Content_Types].xml');

  if (!documentFile || !relationshipsFile || !contentTypesFile) {
    throw new Error('Generated DOCX package is missing review owners.');
  }
  const document = parseDocxXml(
    await documentFile.async('string'),
    () => new Error('Generated DOCX XML is invalid.')
  );

  throwIfDocxAborted(signal);
  const elements = Array.from(document.getElementsByTagName('*'));

  for (const marker of elements.filter(
    (element) =>
      element.namespaceURI === REVIEW_RUN_NAMESPACE &&
      element.localName === 'run'
  )) {
    writeRun(marker, review.runs[Number(marker.getAttribute('id'))]);
  }
  const diagnostics: DocxDiagnostic[] = [];
  const replace = createTextTokenReplacer(document, REVIEW_TOKEN);
  const firstBookmarkId =
    Math.max(
      -1,
      ...elements
        .filter(
          (element) =>
            element.namespaceURI === WORD &&
            element.localName === 'bookmarkStart'
        )
        .map((element) => Number(wordAttribute(element, 'id')))
        .filter(Number.isSafeInteger)
    ) + 1;
  const bound = review.bindings.flatMap((binding, index) => {
    const name = `_ReviewBlock${index + 1}`;
    const [start, end] = bookmarkElements(
      document,
      String(firstBookmarkId + index),
      name
    );

    if (!replace(binding.start, [start])) {
      diagnostics.push(lostBinding(index));

      return [];
    }
    if (!replace(binding.end, [end])) {
      start.remove();
      diagnostics.push(lostBinding(index));

      return [];
    }

    return [{ name, nodes: binding.nodes }];
  });
  const parts = new Map(
    await Promise.all(
      Object.values(zip.files)
        .filter((file) => !file.dir)
        .map(
          async (file) => [file.name, await file.async('uint8array')] as const
        )
    )
  );
  const xmlOf = (path: string) => {
    const bytes = parts.get(path);

    return (
      bytes &&
      parseDocxXml(
        new TextDecoder().decode(bytes),
        () => new Error('Generated DOCX XML is invalid.')
      )
    );
  };
  const fingerprints = reviewBindingFingerprints(
    reviewBindingBookmarks(document, new Set(bound.map(({ name }) => name))),
    reviewPackageKeys(
      document,
      {
        numbering: xmlOf('word/numbering.xml'),
        relationships: xmlOf('word/_rels/document.xml.rels'),
        styles: xmlOf('word/styles.xml'),
      },
      (path) => parts.get(path)
    )
  );
  const part: ReviewPart = {
    bindings: bound.map(({ name, nodes }) => ({
      fingerprint: fingerprints.get(name) ?? '',
      name,
      nodes,
    })),
    ...(review.records === undefined ? {} : { records: review.records }),
    version: 1,
  };

  zip.file(
    'word/document.xml',
    new XMLSerializer().serializeToString(document)
  );
  if (part.bindings.length > 0 || part.records !== undefined) {
    let item = 1;

    while (zip.file(`customXml/item${item}.xml`)) item += 1;
    const payload = parseDocxXml(`<review xmlns="${REVIEW_PART_NAMESPACE}"/>`);

    payload.documentElement.textContent = JSON.stringify(part);
    zip.file(
      `customXml/item${item}.xml`,
      `${XML_DECLARATION}${new XMLSerializer().serializeToString(payload)}`
    );
    zip.file(
      `customXml/itemProps${item}.xml`,
      `${XML_DECLARATION}<ds:datastoreItem ds:itemID="${ITEM_ID}" xmlns:ds="${CUSTOM_XML}"><ds:schemaRefs><ds:schemaRef ds:uri="${REVIEW_PART_NAMESPACE}"/></ds:schemaRefs></ds:datastoreItem>`
    );
    zip.file(
      `customXml/_rels/item${item}.xml.rels`,
      `${XML_DECLARATION}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="${RELATIONSHIPS}/customXmlProps" Target="itemProps${item}.xml"/></Relationships>`
    );
    const [relationships, contentTypes] = await Promise.all([
      relationshipsFile.async('string'),
      contentTypesFile.async('string'),
    ]);

    throwIfDocxAborted(signal);
    zip.file(
      'word/_rels/document.xml.rels',
      addMetadataDeclaration(
        relationships,
        '</Relationships>',
        `<Relationship Id="${nextRelationshipId(relationships, 'rIdReview')}" Type="${RELATIONSHIPS}/customXml" Target="../customXml/item${item}.xml"/>`
      )
    );
    zip.file(
      '[Content_Types].xml',
      addMetadataDeclaration(
        contentTypes,
        '</Types>',
        `<Override PartName="/customXml/itemProps${item}.xml" ContentType="application/vnd.openxmlformats-officedocument.customXmlProperties+xml"/>`
      )
    );
  }
  const bytes = await zip.generateAsync({ type: 'arraybuffer' });

  throwIfDocxAborted(signal);

  return {
    blob: new Blob([bytes], { type: blob.type }),
    diagnostics,
  };
};
