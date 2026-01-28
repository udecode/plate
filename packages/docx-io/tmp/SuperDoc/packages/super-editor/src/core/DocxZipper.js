import xmljs from 'xml-js';
import JSZip from 'jszip';
import { getContentTypesFromXml } from './super-converter/helpers.js';

/**
 * Class to handle unzipping and zipping of docx files
 */
class DocxZipper {
  constructor(params = {}) {
    this.debug = params.debug || false;
    this.zip = new JSZip();
    this.files = [];
    this.media = {};
    this.mediaFiles = {};
    this.fonts = {};
  }

  /**
   * Get all docx data from the zipped docx
   *
   * [ContentTypes].xml
   * _rels/.rels
   * word/document.xml
   * word/_rels/document.xml.rels
   * word/footnotes.xml
   * word/endnotes.xml
   * word/header1.xml
   * word/theme/theme1.xml
   * word/settings.xml
   * word/styles.xml
   * word/webSettings.xml
   * word/fontTable.xml
   * docProps/core.xml
   * docProps/app.xml
   * */
  async getDocxData(file, isNode = false) {
    const extractedFiles = await this.unzip(file);
    const files = Object.entries(extractedFiles.files);

    const mediaObjects = {};
    const validTypes = ['xml', 'rels'];
    for (const file of files) {
      const [, zipEntry] = file;

      if (validTypes.some((validType) => zipEntry.name.endsWith(validType))) {
        const content = await zipEntry.async('string');
        this.files.push({
          name: zipEntry.name,
          content,
        });
      } else if (zipEntry.name.startsWith('word/media') && zipEntry.name !== 'word/media/') {
        // If we are in node, we need to convert the buffer to base64
        if (isNode) {
          const buffer = await zipEntry.async('nodebuffer');
          const fileBase64 = buffer.toString('base64');
          mediaObjects[zipEntry.name] = fileBase64;
        }

        // If we are in the browser, we can use the base64 directly
        else {
          const blob = await zipEntry.async('blob');
          const extension = this.getFileExtension(zipEntry.name);
          const fileBase64 = await zipEntry.async('base64');
          this.mediaFiles[zipEntry.name] = `data:image/${extension};base64,${fileBase64}`;

          const file = new File([blob], zipEntry.name, { type: blob.type });
          const imageUrl = URL.createObjectURL(file);
          this.media[zipEntry.name] = imageUrl;
        }
      } else if (zipEntry.name.startsWith('word/fonts') && zipEntry.name !== 'word/fonts/') {
        const uint8array = await zipEntry.async('uint8array');
        this.fonts[zipEntry.name] = uint8array;
      }
    }

    return this.files;
  }

  getFileExtension(fileName) {
    const fileSplit = fileName.split('.');
    if (fileSplit.length < 2) return null;
    return fileSplit[fileSplit.length - 1];
  }

  /**
   * Update [Content_Types].xml with extensions of new Image annotations
   */
  async updateContentTypes(docx, media, fromJson) {
    const newMediaTypes = Object.keys(media)
      .map((name) => {
        return this.getFileExtension(name);
      })
      .filter(Boolean);

    const contentTypesPath = '[Content_Types].xml';
    let contentTypesXml;
    if (fromJson) {
      contentTypesXml = docx.files.find((file) => file.name === contentTypesPath)?.content || '';
    } else contentTypesXml = await docx.file(contentTypesPath).async('string');

    let typesString = '';

    const defaultMediaTypes = getContentTypesFromXml(contentTypesXml);

    // Update media types in content types
    const seenTypes = new Set();
    for (let type of newMediaTypes) {
      // Current extension already presented in Content_Types
      if (defaultMediaTypes.includes(type)) continue;
      if (seenTypes.has(type)) continue;

      const newContentType = `<Default Extension="${type}" ContentType="image/${type}"/>`;
      typesString += newContentType;
      seenTypes.add(type);
    }

    // Update for comments
    const xmlJson = JSON.parse(xmljs.xml2json(contentTypesXml, null, 2));
    const types = xmlJson.elements?.find((el) => el.name === 'Types') || {};

    // Overrides
    const hasComments = types.elements?.some(
      (el) => el.name === 'Override' && el.attributes.PartName === '/word/comments.xml',
    );
    const hasCommentsExtended = types.elements?.some(
      (el) => el.name === 'Override' && el.attributes.PartName === '/word/commentsExtended.xml',
    );
    const hasCommentsIds = types.elements?.some(
      (el) => el.name === 'Override' && el.attributes.PartName === '/word/commentsIds.xml',
    );
    const hasCommentsExtensible = types.elements?.some(
      (el) => el.name === 'Override' && el.attributes.PartName === '/word/commentsExtensible.xml',
    );

    if (docx.files['word/comments.xml']) {
      const commentsDef = `<Override PartName="/word/comments.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.comments+xml" />`;
      if (!hasComments) typesString += commentsDef;
    }

    if (docx.files['word/commentsExtended.xml']) {
      const commentsExtendedDef = `<Override PartName="/word/commentsExtended.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.commentsExtended+xml" />`;
      if (!hasCommentsExtended) typesString += commentsExtendedDef;
    }

    if (docx.files['word/commentsIds.xml']) {
      const commentsIdsDef = `<Override PartName="/word/commentsIds.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.commentsIds+xml" />`;
      if (!hasCommentsIds) typesString += commentsIdsDef;
    }

    if (docx.files['word/commentsExtensible.xml']) {
      const commentsExtendedDef = `<Override PartName="/word/commentsExtensible.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.commentsExtensible+xml" />`;
      if (!hasCommentsExtensible) typesString += commentsExtendedDef;
    }

    Object.keys(docx.files).forEach((name) => {
      // Important: We need to filter out .rels files - they should not be included in content types
      // Otherwise this generates MS word validation error
      if (name.includes('.rels') || (!name.includes('header') && !name.includes('footer'))) return;
      const hasExtensible = types.elements?.some(
        (el) => el.name === 'Override' && el.attributes.PartName === `/${name}`,
      );
      const type = name.includes('header') ? 'header' : 'footer';
      const extendedDef = `<Override PartName="/${name}" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.${type}+xml"/>`;
      if (!hasExtensible) {
        typesString += extendedDef;
      }
    });

    const beginningString = '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">';
    const updatedContentTypesXml = contentTypesXml.replace(beginningString, `${beginningString}${typesString}`);

    if (fromJson) return updatedContentTypesXml;

    docx.file(contentTypesPath, updatedContentTypesXml);
  }

