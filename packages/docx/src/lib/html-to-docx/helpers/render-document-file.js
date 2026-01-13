/** biome-ignore-all lint/complexity/useOptionalChain: <explanation> */
import { default as HTMLToVDOM } from 'html-to-vdom';
import imageToBase64 from '../utils/image-to-base64';
import { getImageDimensions } from '../utils/image-dimensions';
import mimeTypes from 'mime-types';
import isVNode from 'virtual-dom/vnode/is-vnode';
import isVText from 'virtual-dom/vnode/is-vtext';
import VNode from 'virtual-dom/vnode/vnode';
import VText from 'virtual-dom/vnode/vtext';
import { fragment } from 'xmlbuilder2';
import { imageType, internalRelationship } from '../constants';
import namespaces from '../namespaces';
import { isValidUrl } from '../utils/url';
import { vNodeHasChildren } from '../utils/vnode';
// FIXME: remove the cyclic dependency
import * as xmlBuilder from './xml-builder';

const convertHTML = HTMLToVDOM({
  VNode,
  VText,
});

export const buildImage = async (
  docxDocumentInstance,
  vNode,
  maximumWidth = null
) => {
  let response = null;
  let base64Uri = null;
  try {
    const imageSource = vNode.properties.src;

    // Skip WebP images - Word doesn't support WebP format
    if (
      imageSource &&
      (imageSource.includes('.webp') || imageSource.includes('image/webp'))
    ) {
      return null;
    }

    if (isValidUrl(imageSource)) {
      const base64String = await imageToBase64(imageSource).catch(() => {});

      if (base64String) {
        // Try to get MIME type from URL extension first
        let mimeType = mimeTypes.lookup(imageSource);

        // Skip WebP images even if detected from extension
        if (mimeType === 'image/webp') {
          return null;
        }

        // If no extension or couldn't determine MIME type, detect from magic bytes
        if (!mimeType) {
          const binaryStr = atob(base64String.substring(0, 16));
          const bytes = new Uint8Array(binaryStr.length);
          for (let i = 0; i < binaryStr.length; i++) {
            bytes[i] = binaryStr.charCodeAt(i);
          }
          // Check magic bytes
          if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
            mimeType = 'image/jpeg';
          } else if (
            bytes[0] === 0x89 &&
            bytes[1] === 0x50 &&
            bytes[2] === 0x4e &&
            bytes[3] === 0x47
          ) {
            mimeType = 'image/png';
          } else if (
            bytes[0] === 0x47 &&
            bytes[1] === 0x49 &&
            bytes[2] === 0x46
          ) {
            mimeType = 'image/gif';
          } else if (
            bytes[0] === 0x52 &&
            bytes[1] === 0x49 &&
            bytes[2] === 0x46 &&
            bytes[3] === 0x46
          ) {
            // WebP detected - skip it as Word doesn't support WebP
            return null;
          } else {
            // Default to JPEG for unknown formats
            mimeType = 'image/jpeg';
          }
        }

        base64Uri = `data:${mimeType};base64,${base64String}`;
      }
    } else {
      base64Uri = decodeURIComponent(vNode.properties.src);
    }
    if (base64Uri) {
      response = docxDocumentInstance.createMediaFile(base64Uri);
    }
  } catch (error) {
    // NOOP
  }
  if (response) {
    docxDocumentInstance.zip
      .folder('word')
      .folder('media')
      .file(
        response.fileNameWithExtension,
        Buffer.from(response.fileContent, 'base64'),
        {
          createFolders: false,
        }
      );

    const documentRelsId = docxDocumentInstance.createDocumentRelationships(
      docxDocumentInstance.relationshipFilename,
      imageType,
      `media/${response.fileNameWithExtension}`,
      internalRelationship
    );

    const imageBuffer = Buffer.from(response.fileContent, 'base64');
    const imageProperties = getImageDimensions(imageBuffer);

    const imageFragment = await xmlBuilder.buildParagraph(
      vNode,
      {
        type: 'picture',
        inlineOrAnchored: true,
        relationshipId: documentRelsId,
        ...response,
        description: vNode.properties.alt,
        maximumWidth:
          maximumWidth || docxDocumentInstance.availableDocumentSpace,
        originalWidth: imageProperties.width,
        originalHeight: imageProperties.height,
      },
      docxDocumentInstance
    );

    return imageFragment;
  }
};

