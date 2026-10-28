import { escapeXml } from '../escape-xml';
import namespaces from '../namespaces';

const generateCoreXML = (
  title: string = '',
  subject: string = '',
  creator: string = '',
  keywords: string[] = [],
  description: string = '',
  lastModifiedBy: string = '',
  revision: number = 1,
  createdAt: Date = new Date(),
  modifiedAt: Date = new Date()
): string => `
        <?xml version="1.0" encoding="UTF-8" standalone="yes"?>

        <cp:coreProperties
          xmlns:cp="${namespaces.coreProperties}"
          xmlns:dc="${namespaces.dc}"
          xmlns:dcterms="${namespaces.dcterms}"
          xmlns:dcmitype="${namespaces.dcmitype}"
          xmlns:xsi="${namespaces.xsi}"
          >
            <dc:title>${escapeXml(title)}</dc:title>
            <dc:subject>${escapeXml(subject)}</dc:subject>
            <dc:creator>${escapeXml(creator)}</dc:creator>
            ${
              keywords && Array.isArray(keywords)
                ? `<cp:keywords>${escapeXml(keywords.join(', '))}</cp:keywords>`
                : ''
            }
            <dc:description>${escapeXml(description)}</dc:description>
            <cp:lastModifiedBy>${escapeXml(lastModifiedBy)}</cp:lastModifiedBy>
            <cp:revision>${revision}</cp:revision>
            <dcterms:created xsi:type="dcterms:W3CDTF">${
              createdAt instanceof Date
                ? createdAt.toISOString()
                : new Date().toISOString()
            }</dcterms:created>
            <dcterms:modified xsi:type="dcterms:W3CDTF">${
              modifiedAt instanceof Date
                ? modifiedAt.toISOString()
                : new Date().toISOString()
            }</dcterms:modified>
        </cp:coreProperties>
    `;

export default generateCoreXML;
