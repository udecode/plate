/**
 * Barrel file for html-to-docx schemas
 */

export { default as contentTypesXML } from './content-types';
export { default as generateCoreXML } from './core';
export { default as documentRelsXML } from './document-rels';
export {
  default as generateDocumentTemplate,
  type DocumentMargins,
} from './document.template';
export { default as fontTableXML } from './font-table';
export { default as genericRelsXML } from './generic-rels';
export { default as generateNumberingXMLTemplate } from './numbering';
export { default as relsXML } from './rels';
export { default as settingsXML } from './settings';
export { default as generateStylesXML } from './styles';
export { default as generateThemeXML } from './theme';
export { default as webSettingsXML } from './web-settings';
