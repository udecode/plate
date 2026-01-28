import type { ContentTypesXml } from '../../../mod.ts';
import type { FileMime } from '../../enums.ts';
import type { File } from '../../files/src/RelationshipsXml.ts';
import type { Archive } from './Archive.ts';

type BinaryFileReader = () => Promise<Uint8Array>;

/**
 * A utility class that represents a binary file inside the DOCX archive -- currently used for
 * images.
 */
export class BinaryFile {
	public readonly location: string;
	public mime: FileMime;

	readonly #reader: BinaryFileReader;

	protected constructor(
		location: string,
		reader: BinaryFileReader,
		mime: FileMime
	) {
		this.location = location;
		this.mime = mime;
		this.#reader = reader;
	}

	/**
	 * Get all XmlFile instances related to this one, including self. This helps the system
	 * serialize itself back to DOCX fullly. Probably not useful for consumers of the library.
	 *
	 * By default only returns the instance itself but no other related instances.
	 */
	public getRelated(): File[] {
		return [this];
	}

	public get contentType(): Promise<FileMime> {
		return Promise.resolve(this.mime);
	}

	/**
	 * Let a file tell the system when it is effectively empty, so it can be omitted from the archive.
	 */
	public isEmpty(): boolean {
		return false;
	}

	public static fromArchive(
		archive: Archive,
		contentTypes: ContentTypesXml,
		location: string
	): BinaryFile {
		const mime = contentTypes.getType(location);
		if (mime === undefined) {
			throw new Error(
				'Error creating BinaryFile from Archive. No matching content type found in ContentTypesXml'
			);
		}

		return new BinaryFile(
			location,
			() => archive.readBinary(location),
			mime
		);
	}

	public static fromDisk(
		diskLocation: string,
		location: string,
		mime: FileMime
	): BinaryFile {
		return new BinaryFile(
			location,
			() => Deno.readFile(diskLocation),
			mime
		);
	}

	public static fromData(
		data: Uint8Array | Promise<Uint8Array>,
		location: string,
		mime: FileMime
	): BinaryFile {
		return new BinaryFile(location, () => Promise.resolve(data), mime);
	}

	public toUint8Array(): Promise<Uint8Array> {
		return this.#reader();
	}

	/**
	 * Add all related files to the given archive.
	 */
	public addToArchive(archive: Archive): void {
		archive.addBinaryFile(this.location, this.toUint8Array());
	}
}