  async unzip(file) {
    const zip = await this.zip.loadAsync(file);
    return zip;
  }

  async updateZip({ docx, updatedDocs, originalDocxFile, media, fonts, isHeadless }) {
    // We use a different re-zip process if we have the original docx vs the docx xml metadata
    let zip;

    if (originalDocxFile) {
      zip = await this.exportFromOriginalFile(originalDocxFile, updatedDocs, media);
    } else {
      zip = await this.exportFromCollaborativeDocx(docx, updatedDocs, media, fonts);
    }

    // If we are headless we don't have 'blob' support, so export as 'nodebuffer'
    const exportType = isHeadless ? 'nodebuffer' : 'blob';
    return await zip.generateAsync({ type: exportType });
  }

  /**
   * Export the Editor content to a docx file, updating changed docs
   * @param {Object} docx An object containing the unzipped docx files (keys are relative file names)
   * @param {Object} updatedDocs An object containing the updated docs (keys are relative file names)
   * @returns {Promise<JSZip>} The unzipped but updated docx file ready for zipping
   */
  async exportFromCollaborativeDocx(docx, updatedDocs, media, fonts) {
    const zip = new JSZip();

    // Rebuild original files
    for (const file of docx) {
      const content = file.content;
      zip.file(file.name, content);
    }

    // Replace updated docs
    Object.keys(updatedDocs).forEach((key) => {
      const content = updatedDocs[key];
      zip.file(key, content);
    });

    Object.keys(media).forEach((name) => {
      const binaryData = Buffer.from(media[name], 'base64');
      zip.file(`word/media/${name}`, binaryData);
    });

    // Export font files
    for (const [fontName, fontUintArray] of Object.entries(fonts)) {
      zip.file(fontName, fontUintArray);
    }

    await this.updateContentTypes(zip, media);
    return zip;
  }

  /**
   * Export the Editor content to a docx file, updating changed docs
   * Requires the original docx file
   * @param {File} originalDocxFile The original docx file
   * @param {Object} updatedDocs An object containing the updated docs (keys are relative file names)
   * @returns {Promise<JSZip>} The unzipped but updated docx file ready for zipping
   */
  async exportFromOriginalFile(originalDocxFile, updatedDocs, media) {
    const unzippedOriginalDocx = await this.unzip(originalDocxFile);
    const filePromises = [];
    unzippedOriginalDocx.forEach((relativePath, zipEntry) => {
      const promise = zipEntry.async('string').then((content) => {
        unzippedOriginalDocx.file(zipEntry.name, content);
      });
      filePromises.push(promise);
    });
    await Promise.all(filePromises);

    // Make replacements of updated docs
    Object.keys(updatedDocs).forEach((key) => {
      unzippedOriginalDocx.file(key, updatedDocs[key]);
    });

    Object.keys(media).forEach((name) => {
      unzippedOriginalDocx.file(`word/media/${name}`, media[name]);
    });

    await this.updateContentTypes(unzippedOriginalDocx, media);

    return unzippedOriginalDocx;
  }
}

export default DocxZipper;
