/* biome-ignore-all lint: legacy code */
import { decode } from 'html-entities';
// eslint-disable-next-line import/no-named-default
import { default as HTMLToVDOM } from 'html-to-vdom';
import VNode from 'virtual-dom/vnode/vnode';
import VText from 'virtual-dom/vnode/vtext';
import { create } from 'xmlbuilder2';
import {
  defaultDocumentOptions,
  defaultHTMLString,
  documentFileName,
  footerFileName,
  footerType,
  headerFileName,
  headerType,
  internalRelationship,
  relsFolderName,
  themeFileName,
  themeFolder,
  themeType,
  wordFolder,
} from './constants';
import DocxDocument from './docx-document';
import { renderDocumentFile } from './helpers';
import { relsXML } from './schemas';
import {
  cmRegex,
  cmToTWIP,
  inchRegex,
  inchToTWIP,
  pixelRegex,
  pixelToTWIP,
  pointRegex,
  pointToHIP,
} from './utils/unit-conversion';

const convertHTML = HTMLToVDOM({
  VNode,
  VText,
});

const mergeOptions = (options, patch) => ({ ...options, ...patch });

const fixupFontSize = (fontSize) => {
  let normalizedFontSize;
  if (pointRegex.test(fontSize)) {
    const matchedParts = fontSize.match(pointRegex);

    normalizedFontSize = pointToHIP(matchedParts[1]);
  } else if (fontSize) {
    // assuming it is already in HIP
    normalizedFontSize = fontSize;
  } else {
    normalizedFontSize = null;
  }

  return normalizedFontSize;
};

const normalizeUnits = (dimensioningObject, defaultDimensionsProperty) => {
  let normalizedUnitResult = {};
  if (typeof dimensioningObject === 'object' && dimensioningObject !== null) {
    Object.keys(dimensioningObject).forEach((key) => {
      if (pixelRegex.test(dimensioningObject[key])) {
        const matchedParts = dimensioningObject[key].match(pixelRegex);
        normalizedUnitResult[key] = pixelToTWIP(matchedParts[1]);
      } else if (cmRegex.test(dimensioningObject[key])) {
        const matchedParts = dimensioningObject[key].match(cmRegex);
        normalizedUnitResult[key] = cmToTWIP(matchedParts[1]);
      } else if (inchRegex.test(dimensioningObject[key])) {
        const matchedParts = dimensioningObject[key].match(inchRegex);
        normalizedUnitResult[key] = inchToTWIP(matchedParts[1]);
      } else if (dimensioningObject[key]) {
        normalizedUnitResult[key] = dimensioningObject[key];
      } else {
        // incase value is something like 0
        normalizedUnitResult[key] = defaultDimensionsProperty[key];
      }
    });
  } else {
    // eslint-disable-next-line no-param-reassign
    normalizedUnitResult = null;
  }

  return normalizedUnitResult;
};

const normalizeDocumentOptions = (documentOptions) => {
  const normalizedDocumentOptions = { ...documentOptions };
  Object.keys(documentOptions).forEach((key) => {
    // eslint-disable-next-line default-case
    switch (key) {
      case 'pageSize':
      case 'margins':
        normalizedDocumentOptions[key] = normalizeUnits(
          documentOptions[key],
          defaultDocumentOptions[key]
        );
        break;
      case 'fontSize':
      case 'complexScriptFontSize':
        normalizedDocumentOptions[key] = fixupFontSize(documentOptions[key]);
        break;
    }
  });

  return normalizedDocumentOptions;
};

