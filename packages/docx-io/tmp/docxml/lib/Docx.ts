import { GenericRenderer } from 'xml_renderer';

import { Archive } from './classes/src/Archive.ts';
import { Bookmarks } from './classes/src/Bookmarks.ts';
import type { AnyComponent } from './classes/src/Component.ts';
import { FileLocation, RelationshipType } from './enums.ts';
import { ContentTypesXml } from './files/src/ContentTypesXml.ts';
import { CustomPropertiesXml } from './files/src/CustomPropertiesXml.ts';
import {
	type DocumentChild,
	type DocumentRoot,
	DocumentXml,
} from './files/src/DocumentXml.ts';
import { RelationshipsXml } from './files/src/RelationshipsXml.ts';
import type { SettingsI } from './files/src/SettingsXml.ts';
import { parse } from './utilities/src/dom.ts';
import { jsx } from './utilities/src/jsx.ts';

type SyncRuleResult = AnyComponent | string | null;
type AsyncRuleResult = Promise<SyncRuleResult>;
type RuleResult = SyncRuleResult | AsyncRuleResult | Array<RuleResult>;

/**
 * Represents the DOCX file as a whole, and collates other responsibilities together. Provides
 * access to DOCX content types ({@link ContentTypesXml}), relationships ({@link RelationshipsXml}),
 * the document itself ({@link DocumentXml}).
 *
 * An instance of this class can access other classes that represent the various XML files in a
 * DOCX archive, such as `ContentTypes.xml`, `word/document.xml`, and `_rels/.rels`.
 */
export class Docx<
	PropsGeneric extends { [key: string]: unknown } = { [key: string]: never }
