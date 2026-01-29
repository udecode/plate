import { FileMime } from '../../enums.ts';
import type { ContentTypesXml } from '../../files/src/ContentTypesXml.ts';
import { parse } from '../../utilities/src/dom.ts';
import type { Archive } from './Archive.ts';
import type { BinaryFile } from './BinaryFile.ts';

abstract class XmlFileBase {
	public static readonly contentType: FileMime = FileMime.xml;

	public readonly location: string;

	protected constructor(location: string) {
		this.location = location;
	}

	public get contentType(): FileMime {
		return (this.constructor as typeof XmlFileBase).contentType;
	}

	/**
	 * Create a (slimdom) Document DOM for this XML file. This is useful for serializing it to string
	 * and writing to a ZIP/DOCX archive later.
	 */
	protected toNode(): Document | Promise<Document> {
		throw new Error(`${this.constructor.name}#toNode() is not implemented`);
	}

	/**
	 * @deprecated FOR TEST PURPOSES ONLY
	 */
	public $$$toNode(): Document | Promise<Document> {
		return this.toNode();
	}

	/**
	 * Get all XmlFile instances related to this one, including self. This helps the system
	 * serialize itself back to DOCX fullly. Probably not useful for consumers of the library.
	 *
	 * By default only returns the instance itself but no other related instances.
	 */
	public getRelated(): Array<XmlFileBase | BinaryFile> {
		return [this];
	}

	/**
	 * Let a file tell the system when it is effectively empty, so it can be omitted from the archive.
	 */
	public isEmpty(): boolean {
		return false;
	}

	/**
	 * Add all related files to the given archive.
	 */
	public async addToArchive(archive: Archive): Promise<void> {
		await Promise.all(
			this.getRelated().map(async (related) => {
				if (related instanceof XmlFileBase) {
					archive.addXmlFile(
						related.location,
						await related.toNode()
					);
				} else {
					related.addToArchive(archive);
				}
			})
		);
	}
}

export class XmlFile extends XmlFileBase {
	/**
	 * Promise a new JS instance of this file based on the given archive.
	 */
	public static fromArchive(
		_archive: Archive,
		location: string
	): Promise<XmlFile> {
		return Promise.resolve(new XmlFile(location));
	}
}

export class UnhandledXmlFile extends XmlFile {
	#xml: string;

	protected constructor(location: string, xml: string) {
		super(location);
		this.#xml = xml;
	}

	protected override toNode(): Document {
		return parse(this.#xml);
	}

	public static override async fromArchive(
		archive: Archive,
		location: string
	) {
		return new UnhandledXmlFile(location, await archive.readText(location));
	}
}

export class XmlFileWithContentTypes extends XmlFileBase {
	public static fromArchive(
		_archive: Archive,
		_contentTypes: ContentTypesXml,
		location: string
	): Promise<XmlFile> {
		return Promise.resolve(new XmlFile(location));
	}
}
