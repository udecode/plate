import type { Archive } from '../../../classes/src/Archive.ts';
import { UnhandledXmlFile } from '../../../classes/src/XmlFile.ts';
import { FileMime } from '../../../enums.ts';

export class ExtendedPropertiesXml extends UnhandledXmlFile {
	public static override contentType = FileMime.extendedProperties;

	/**
	 * Instantiate this class by looking at the DOCX XML for it.
	 */
	public static override async fromArchive(
		archive: Archive,
		location: string
	): Promise<ExtendedPropertiesXml> {
		return new ExtendedPropertiesXml(
			location,
			await archive.readText(location)
		);
	}
}