> {
	/**
	 * The JSX pragma.
	 */
	public readonly jsx = jsx;

	/**
	 * The JSX pragma.
	 *
	 * @deprecated This static property may be removed in the future since it does not have the context of
	 * a DOCX. If you can, use the instance JSX property. If you cannot, submit an issue.
	 */
	public static readonly jsx = jsx;

	/**
	 * The utility function dealing with the XML for recording content types. Every DOCX file has
	 * exactly one of these.
	 */
	public readonly contentTypes: ContentTypesXml;

	/**
	 * The utility function dealing with the top-level XML file for recording relationships. Other
	 * relationships may have their own relationship XMLs.
	 */
	public readonly relationships: RelationshipsXml;

	public readonly bookmarks: Bookmarks = new Bookmarks();

	protected constructor(
		contentTypes: ContentTypesXml = new ContentTypesXml(
			FileLocation.contentTypes
		),
		relationships: RelationshipsXml = new RelationshipsXml(
			FileLocation.relationships
		),
		rules: GenericRenderer<
			RuleResult,
			{ document: DocumentXml } & PropsGeneric
		> | null = null
	) {
		this.contentTypes = contentTypes;
		this.relationships = relationships;

		if (rules) {
			this.#renderer.merge(rules);
		}

		if (!this.relationships.hasType(RelationshipType.officeDocument)) {
			this.relationships.add(
				RelationshipType.officeDocument,
				new DocumentXml(FileLocation.mainDocument)
			);
		}
	}

	// Also not enumerable
	#officeDocument: DocumentXml | null = null;

	/**
	 * A short-cut to the relationship that represents visible document content.
	 */
	public get document(): DocumentXml {
		// @TODO Invalidate the cached _officeDocument whenever that relationship changes.
		if (!this.#officeDocument) {
			this.#officeDocument = this.relationships.ensureRelationship(
				RelationshipType.officeDocument,
				() => new DocumentXml(FileLocation.mainDocument)
			);
		}
		return this.#officeDocument;
	}

	#customProperties: CustomPropertiesXml | null = null;

	/**
	 * The API representing "docProps/custom.xml"
	 */
	public get customProperties(): CustomPropertiesXml {
		if (!this.#customProperties) {
			this.#customProperties = this.relationships.ensureRelationship(
				RelationshipType.customProperties,
				() => new CustomPropertiesXml(FileLocation.customProperties)
			);
		}
		return this.#customProperties;
	}

	/**
	 * Create a ZIP archive, which is the handler for `.docx` files as a ZIP archive.
	 */
	public async toArchive(): Promise<Archive> {
		const styles = this.document.styles;

		const roots = [
			{
				relationships: this.document.relationships,
				componentRoot: this.document.children,
			},
			...this.document.headers.map((runningBlock) => ({
				relationships: runningBlock.relationships,
				componentRoot: runningBlock.children,
			})),
			...this.document.footers.map((runningBlock) => ({
				relationships: runningBlock.relationships,
				componentRoot: runningBlock.children,
			})),
		];

		async function walkChildComponentsFromRoot(
			children: Promise<AnyComponent[]>,
			relationships: RelationshipsXml | null
		) {
			// Loop over all content to ensure styles are registered, relationships created etc.
			await Promise.all(
				(
					await children
				).map(async function walk(componentPromise) {
					const component = await componentPromise;
					if (typeof component === 'string') {
						return;
					}
					if (Array.isArray(component)) {
						await Promise.all(
							(component as AnyComponent[]).map(walk)
						);
						return;
					}

					const styleName = (component.props as { style?: string })
						.style;
					if (styleName) {
						styles.ensureStyle(styleName);
					}

					if (relationships !== null) {
						await component.ensureRelationship(relationships);
					}

					await Promise.all(
						(component.children as AnyComponent[]).map(walk)
					);
				})
			);
		}

		await Promise.all(
			roots.map(({ relationships, componentRoot }) =>
				walkChildComponentsFromRoot(componentRoot, relationships)
			)
		);

		const archive = new Archive();

		// New relationships may be created as they are necessary for serializing content, eg. for
		// images.
		await this.relationships.addToArchive(archive);

		await Promise.all(
			this.relationships
				.getRelated()
				.filter((related) => !(related instanceof RelationshipsXml))
				.map(async (related) => {
					this.contentTypes.addOverride(
						related.location,
						await related.contentType
					);
				})
		);
		await this.contentTypes.addToArchive(archive);

		return archive;
	}

	/**
	 * Convenience method to create a DOCX archive from the current document and write it to your disk.
	 */
	public async toFile(location: string): Promise<void> {
		const archive = await this.toArchive();
		return archive.toFile(location);
	}

	/**
	 * Instantiate this class by giving it a `.docx` file if it is already loaded as a {@link Archive} instance.
	 */
	public static async fromArchive<
		PropsGeneric extends { [key: string]: unknown } = {
			[key: string]: never;
		}
	>(archive: Archive): Promise<Docx<PropsGeneric>>;

	/**
	 * Instantiate this class by giving it a `.docx` file loaded as a byte array.
	 */
	public static async fromArchive<
		PropsGeneric extends { [key: string]: unknown } = {
			[key: string]: never;
		}
	>(data: Uint8Array): Promise<Docx<PropsGeneric>>;

	/**
	 * Instantiate this class by pointing at a `.docx` file location.
	 */
	public static async fromArchive<
		PropsGeneric extends { [key: string]: unknown } = {
			[key: string]: never;
		}
	>(location: string): Promise<Docx<PropsGeneric>>;

	/**
	 * Instantiate this class by referencing an existing `.docx` archive.
	 */
	public static async fromArchive<
		PropsGeneric extends { [key: string]: unknown } = {
			[key: string]: never;
		}
	>(
		locationOrZipArchive: string | Archive | Uint8Array
	): Promise<Docx<PropsGeneric>> {
		const archive =
			typeof locationOrZipArchive === 'string'
				? await Archive.fromFile(locationOrZipArchive)
				: locationOrZipArchive instanceof Uint8Array
				? await Archive.fromUInt8Array(locationOrZipArchive)
				: locationOrZipArchive;

		const contentTypes = await ContentTypesXml.fromArchive(
			archive,
			FileLocation.contentTypes
		);
		const relationships = await RelationshipsXml.fromArchive(
			archive,
			contentTypes,
			FileLocation.relationships
		);

		return new Docx<PropsGeneric>(contentTypes, relationships);
	}

	/**
	 * Create an empty DOCX, and populate it with the minimum viable contents to appease MS Word.
	 */
	public static fromNothing<
		PropsGeneric extends { [key: string]: unknown } = {
			[key: string]: never;
		}
	>(): Docx<PropsGeneric> {
		return new Docx<PropsGeneric>();
	}

	/**
	 * Create a new DOCX with contents composed by this library's components. Needs a single JSX component
	 * as root, for example `<Section>` or `<Paragragh>`.
	 */
	public static fromJsx(
		roots: DocumentChild[] | Promise<DocumentChild[]>
	): Docx<{
		[key: string]: never;
	}> {
		const docx = Docx.fromNothing();
		docx.document.set(roots);
		return docx;
	}

	/**
	 * The XML renderer instance containing translation rules, going from your XML to this library's
	 * OOXML components.
	 */
	readonly #renderer = new GenericRenderer<
		RuleResult,
		{ document: DocumentXml } & PropsGeneric
	>();

	/**
	 * Add an XML translation rule, applied to an element that matches the given XPath test.
	 *
	 * If an element matches multiple rules, the rule with the most specific XPath test wins.
	 */
	public withXmlRule(
		xPathTest: string,
		transformer: Parameters<
			GenericRenderer<
				RuleResult,
				{ document: DocumentXml } & PropsGeneric
			>['add']
		>[1]
	): this {
		this.#renderer.add(xPathTest, transformer);
		return this;
	}

	/**
	 * Add _all_ the XML translatiom rules from another set of translation rules. Useful for
	 * cloning.
	 */
	private withXmlRules(
		renderer: GenericRenderer<
			RuleResult,
			{ document: DocumentXml } & PropsGeneric
		>
	): this {
		this.#renderer.merge(renderer);
		return this;
	}

	/**
	 * A convenience method to set a few settings for the document.
	 */
	public withSettings(settingOverrides: Partial<SettingsI>): this {
		Object.entries(settingOverrides).forEach(([key, value]) => {
			this.document.settings.set(key as keyof SettingsI, value);
		});
		return this;
	}

	/**
	 * Set the document contents to the provided XML, transformed using the rules previously
	 * registered through {@link Docx.withXmlRule}.
	 */
	public withXml(dom: string | Document, props: PropsGeneric): this {
		if (typeof dom === 'string') {
			dom = parse(dom);
		}
		if (!this.#renderer.length) {
			throw new Error(
				'No XML transformation rules were configured, creating a DOCX from XML is therefore not possible.'
			);
		}

		const ast = this.#renderer.render(dom, {
			document: this.document,
			...props,
		});

		const root = [ast].reduce<Promise<AnyComponent[]>>(
			async function flatten(
				flatPromise,
				childPromise
			): Promise<AnyComponent[]> {
				const flat = await flatPromise;
				const child = await childPromise;
				if (child === null || typeof child === 'string') {
					return flat;
				}
				if (Array.isArray(child)) {
					return [
						...flat,
						...(await child.reduce(flatten, Promise.resolve([]))),
					];
				}
				flat.push(child);
				return flat;
			},
			Promise.resolve([])
		);

		// There is no guarantee that the rendering rules produce schema-valid XML.
		// @TODO implement some kind of an errr-out mechanism

		// @TODO validate that the children are correct?
		this.document.set(root as DocumentRoot);

		return this;
	}

	/**
	 * Clone some reusable configuration to a new instance of {@link Docx}:
	 *
	 * - XML rendering rules
	 * - Settings
	 * - Default content types
	 * - Custom styles
	 *
	 * Does _not_ clone other things, like:
	 * - Not content
	 * - Not content type overrides
	 * - Not relationships (unless required for settings)
	 * - Not anything else either
	 */
	public cloneAsEmptyTemplate(): Docx<PropsGeneric> {
		const clone = Docx.fromNothing<PropsGeneric>();
		clone.withXmlRules(this.#renderer);
		clone.withSettings(
			this.document.settings.entries().reduce<Partial<SettingsI>>(
				(dict, [key, value]) => ({
					...dict,
					[key]: value,
				}),
				{}
			)
		);
		clone.customProperties.add(this.customProperties.values());
		clone.contentTypes.addDefaults(this.contentTypes.defaults);
		clone.document.styles.addStyles(this.document.styles.styles);
		return clone;
	}
}
