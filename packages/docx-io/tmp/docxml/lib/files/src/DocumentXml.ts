import { basename, dirname } from '@util-path';

import type { ContentTypesXml } from '../../../mod.ts';
import type { Archive } from '../../classes/src/Archive.ts';
import type { ComponentContext } from '../../classes/src/Component.ts';
import { XmlFileWithContentTypes } from '../../classes/src/XmlFile.ts';
import type { Paragraph } from '../../components/document/src/Paragraph.ts';
import {
	type SectionChild,
	Section,
	sectionChildComponentNames,
} from '../../components/document/src/Section.ts';
import type { Table } from '../../components/document/src/Table.ts';
import { FileLocation, FileMime, RelationshipType } from '../../enums.ts';
import { createChildComponentsFromNodes } from '../../utilities/src/components.ts';
import { create } from '../../utilities/src/dom.ts';
import {
	ALL_NAMESPACE_DECLARATIONS,
	QNS,
} from '../../utilities/src/namespaces.ts';
import { evaluateXPathToNodes } from '../../utilities/src/xquery.ts';
import { CommentsExtendedXml } from './CommentsExtendedXml.ts';
import { CommentsXml } from './CommentsXml.ts';
import { FootnotesXml } from './FootnotesXml.ts';
import {
	type HeaderFooterRoot,
	FooterXml,
	HeaderXml,
} from './HeaderFooterXml.ts';
import { NumberingXml } from './NumberingXml.ts';
import { type File, RelationshipsXml } from './RelationshipsXml.ts';
import { SettingsXml } from './SettingsXml.ts';
import { StylesXml } from './StylesXml.ts';

export type DocumentChild = SectionChild | Section;

export type DocumentRoot =
	| DocumentChild
	| DocumentChild[]
	| Promise<DocumentChild[]>;

export class DocumentXml extends XmlFileWithContentTypes {
	public static override contentType = FileMime.mainDocument;

	public readonly relationships: RelationshipsXml;
	#root: DocumentRoot | null = null;

	public constructor(
		location: string,
		relationships: RelationshipsXml = new RelationshipsXml(
			`${dirname(location)}/_rels/${basename(location)}.rels`
		)
	) {
		super(location);
		this.relationships = relationships;
	}

	#styles: StylesXml | null = null;

