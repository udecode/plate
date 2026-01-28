import { basename, dirname } from '@util-path';

import type { Archive } from '../../classes/src/Archive.ts';
import type { Component } from '../../classes/src/Component.ts';
import { NumberMap } from '../../classes/src/NumberMap.ts';
import { XmlFileWithContentTypes } from '../../classes/src/XmlFile.ts';
import { FootnoteAnchor } from '../../components/document/src/FootnoteAnchor.ts';
import { FootnoteContinuationSeparator } from '../../components/document/src/FootnoteContinuationSeparator.ts';
import '../../components/document/src/FootnoteReference.ts';
import { FootnoteSeparator } from '../../components/document/src/FootnoteSeparator.ts';
import { Image } from '../../components/document/src/Image.ts';
import { Paragraph } from '../../components/document/src/Paragraph.ts';
import { Table } from '../../components/document/src/Table.ts';
import { Text } from '../../components/document/src/Text.ts';
import { FileMime } from '../../enums.ts';
import { create } from '../../utilities/src/dom.ts';
import {
	ALL_NAMESPACE_DECLARATIONS,
	QNS,
} from '../../utilities/src/namespaces.ts';
import { evaluateXPathToArray } from '../../utilities/src/xquery.ts';
import type { ContentTypesXml } from './ContentTypesXml.ts';
import { type File, RelationshipsXml } from './RelationshipsXml.ts';

export type FootnoteSeparatorType =
	| 'separator'
	| 'continuationSeparator'
	| 'normal';

export type FootnoteChild = Paragraph | Table;

/**
 * A type describing a footnote.
 */
export type Footnote = {
	id: number;
	content: FootnoteChild[];
	type: FootnoteSeparatorType;
	style?: string;
};

export class FootnotesXml extends XmlFileWithContentTypes {
	public static override contentType = FileMime.footnotes;

	#footnotes = new NumberMap<Footnote>(1);

	public readonly relationships: RelationshipsXml;

	public constructor(
		location: string,
		relationships: RelationshipsXml = new RelationshipsXml(
			`${dirname(location)}/_rels/${basename(location)}.rels`
		)
	) {
		super(location);
		this.relationships = relationships;
	}

	public override isEmpty(): boolean {
		return !this.#footnotes.size;
	}

