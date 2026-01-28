import { basename, dirname } from '@util-path';

import type { ContentTypesXml } from '../../../mod.ts';
import type { Archive } from '../../classes/src/Archive.ts';
import { NumberMap } from '../../classes/src/NumberMap.ts';
import { XmlFileWithContentTypes } from '../../classes/src/XmlFile.ts';
import { Paragraph } from '../../components/document/src/Paragraph.ts';
import { FileLocation, FileMime } from '../../enums.ts';
import { create } from '../../utilities/src/dom.ts';
import { type Id, int } from '../../utilities/src/id.ts';
import {
	ALL_NAMESPACE_DECLARATIONS,
	QNS,
} from '../../utilities/src/namespaces.ts';
import { evaluateXPathToArray } from '../../utilities/src/xquery.ts';
import { CommentsExtendedXml } from './CommentsExtendedXml.ts';
import { RelationshipsXml } from './RelationshipsXml.ts';

type Comment = {
	id: Id;
	author: string;
	initials?: string | null;
	date: Date;
	contents: Paragraph[] | Promise<Paragraph[]>;
	parentId?: Id;
};

export class CommentsXml extends XmlFileWithContentTypes {
	public static override contentType = FileMime.comments;

	#commentsExtended: CommentsExtendedXml | null = null;

	// Sometimes MSWord doesn't like ids that have a 0 value.
	#comments = new NumberMap<Comment>(1);

	public set commentsExtended(commentsEx: CommentsExtendedXml) {
		this.#commentsExtended = commentsEx;
	}

	public override isEmpty(): boolean {
		return !this.#comments.size;
	}

	protected override async toNode(): Promise<Document> {
		return create(
			`
				<w:comments ${ALL_NAMESPACE_DECLARATIONS}>
					{
						for $comment in array:flatten($comments)
							return element ${QNS.w}comment {
								attribute ${QNS.w}id { $comment('id') },
								attribute ${QNS.w}author { $comment('author') },
								if (exists($comment('initials'))) then attribute ${QNS.w}initials { $comment('initials') } else (),
								attribute ${QNS.w}date { $comment('date') },
								$comment('contents')
							}
					}
				</w:comments>
			`,
			{
				comments: await Promise.all(
					this.#comments.array().map(async (comment) => ({
						...comment,
						id: comment.id.int,
						date: comment.date.toISOString(),
						contents: await Promise.all(
							(
								await comment.contents
							).map((paragraph) => {
								// Using the comment identifier as paragraph identifier here.
								// Comment ids are unique, and we only need paragraphs ids in order to track
								// replies, so we're good here.
								paragraph.id = comment.id;
								return paragraph.toNode([]);
							})
						),
					}))
				),
			},
			true
		);
	}

	/**
	 * Add a comment to the DOCX file and return its new identifier. You should reference this
	 * identifier from the document using the {@link Comment}, {@link CommentRangeStart} and
	 * {@link CommentRangeEnd} components.
	 */
	public add(
		meta: Omit<Comment, 'id' | 'contents'>,
		contents: Comment['contents']
	): Id {
		const id = this.#comments.getNextAvailableKey();

		// Add the extended comment.
		this.#commentsExtended?.add({
			id: int(id),
			parentId: meta.parentId,
		});

		this.#comments.set(id, {
			id: int(id),
			...meta,
			contents,
		});
		return int(id);
	}

	/**
	 * Check whether or not a comment with the given identifier already exists.
	 */
	public has(id: number): boolean {
		return this.#comments.has(id);
	}

	/**
	 * Instantiate this class by looking at the DOCX XML for it.
	 */
	public static override async fromArchive(
		archive: Archive,
		contentTypes: ContentTypesXml,
		location: string
	): Promise<CommentsXml> {
		const dom = await archive.readXml(location);

		const relsLocation = `${dirname(location)}/_rels/${basename(
			location
		)}.rels`;
		const relationships = archive.hasFile(relsLocation)
			? await RelationshipsXml.fromArchive(
					archive,
					contentTypes,
					relsLocation
			  )
			: null;

		const inst = new this(location);

		evaluateXPathToArray(
			`
				array { /*/${QNS.w}comment/map {
					"id": @${QNS.w}id/number(),
					"author": @${QNS.w}author/string(),
					"initials": ./${QNS.w}initials/@${QNS.w}val/string(),
					"date": ./${QNS.w}date/string(),
					"contents": array { ./${QNS.w}p }
				}}
			`,
			dom
		).forEach(({ contents, date, ...rest }) =>
			inst.add(
				{
					...rest,
					date: new Date(date),
				},
				contents.map((node: Node) =>
					Paragraph.fromNode(node, {
						archive,
						relationships,
					})
				)
			)
		);

		return inst;
	}

	/**
	 * @deprecated FOR TEST PURPOSES ONLY
	 */
	public get $$$commentsExtended(): CommentsExtendedXml {
		return this.#commentsExtended!;
	}

	/**
	 * @deprecated FOR TEST PURPOSES ONLY
	 */
	public $$$initializeCommentsExtended() {
		this.#commentsExtended = new CommentsExtendedXml(
			FileLocation.commentsExtended
		);
	}
}