	/**
	 * The API representing "styles.xml" and all the text/paragraph/table styles associated with this document.
	 */
	public get styles(): StylesXml {
		// @TODO Invalidate the cached #styles whenever that relationship changes.
		if (!this.#styles) {
			this.#styles = this.relationships.ensureRelationship(
				RelationshipType.styles,
				() => new StylesXml(FileLocation.styles)
			);
		}
		return this.#styles;
	}

	#settings: SettingsXml | null = null;

	/**
	 * The API representing "settings.xml" and all the settings associated with this document.
	 */
	public get settings(): SettingsXml {
		// @TODO Invalidate the cached _settings whenever that relationship changes.
		if (!this.#settings) {
			this.#settings = this.relationships.ensureRelationship(
				RelationshipType.settings,
				() => new SettingsXml(FileLocation.settings)
			);
		}
		return this.#settings;
	}

	#comments: CommentsXml | null = null;

	/**
	 * The API representing "comments.xml" and all the comments associated with this document.
	 */
	public get comments(): CommentsXml {
		if (!this.#comments) {
			this.#comments = this.relationships.ensureRelationship(
				RelationshipType.comments,
				() => new CommentsXml(FileLocation.comments)
			);

			// Create the extendedComments.xml file.
			this.#comments.commentsExtended =
				this.relationships.ensureRelationship(
					RelationshipType.commentsExtended,
					() => new CommentsExtendedXml(FileLocation.commentsExtended)
				);
		}
		return this.#comments;
	}

	#footnotes: FootnotesXml | null = null;

	/**
	 * The API representing "footnotes.xml" and all the footnotes in this document.
	 */
	public get footnotes(): FootnotesXml {
		if (!this.#footnotes) {
			this.#footnotes = this.relationships.ensureRelationship(
				RelationshipType.footnotes,
				() => new FootnotesXml(FileLocation.footnotes)
			);
		}
		return this.#footnotes;
	}

	#numbering: NumberingXml | null = null;

	/**
	 * The API representing "numbering.xml" and all the numbering styles/schemes
	 */
	public get numbering(): NumberingXml {
		if (!this.#numbering) {
			this.#numbering = this.relationships.ensureRelationship(
				RelationshipType.numbering,
				() => new NumberingXml(FileLocation.numbering)
			);
		}
		return this.#numbering;
	}

	/**
	 * The components normalized from #root, which is potentially arrayed, promised, array promised etc.
	 */
	public get children(): Promise<DocumentChild[]> {
		if (!this.#root) {
			return Promise.resolve([]);
		}
		return Promise.resolve(this.#root)
			.then((root) => (Array.isArray(root) ? Promise.all(root) : [root]))
			.then((roots) =>
				roots.reduce<Promise<DocumentChild[]>>(async function flatten(
					flatPromise,
					childPromise
				): Promise<DocumentChild[]> {
					const child = await childPromise;
					const flat = await flatPromise;
					return Array.isArray(child)
						? [
								...flat,
								...(await child.reduce(
									flatten,
									Promise.resolve([])
								)),
						  ]
						: [...flat, child];
				},
				Promise.resolve([]))
			);
	}

	protected override async toNode(): Promise<Document> {
		const children = await this.children;
		return create(
			`
				<w:document ${ALL_NAMESPACE_DECLARATIONS}>
					<w:body>
						{$children}
					</w:body>
				</w:document>
			`,
			{
				children: await Promise.all(
					children.map((child) => child.toNode([this]))
				),
			},
			true
		);
	}

	/**
	 * Set the contents of the document
	 */
	public set(root: DocumentRoot): void {
		this.#root = root;
	}

	/**
	 * Get all XmlFile instances related to this one, including self. This helps the system
	 * serialize itself back to DOCX fullly. Probably not useful for consumers of the library.
	 */
	public override getRelated(): File[] {
		return [this, ...this.relationships.getRelated()];
	}

	public readonly headers = {
		/**
		 * Creates a new header instance and returns the relationship identifier.
		 */
		add: (location: string, root: HeaderFooterRoot): string => {
			const inst = new HeaderXml(
				location,
				new RelationshipsXml(
					`${dirname(location)}/_rels/${basename(location)}.rels`
				)
			);
			inst.set(root);
			return this.relationships.add(RelationshipType.header, inst);
		},
		map: <Out>(cb: (header: HeaderXml) => Out): Out[] => {
			return this.relationships
				.filterInstances(
					(meta) => meta.type === RelationshipType.header
				)
				.map((file) => cb(file as HeaderXml));
		},
	};

	public readonly footers = {
		/**
		 * Creates a new footer instance and returns the relationship identifier.
		 */
		add: (location: string, root: HeaderFooterRoot): string => {
			const inst = new FooterXml(
				location,
				new RelationshipsXml(
					`${dirname(location)}/_rels/${basename(location)}.rels`
				)
			);
			inst.set(root);
			return this.relationships.add(RelationshipType.footer, inst);
		},
		map: <Out>(cb: (footer: FooterXml) => Out): Out[] => {
			return this.relationships
				.filterInstances(
					(meta) => meta.type === RelationshipType.footer
				)
				.map((file) => cb(file as FooterXml));
		},
	};

	/**
	 * Instantiate this class by looking at the DOCX XML for it.
	 */
	public static override async fromArchive(
		archive: Archive,
		contentTypes: ContentTypesXml,
		location: string
	): Promise<DocumentXml> {
		const relationships = await RelationshipsXml.fromArchive(
			archive,
			contentTypes,
			`${dirname(location)}/_rels/${basename(location)}.rels`
		);
		const doc = new DocumentXml(location, relationships);
		const dom = await archive.readXml(location);
		const sections = evaluateXPathToNodes(
			`/*/${QNS.w}body/(${QNS.w}p/${QNS.w}pPr/${QNS.w}sectPr | ${QNS.w}sectPr)`,
			dom
		);
		const context: ComponentContext = {
			archive,
			relationships,
		};
		doc.set(
			sections.length
				? sections.map((node) => Section.fromNode(node, context))
				: createChildComponentsFromNodes<Table | Paragraph>(
						sectionChildComponentNames,
						evaluateXPathToNodes(`/*/${QNS.w}body/*`, dom),
						context
				  )
		);
		return doc;
	}
}
