/* biome-ignore-all lint: legacy code */
import { applicationName } from '../constants';
import namespaces from '../namespaces';

/**
 * Format a Date as local time with Z suffix.
 * Word uses local time with a trailing 'Z' in dcterms:created/modified
 * (non-standard but expected by the OOXML ecosystem).
 */
function toLocalWithZ(d: Date): string {
  const Y = d.getFullYear();
  const M = String(d.getMonth() + 1).padStart(2, '0');
  const D = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  const s = String(d.getSeconds()).padStart(2, '0');
  return `${Y}-${M}-${D}T${h}:${m}:${s}Z`;
}

const generateCoreXML = (
  title: string = '',
  subject: string = '',
  creator: string = applicationName,
  keywords: string[] = [applicationName],
  description: string = '',
  lastModifiedBy: string = applicationName,
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
                ? toLocalWithZ(createdAt)
                : toLocalWithZ(new Date())
            }</dcterms:created>
            <dcterms:modified xsi:type="dcterms:W3CDTF">${
              modifiedAt instanceof Date
                ? toLocalWithZ(modifiedAt)
                : toLocalWithZ(new Date())
            }</dcterms:modified>
        </cp:coreProperties>
    `;

export default generateCoreXML;
