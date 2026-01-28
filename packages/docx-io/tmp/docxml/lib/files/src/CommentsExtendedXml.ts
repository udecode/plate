import type { ContentTypesXml } from '../../../mod.ts';
import type { Archive } from '../../classes/src/Archive.ts';
import { NumberMap } from '../../classes/src/NumberMap.ts';
import { XmlFileWithContentTypes } from '../../classes/src/XmlFile.ts';
import { FileMime } from '../../enums.ts';
import { create } from '../../utilities/src/dom.ts';
import { hex, type Id } from '../../utilities/src/id.ts';
import {
	ALL_NAMESPACE_DECLARATIONS,
	QNS,
} from '../../utilities/src/namespaces.ts';
import { evaluateXPathToArray } from '../../utilities/src/xquery.ts';

type CommentEx = {
	id: Id;
	parentId?: Id;
};

export class CommentsExtendedXml extends XmlFileWithContentTypes {
	public static override contentType = FileMime.commentsExtended;

	#commentsExtended = new NumberMap<CommentEx>();

	public override isEmpty(): boolean {
		return !this.#commentsExtended.size;
	}

	protected override toNode(): Document {
		return create(
			`
				<w15:commentsEx ${ALL_NAMESPACE_DECLARATIONS}>
					{
						for $commentEx in array:flatten($commentsExtended)
							return element w15:commentEx {
								attribute w15:paraId { $commentEx('id') },
								if ($commentEx('parentId')) then 
									attribute w15:paraIdParent { $commentEx('parentId') }
								else ()
							}
					}
				</w15:commentsEx>
			`,
			{
				commentsExtended: this.#commentsExtended
					.array()
					.map(({ id, parentId }) => {
						return {
							id: id.hex,
							parentId: parentId ? parentId.hex : undefined,
						};
					}),
			},
			true
		);
	}

	/**
	 * Add a comment to the DOCX file and return its new identifier.
	 */
	public add(meta: CommentEx): number {
		this.#commentsExtended.set(meta.id.int, meta);
		return meta.id.int;
	}

	/**
	 * Check whether or not a comment with the given identifier already exists.
	 */
	public has(id: number): boolean {
		return this.#commentsExtended.has(id);
	}

	/**
	 * Instantiate this class by looking at the DOCX XML for it.
	 */
	public static override async fromArchive(
		archive: Archive,
		_: ContentTypesXml,
		location: string
	): Promise<CommentsExtendedXml> {
		const dom = await archive.readXml(location);

		const inst = new this(location);

		evaluateXPathToArray(
			`
				array { /*/${QNS.w15}commentEx/map {
					"id": @${QNS.w15}paraId/string(),
					"parentId": @${QNS.w15}paraIdParent/string()
				}}
			`,
			dom
		).forEach(({ id, parentId }) =>
			inst.add({
				id: hex(id),
				parentId: parentId ? hex(parentId) : undefined,
			})
		);

		return inst;
	}

	/**
	 * @deprecated FOR TEST PURPOSES ONLY
	 */
	public override $$$toNode(): Document {
		return this.toNode();
	}
}