export const buildList = async (vNode, docxDocumentInstance, xmlFragment) => {
  const listElements = [];

  let vNodeObjects = [
    {
      node: vNode,
      level: 0,
      type: vNode.tagName,
      numberingId: docxDocumentInstance.createNumbering(
        vNode.tagName,
        vNode.properties
      ),
    },
  ];
  while (vNodeObjects.length) {
    const tempVNodeObject = vNodeObjects.shift();

    if (
      isVText(tempVNodeObject.node) ||
      (isVNode(tempVNodeObject.node) &&
        !['ul', 'ol', 'li'].includes(tempVNodeObject.node.tagName))
    ) {
      const paragraphFragment = await xmlBuilder.buildParagraph(
        tempVNodeObject.node,
        {
          numbering: {
            levelId: tempVNodeObject.level,
            numberingId: tempVNodeObject.numberingId,
          },
        },
        docxDocumentInstance
      );

      xmlFragment.import(paragraphFragment);
    }

    if (
      tempVNodeObject.node.children &&
      tempVNodeObject.node.children.length &&
      ['ul', 'ol', 'li'].includes(tempVNodeObject.node.tagName)
    ) {
      const tempVNodeObjects = tempVNodeObject.node.children.reduce(
        (accumulator, childVNode) => {
          if (['ul', 'ol'].includes(childVNode.tagName)) {
            accumulator.push({
              node: childVNode,
              level: tempVNodeObject.level + 1,
              type: childVNode.tagName,
              numberingId: docxDocumentInstance.createNumbering(
                childVNode.tagName,
                childVNode.properties
              ),
            });
          } else if (
            accumulator.length > 0 &&
            isVNode(accumulator[accumulator.length - 1].node) &&
            accumulator[accumulator.length - 1].node.tagName.toLowerCase() ===
              'p'
          ) {
            accumulator[accumulator.length - 1].node.children.push(childVNode);
          } else {
            const paragraphVNode = new VNode(
              'p',
              null,

              isVText(childVNode)
                ? [childVNode]
                : isVNode(childVNode)
                  ? childVNode.tagName.toLowerCase() === 'li'
                    ? [...childVNode.children]
                    : [childVNode]
                  : []
            );
            accumulator.push({
              // eslint-disable-next-line prettier/prettier
              node: isVNode(childVNode)
                ? // eslint-disable-next-line prettier/prettier
                  childVNode.tagName.toLowerCase() === 'li'
                  ? childVNode
                  : childVNode.tagName.toLowerCase() !== 'p'
                    ? paragraphVNode
                    : childVNode
                : // eslint-disable-next-line prettier/prettier
                  paragraphVNode,
              level: tempVNodeObject.level,
              type: tempVNodeObject.type,
              numberingId: tempVNodeObject.numberingId,
            });
          }

          return accumulator;
        },
        []
      );
      vNodeObjects = tempVNodeObjects.concat(vNodeObjects);
    }
  }

  return listElements;
};