// Ref: https://en.wikipedia.org/wiki/Office_Open_XML_file_formats
// http://officeopenxml.com/anatomyofOOXML.php
async function addFilesToContainer(
  zip,
  htmlString,
  suppliedDocumentOptions,
  headerHTMLString,
  footerHTMLString
) {
  const normalizedDocumentOptions = normalizeDocumentOptions(
    suppliedDocumentOptions
  );
  const documentOptions = mergeOptions(
    defaultDocumentOptions,
    normalizedDocumentOptions
  );

  if (documentOptions.header && !headerHTMLString) {
    // eslint-disable-next-line no-param-reassign
    headerHTMLString = defaultHTMLString;
  }
  if (documentOptions.footer && !footerHTMLString) {
    // eslint-disable-next-line no-param-reassign
    footerHTMLString = defaultHTMLString;
  }
  if (documentOptions.decodeUnicode) {
    headerHTMLString = decode(headerHTMLString); // eslint-disable-line no-param-reassign
    htmlString = decode(htmlString); // eslint-disable-line no-param-reassign
    footerHTMLString = decode(footerHTMLString); // eslint-disable-line no-param-reassign
  }

  const docxDocument = new DocxDocument({
    zip,
    htmlString,
    ...documentOptions,
  });
  // Conversion to Word XML happens here
  docxDocument.documentXML = await renderDocumentFile(docxDocument);

  zip.folder(relsFolderName).file(
    '.rels',
    create({ encoding: 'UTF-8', standalone: true }, relsXML).toString({
      prettyPrint: true,
    }),
    { createFolders: false }
  );

  zip.folder('docProps').file('core.xml', docxDocument.generateCoreXML(), {
    createFolders: false,
  });

  if (docxDocument.header && headerHTMLString) {
    const vTree = convertHTML(headerHTMLString);

    docxDocument.relationshipFilename = headerFileName;
    const { headerId, headerXML } = await docxDocument.generateHeaderXML(vTree);
    docxDocument.relationshipFilename = documentFileName;
    const fileNameWithExt = `${headerType}${headerId}.xml`;

    const relationshipId = docxDocument.createDocumentRelationships(
      docxDocument.relationshipFilename,
      headerType,
      fileNameWithExt,
      internalRelationship
    );

    zip
      .folder(wordFolder)
      .file(fileNameWithExt, headerXML.toString({ prettyPrint: true }), {
        createFolders: false,
      });

    docxDocument.headerObjects.push({
      headerId,
      relationshipId,
      type: docxDocument.headerType,
    });
  }
  if (docxDocument.footer && footerHTMLString) {
    const vTree = convertHTML(footerHTMLString);

    docxDocument.relationshipFilename = footerFileName;
    const { footerId, footerXML } = await docxDocument.generateFooterXML(vTree);
    docxDocument.relationshipFilename = documentFileName;
    const fileNameWithExt = `${footerType}${footerId}.xml`;

    const relationshipId = docxDocument.createDocumentRelationships(
      docxDocument.relationshipFilename,
      footerType,
      fileNameWithExt,
      internalRelationship
    );

    zip
      .folder(wordFolder)
      .file(fileNameWithExt, footerXML.toString({ prettyPrint: true }), {
        createFolders: false,
      });

    docxDocument.footerObjects.push({
      footerId,
      relationshipId,
      type: docxDocument.footerType,
    });
  }
  const themeFileNameWithExt = `${themeFileName}.xml`;
  docxDocument.createDocumentRelationships(
    docxDocument.relationshipFilename,
    themeType,
    `${themeFolder}/${themeFileNameWithExt}`,
    internalRelationship
  );
  zip
    .folder(wordFolder)
    .folder(themeFolder)
    .file(themeFileNameWithExt, docxDocument.generateThemeXML(), {
      createFolders: false,
    });

  zip
    .folder(wordFolder)
    .file('document.xml', docxDocument.generateDocumentXML(), {
      createFolders: false,
    })
    .file('fontTable.xml', docxDocument.generateFontTableXML(), {
      createFolders: false,
    })
    .file('styles.xml', docxDocument.generateStylesXML(), {
      createFolders: false,
    })
    .file('numbering.xml', docxDocument.generateNumberingXML(), {
      createFolders: false,
    })
    .file('settings.xml', docxDocument.generateSettingsXML(), {
      createFolders: false,
    })
    .file('webSettings.xml', docxDocument.generateWebSettingsXML(), {
      createFolders: false,
    });

  const relationshipXMLs = docxDocument.generateRelsXML();
  if (relationshipXMLs && Array.isArray(relationshipXMLs)) {
    relationshipXMLs.forEach(({ fileName, xmlString }) => {
      zip
        .folder(wordFolder)
        .folder(relsFolderName)
        .file(`${fileName}.xml.rels`, xmlString, {
          createFolders: false,
        });
    });
  }

  zip.file('[Content_Types].xml', docxDocument.generateContentTypesXML(), {
    createFolders: false,
  });

  return zip;
}

export default addFilesToContainer;
