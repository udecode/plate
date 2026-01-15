/* biome-ignore-all lint: legacy code */
import { applicationName } from '../constants';
import namespaces from '../namespaces';

const generateCoreXML = (
  title = '',
  subject = '',
  creator = applicationName,
  keywords = [applicationName],
  description = '',
  lastModifiedBy = applicationName,
  revision = 1,
  createdAt = new Date(),
  modifiedAt = new Date()
) => `
        <?xml version="1.0" encoding="UTF-8" standalone="yes"?>

        <cp:coreProperties
          xmlns:cp="${namespaces.coreProperties}"
          xmlns:dc="${namespaces.dc}"
          xmlns:dcterms="${namespaces.dcterms}"
          xmlns:dcmitype="${namespaces.dcmitype}"
          xmlns:xsi="${namespaces.xsi}"
          >
            <dc:title>${title}</dc:title>
            <dc:subject>${subject}</dc:subject>
            <dc:creator>${creator}</dc:creator>
            ${
              keywords && Array.isArray(keywords)
                ? `<cp:keywords>${keywords.join(', ')}</cp:keywords>`
                : ''
            }
            <dc:description>${description}</dc:description>
            <cp:lastModifiedBy>${lastModifiedBy}</cp:lastModifiedBy>
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
