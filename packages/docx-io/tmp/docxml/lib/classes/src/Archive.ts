import JSZip from 'jszip';

import { parse, serialize } from '../../utilities/src/dom.ts';

export class Archive {
	readonly location?: string;
	readonly #files: Record<string, Uint8Array> = {};
	readonly #promises: { location: string; promise: Promise<Uint8Array> }[] =
		[];

	constructor(files?: Record<string, Uint8Array>) {
		if (files) {
			for (const [k, v] of Object.entries(files)) {
				this.#files[k] = v;
			}
		}
	}

	get $$$fileNames(): Record<string, Uint8Array> {
		return this.#files;
	}

	hasFile(location: string): boolean {
		return location in this.#files;
	}

	readText(location: string): Promise<string> {
		const data = this.#files[location];
		if (!data) {
			throw new Error(`File not found: ${location}`);
		}
		return Promise.resolve(new TextDecoder().decode(data));
	}

	async readXml(location: string): Promise<Document> {
		return parse(await this.readText(location));
	}

	readBinary(location: string): Promise<Uint8Array> {
		const data = this.#files[location];
		if (!data) {
			throw new Error(`File not found: ${location}`);
		}
		return Promise.resolve(data);
	}

	addTextFile(location: string, contents: string): this {
		this.#files[location] = new TextEncoder().encode(contents);
		return this;
	}

	addXmlFile(location: string, node: Node | Document): this {
		return this.addTextFile(
			location,
			`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>${serialize(
				node
			)}`
		);
	}

	addJsonFile(location: string, js: unknown): this {
		return this.addTextFile(location, JSON.stringify(js, null, '\t'));
	}

	addBinaryFile(location: string, promised: Promise<Uint8Array>): this {
		this.#promises.push({ location, promise: promised });
		return this;
	}

	async asUint8Array(): Promise<Uint8Array> {
		for await (const { location, promise } of this.#promises) {
			this.#files[location] = await promise;
		}

		const zip = new JSZip();
		for (const [name, data] of Object.entries(this.#files)) {
			zip.file(name, data);
		}
		return zip.generateAsync({ type: 'uint8array' });
	}

	static async fromUInt8Array(data: Uint8Array): Promise<Archive> {
		const zip = await JSZip.loadAsync(data);
		const files: Record<string, Uint8Array> = {};
		const promises: Promise<void>[] = [];

		zip.forEach((path, file) => {
			if (!file.dir) {
				const p = file.async('uint8array').then((contents) => {
					files[path] = contents;
				});
				promises.push(p);
			}
		});

		await Promise.all(promises);
		return new Archive(files);
	}

	static async fromFile(location: string): Promise<Archive> {
		const data = await Deno.readFile(location);
		return Archive.fromUInt8Array(data);
	}

	async toFile(location: string): Promise<void> {
		await Deno.writeFile(location, await this.asUint8Array());
	}
}