async function findXMLEquivalent(docxDocumentInstance, vNode, xmlFragment) {
  if (
    vNode.tagName === 'div' &&
    (vNode.properties.attributes.class === 'page-break' ||
      (vNode.properties.style && vNode.properties.style['page-break-after']))
  ) {
    const paragraphFragment = fragment({ namespaceAlias: { w: namespaces.w } })
      .ele('@w', 'p')
      .ele('@w', 'r')
      .ele('@w', 'br')
      .att('@w', 'type', 'page')
      .up()
      .up()
      .up();

    xmlFragment.import(paragraphFragment);
    return;
  }

  switch (vNode.tagName) {
    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'h5':
    case 'h6': {
      // Check if the heading has a bookmark anchor (an <a> with id but no href)
      let bookmarkId = null;
      let headingVNode = vNode;
      if (vNodeHasChildren(vNode) && vNode.children.length > 0) {
        const firstChild = vNode.children[0];
        // Check both properties.id and properties.attributes.id for the bookmark anchor
        const anchorId =
          firstChild.properties?.id || firstChild.properties?.attributes?.id;
        const hasHref =
          firstChild.properties?.href ||
          firstChild.properties?.attributes?.href;

        if (
          isVNode(firstChild) &&
          firstChild.tagName === 'a' &&
          anchorId &&
          !hasHref
        ) {
          bookmarkId = anchorId;
          // Create a modified vNode without the bookmark anchor
          headingVNode = new VNode(
            vNode.tagName,
            vNode.properties,
            vNode.children.slice(1)
          );
        }
      }

      const headingFragment = await xmlBuilder.buildParagraph(
        headingVNode,
        {
          paragraphStyle: `Heading${vNode.tagName[1]}`,
          bookmarkId,
        },
        docxDocumentInstance
      );
      xmlFragment.import(headingFragment);
      return;
    }
    case 'span':
    case 'strong':
    case 'b':
    case 'em':
    case 'i':
    case 'u':
    case 'ins':
    case 'strike':
    case 'del':
    case 's':
    case 'sub':
    case 'sup':
    case 'mark':
    case 'p': {
      // Check if paragraph contains list children (ul/ol)
      // If so, process them separately as lists
      if (vNodeHasChildren(vNode)) {
        const listChildren = vNode.children.filter(
          (child) => isVNode(child) && ['ul', 'ol'].includes(child.tagName)
        );
        if (listChildren.length > 0) {
          // Process non-list children as paragraph content first
          const nonListChildren = vNode.children.filter(
            (child) => !isVNode(child) || !['ul', 'ol'].includes(child.tagName)
          );
          if (nonListChildren.length > 0) {
            const modifiedVNode = new VNode(
              vNode.tagName,
              vNode.properties,
              nonListChildren
            );
            const paragraphFragment = await xmlBuilder.buildParagraph(
              modifiedVNode,
              {},
              docxDocumentInstance
            );
            xmlFragment.import(paragraphFragment);
          }
          // Process list children separately
          for (const listChild of listChildren) {
            await buildList(listChild, docxDocumentInstance, xmlFragment);
          }
          return;
        }
      }
      const paragraphFragment = await xmlBuilder.buildParagraph(
        vNode,
        {},
        docxDocumentInstance
      );
      xmlFragment.import(paragraphFragment);
      return;
    }
    case 'a':
    case 'blockquote':
    case 'code':
    case 'pre': {
      const paragraphFragment = await xmlBuilder.buildParagraph(
        vNode,
        {},
        docxDocumentInstance
      );
      xmlFragment.import(paragraphFragment);
      return;
    }
    case 'figure':
      if (vNodeHasChildren(vNode)) {
        for (let index = 0; index < vNode.children.length; index++) {
          const childVNode = vNode.children[index];
          if (childVNode.tagName === 'table') {
            const tableFragment = await xmlBuilder.buildTable(
              childVNode,
              {
                maximumWidth: docxDocumentInstance.availableDocumentSpace,
                rowCantSplit: docxDocumentInstance.tableRowCantSplit,
              },
              docxDocumentInstance
            );
            xmlFragment.import(tableFragment);
            // Adding empty paragraph for space after table
            const emptyParagraphFragment = await xmlBuilder.buildParagraph(
              null,
              {}
            );
            xmlFragment.import(emptyParagraphFragment);
          } else if (childVNode.tagName === 'img') {
            const imageFragment = await buildImage(
              docxDocumentInstance,
              childVNode
            );
            if (imageFragment) {
              xmlFragment.import(imageFragment);
            }
          }
        }
      }
      return;
    case 'table': {
      const tableFragment = await xmlBuilder.buildTable(
        vNode,
        {
          maximumWidth: docxDocumentInstance.availableDocumentSpace,
          rowCantSplit: docxDocumentInstance.tableRowCantSplit,
        },
        docxDocumentInstance
      );
      xmlFragment.import(tableFragment);
      // Adding empty paragraph for space after table
      const emptyParagraphFragment = await xmlBuilder.buildParagraph(null, {});
      xmlFragment.import(emptyParagraphFragment);
      return;
    }
    case 'ol':
    case 'ul':
      await buildList(vNode, docxDocumentInstance, xmlFragment);
      return;
    case 'img': {
      const imageFragment = await buildImage(docxDocumentInstance, vNode);
      if (imageFragment) {
        xmlFragment.import(imageFragment);
      }
      return;
    }
    case 'br': {
      const linebreakFragment = await xmlBuilder.buildParagraph(null, {});
      xmlFragment.import(linebreakFragment);
      return;
    }
    case 'head':
      return;
  }
  if (vNodeHasChildren(vNode)) {
    for (let index = 0; index < vNode.children.length; index++) {
      const childVNode = vNode.children[index];

      await convertVTreeToXML(docxDocumentInstance, childVNode, xmlFragment);
    }
  }
}

export async function convertVTreeToXML(
  docxDocumentInstance,
  vTree,
  xmlFragment
) {
  if (!vTree) {
    return '';
  }
  if (Array.isArray(vTree) && vTree.length) {
    for (let index = 0; index < vTree.length; index++) {
      const vNode = vTree[index];
      await convertVTreeToXML(docxDocumentInstance, vNode, xmlFragment);
    }
  } else if (isVNode(vTree)) {
    await findXMLEquivalent(docxDocumentInstance, vTree, xmlFragment);
  } else if (isVText(vTree)) {
    const paragraphFragment = await xmlBuilder.buildParagraph(
      vTree,
      {},
      docxDocumentInstance
    );
    xmlFragment.import(paragraphFragment);
  }
  return xmlFragment;
}

async function renderDocumentFile(docxDocumentInstance) {
  const vTree = convertHTML(docxDocumentInstance.htmlString);

  const xmlFragment = fragment({ namespaceAlias: { w: namespaces.w } });

  const populatedXmlFragment = await convertVTreeToXML(
    docxDocumentInstance,
    vTree,
    xmlFragment
  );

  return populatedXmlFragment;
}

export default renderDocumentFile;