	/**
	 * Adds a footnote to a document.
	 * @param content A `Paragraph` or array of `Paragraph` objects that comprise the content.
	 * @param style The style used for the reference mark in the body text.
	 * @returns The identifier of the new footnote.
	 */
	public async add(
		content: FootnoteChild | FootnoteChild[],
		style: string
	): Promise<number> {
		const id = this.#footnotes.getNextAvailableKey();

		const contentArray = Array.isArray(content) ? content : [content];

		// Get all descendant images and register them.
		for await (const image of findDescendantImages(contentArray)) {
			await image.ensureRelationship(this.relationships);
		}

		this.#footnotes.set(id, {
			id,
			content: contentArray,
			type: 'normal',
			style,
		});
		return id;
	}

	/**
	 * Get all XmlFile instances related to this one, including self. This helps the system
	 * serialize itself back to DOCX fullly. Probably not useful for consumers of the library.
	 *
	 * By default only returns the instance itself but no other related instances.
	 */
	public override getRelated(): File[] {
		return [this, ...this.relationships.getRelated()];
	}

	/**
	 *
	 *  Creates an OOXML representation of the FootnotesXml.
	 */
	protected override async toNode(): Promise<Document> {
		const originalFootnotes = [...this.#footnotes.array()];

		// Add the two separator footnotes. Required by MSWord.
		originalFootnotes.unshift(
			{
				type: 'separator',
				id: -1,
				content: [
					new Paragraph({}, new Text({}, new FootnoteSeparator({}))),
				],
			},
			{
				type: 'continuationSeparator',
				id: 0,
				content: [
					new Paragraph(
						{},
						new Text({}, new FootnoteContinuationSeparator({}))
					),
				],
			}
		);

		const footnotes = await Promise.all(
			originalFootnotes.map(async (footnote) => {
				if (
					footnote.type === 'separator' ||
					footnote.type === 'continuationSeparator'
				) {
					return {
						...footnote,
						content: await Promise.all(
							footnote.content.map(
								async (n) => await n.toNode([])
							)
						),
					};
				}

				if (!footnote.content.length) {
					// No content, just push a new paragraph.
					footnote.content.push(
						new Paragraph(
							{},
							new FootnoteAnchor({
								style: footnote.style,
							})
						)
					);
				} else {
					// There's some content, but we only care about the very first node.
					const [firstNode] = footnote.content;

					// The first node is a paragraph.
					if (firstNode instanceof Paragraph) {
						// Check if the first child node is an image.
						const [text] = firstNode.children;
						const [imageOrText] = text
							? text.children
							: [undefined];
						if (imageOrText && imageOrText instanceof Image) {
							// The first child is an image. Insert the anchor in a new paragraph.
							// This is what MSWord does by default.
							footnote.content.unshift(
								new Paragraph(
									{},
									new FootnoteAnchor({
										style: footnote.style,
									})
								)
							);
						} else {
							if (
								imageOrText &&
								typeof imageOrText === 'string'
							) {
								text.children[0] = ' '.concat(imageOrText);
							}
							firstNode.children.unshift(
								new FootnoteAnchor({
									style: footnote.style,
								})
							);
						}
					}

					// The first node is a table. Add a new paragraph with the anchor.
					if (firstNode instanceof Table) {
						footnote.content.unshift(
							new Paragraph(
								{},
								new FootnoteAnchor({
									style: footnote.style,
								})
							)
						);
					}
				}

				return {
					...footnote,
					content: await Promise.all(
						footnote.content.map(
							async (node) => await node.toNode([])
						)
					),
				};
			})
		);

		const document = create(
			`
			<w:footnotes ${ALL_NAMESPACE_DECLARATIONS}>
				{ for $footnote in array:flatten($footnotes)
				 	let $content := 
						switch ($footnote('type'))
						case 'separator' return (
							attribute w:type { 'separator' },
							$footnote('content')
						)
						case 'continuationSeparator' return (
							attribute w:type { 'continuationSeparator' },
							$footnote('content')
						)
						default return (
							$footnote('content')
						) 
					return (
						element w:footnote {  
							attribute w:id { $footnote('id') }, 
							$content 
						} 
					)
				} 
			</w:footnotes>`,
			{
				// In Word, footnotes with IDs -1 and 0 are reserved for the elements that visually separate the footnotes
				// from the regular flow of content. We generate those here.
				footnotes,
			},
			true
		);

		return document;
	}

	/**
	 * Instantiate this class by looking at the DOCX XML for it.
	 */
	public static override async fromArchive(
		archive: Archive,
		contentTypes: ContentTypesXml,
		location: string
	): Promise<FootnotesXml> {
		const relsLocation = `${dirname(location)}/_rels/${basename(location)}`;
		const inst = new this(location);
		if (archive.hasFile(relsLocation)) {
			const relsDom = await archive.readXml(location);
			const relationships = await RelationshipsXml.fromArchive(
				archive,
				contentTypes,
				relsLocation
			);
			if (relationships && relationships != null) {
				evaluateXPathToArray(
					`array {
						//${QNS.w}footnote/map { 
							"id" : @${QNS.w}id/number(),
							"content": array { ./* }, 
							"type": @${QNS.w}type/string(),
							"style": ./${QNS.w}p/${QNS.w}pPr/${QNS.w}pStyle/@${QNS.w}val/string()
						}
					}`,
					relsDom
				).forEach((footnote) => {
					inst.add(
						footnote.content.map((f: Node) =>
							Paragraph.fromNode(f, { archive, relationships })
						),
						footnote.style
					);
				});
			}
		}
		return inst;
	}

	/**
	 * @deprecated FOR TEST PURPOSES ONLY
	 */
	public $$$clearFootnotes(): void {
		this.#footnotes.clear();
	}
}

/**
 * Finds all descendant images.
 */
function findDescendantImages(
	nodes: Component<
		// deno-lint-ignore ban-types
		{},
		// deno-lint-ignore no-explicit-any
		any
	>[]
): Image[] {
	const images: Image[] = [];
	nodes.forEach((node) => {
		if (node instanceof Image) {
			images.push(node);
		}

		images.push(...findDescendantImages(node.children || []));
	});

	return images;
}
