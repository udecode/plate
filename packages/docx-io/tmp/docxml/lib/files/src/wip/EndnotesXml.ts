import type { Archive } from '../../../classes/src/Archive.ts';
import { UnhandledXmlFile } from '../../../classes/src/XmlFile.ts';
import { FileMime } from '../../../enums.ts';

export class EndnotesXml extends UnhandledXmlFile {
	public static override contentType = FileMime.endnotes;

	/**
	 * Instantiate this class by looking at the DOCX XML for it.
	 */
	public static override async fromArchive(
		archive: Archive,
		location: string
	): Promise<EndnotesXml> {
		return new EndnotesXml(location, await archive.readText(location));
	}
}
