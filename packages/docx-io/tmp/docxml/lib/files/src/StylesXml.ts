import type { Archive } from '../../classes/src/Archive.ts';
import { XmlFile } from '../../classes/src/XmlFile.ts';
import { FileMime } from '../../enums.ts';
import {
	type ParagraphProperties,
	paragraphPropertiesFromNode,
	paragraphPropertiesToNode,
} from '../../properties/src/paragraph-properties.ts';
import {
	type TableConditionalProperties,
	type TableConditionalTypes,
	tableConditionalPropertiesFromNode,
	tableConditionalPropertiesToNode,
} from '../../properties/src/table-conditional-properties.ts';
import {
	type TableProperties,
	tablePropertiesFromNode,
	tablePropertiesToNode,
} from '../../properties/src/table-properties.ts';
import {
	type TextProperties,
	textPropertiesFromNode,
	textPropertiesToNode,
} from '../../properties/src/text-properties.ts';
import { create } from '../../utilities/src/dom.ts';
import { createRandomId } from '../../utilities/src/identifiers.ts';
import {
	ALL_NAMESPACE_DECLARATIONS,
	QNS,
} from '../../utilities/src/namespaces.ts';
import {
	evaluateXPathToArray,
	evaluateXPathToFirstNode,
} from '../../utilities/src/xquery.ts';
import { ThemeXml } from './ThemeXml.ts';

type ParagraphStyle = {
	type: 'paragraph';
	paragraph?: ParagraphProperties;
	text?: TextProperties;
	table?: null;
};

type CharacterStyle = {
	type: 'character';
	paragraph?: null;
	text?: TextProperties;
	table?: null;
};

type TableStyle = {
	type: 'table';
	paragraph?: null;
	text?: null;
	table?: TableProperties & {
		conditions?: Partial<
			Record<
				TableConditionalTypes,
				Omit<TableConditionalProperties, 'type'>
			>
		>;
	};
};

export type AnyStyleDefinition = {
	id: string;
	name?: string | null;
	basedOn?: string | null;
	isDefault?: boolean | null;
} & (CharacterStyle | ParagraphStyle | TableStyle);

/**
 * https://c-rex.net/projects/samples/ooxml/e1/Part4/OOXML_P4_DOCX_lsdException_topic_ID0EX4NT.html
 */
type LatentStyle = {
	name: string;
	locked?: boolean | null;
	uiPriority?: number | null;
	semiHidden?: boolean | null;
	unhideWhenUsed?: boolean | null;
	qFormat?: boolean | null;
};

type DocumentDefaults = {
	defaultRunProperties?: TextProperties | null;
	defaultParagraphProperties?: ParagraphProperties | null;
};

export class StylesXml extends XmlFile {
	public static override contentType = FileMime.styles;

	readonly #latentStyles: LatentStyle[] = [];
	readonly #styles: AnyStyleDefinition[] = [];
	readonly #docDefaultStyles: DocumentDefaults = {
		defaultRunProperties: null,
		defaultParagraphProperties: null,
	};

	public constructor(location: string) {
		super(location);
	}

	/**
	 * Ensure that a style with this identifier exists. If it doesn't already exist, an empty
	 * (paragraph) style is added just in time.
	 *
	 * @deprecated This is probably an incorrect approach to fixing missing styles.
	 */
	public ensureStyle(id: string): void {
		if (id && !this.hasStyle(id)) {
			this.add({
				id: id,
				type: 'paragraph',
				basedOn: 'Normal',
			});
		}
	}

	public override isEmpty(): boolean {
		return !this.#styles.length && !this.#latentStyles.length;
	}

	protected override async toNode(): Promise<Document> {
		// @TODO look at attribute w:document@mc:Ignorable="w14 w15 w16se w16cid w16 w16cex w16sdtdh wp14"
		return create(
			`<w:styles ${ALL_NAMESPACE_DECLARATIONS}>
				{
					if (count($latentStyles) > 0) then element ${QNS.w}latentStyles {
						attribute ${QNS.w}defLockedState { "0" },
						attribute ${QNS.w}defUIPriority { "99" },
						attribute ${QNS.w}defSemiHidden { "0" },
						attribute ${QNS.w}defUnhideWhenUsed { "0" },
						attribute ${QNS.w}defQFormat { "0" },
						attribute ${QNS.w}count { count($latentStyles) },
						for $latentStyle in array:flatten($latentStyles)
							return element ${QNS.w}lsdException {
								attribute ${QNS.w}name { $latentStyle('name') },
								if (exists($latentStyle('locked')))
									then attribute ${QNS.w}locked { $latentStyle('locked') }
									else (),
								if (exists($latentStyle('uiPriority')))
									then attribute ${QNS.w}uiPriority { $latentStyle('uiPriority') }
									else (),
								if (exists($latentStyle('semiHidden')))
									then attribute ${QNS.w}semiHidden { $latentStyle('semiHidden') }
									else (),
								if (exists($latentStyle('unhideWhenUsed')))
									then attribute ${QNS.w}unhideWhenUsed { $latentStyle('unhideWhenUsed') }
									else (),
								if (exists($latentStyle('qFormat')))
									then attribute ${QNS.w}qFormat { $latentStyle('qFormat') }
									else ()
							}
					} else (),
					for $style in array:flatten($styles)
						return <w:style>
							{
								attribute ${QNS.w}type { $style('type') },
								attribute ${QNS.w}styleId { $style('id') },
								if ($style('isDefault')) then attribute ${QNS.w}default {"1"} else (),
								if ($style('name')) then <w:name w:val="{$style('name')}" /> else (),
								if ($style('basedOn')) then <w:basedOn w:val="{$style('basedOn')}" /> else (),
								if ($style('ppr')) then $style('ppr') else (),
								if ($style('rpr')) then $style('rpr') else (),
								if ($style('tblpr')) then $style('tblpr') else (),
								$style('conditions')
							}
						</w:style>
				}
			</w:styles>`,
			{
				styles: await Promise.all(
					this.#styles.map(
						async ({ paragraph, text, table, ...style }) => ({
							...style,
							ppr: await paragraphPropertiesToNode(
								paragraph as ParagraphStyle['paragraph']
							),
							rpr: await textPropertiesToNode(
								text as ParagraphStyle['text']
							),
							tblpr: tablePropertiesToNode(
								table as TableStyle['table']
							),
							conditions: table?.conditions
								? await Promise.all(
										Object.entries(table.conditions).map(
											async ([type, properties]) =>
												await tableConditionalPropertiesToNode(
													{
														...properties,
														type: type as TableConditionalTypes,
													}
												)
										)
								  )
								: null,
						})
					)
				),
				latentStyles: this.#latentStyles,
			},
			true
		);
	}

	/**
	 * Add a custom style to the available style palette. If it does not have an identifier already,
	 * the system will propose an identifier based on the style name, or create a unique GUID. This
	 * method throws when the identifier is not unique.
	 */
	public add(
		properties: Omit<AnyStyleDefinition, 'id'> & { id?: string }
	): string {
		const id =
			properties.id ||
			properties.name?.replace(/[^a-zA-Z0-9]/g, '') ||
			createRandomId('style');
		if (this.hasStyle(id)) {
			throw new Error(`A style with identifier "${id}" already exists.`);
		}
		const style = {
			...properties,
			id,
		} as AnyStyleDefinition;
		this.#styles.push(style);
		return style.id;
	}

	/**
	 * Add several custom styles to the available palette. Useful for cloning the style configuration of
	 * another DOCX.
	 */
	public addStyles(styles: AnyStyleDefinition[]) {
		styles.forEach((style) => this.add(style));
	}

	/**
	 * The list of custom styles. Does not include latent styles.
	 */
	public get styles(): AnyStyleDefinition[] {
		return this.#styles;
	}

	/**
	 * Adds default styles.
	 */
	public addDefaults(properties: DocumentDefaults): void {
		this.#docDefaultStyles.defaultRunProperties =
			properties.defaultRunProperties;
		this.#docDefaultStyles.defaultParagraphProperties =
			properties.defaultParagraphProperties;
	}

	/**
	 * Adds a latent style, which means that the Word processor should determine its actual properties
	 */
	public addLatent(properties: LatentStyle): void {
		this.#latentStyles.push(properties);
	}

	/**
	 * Checks wether a custom style or a latent style with this identifier already exists.
	 */
	public hasStyle(id: string): boolean {
		return (
			this.#styles.some((style) => style.id === id) ||
			this.#latentStyles.some((style) => style.name === id)
		);
	}

	/**
	 * Gets the style data by its identifier.
	 */
	public get(id: string): AnyStyleDefinition | undefined {
		return this.#styles.find((style) => style.id === id);
	}

	public static fromDom(
		dom: Document,
		location: string,
		theme?: ThemeXml
	): StylesXml {
		const instance = new StylesXml(location);

		const defaultRunProperties = textPropertiesFromNode(
			evaluateXPathToFirstNode(
				`/*/${QNS.w}docDefaults/${QNS.w}rPrDefault/${QNS.w}rPr`,
				dom
			)
		);
		const defaultParagraphProperties = paragraphPropertiesFromNode(
			evaluateXPathToFirstNode(
				`/*/${QNS.w}docDefaults/${QNS.w}pPrDefault/${QNS.w}pPr`,
				dom
			)
		);

		instance.addDefaults({
			defaultRunProperties: defaultRunProperties,
			defaultParagraphProperties: defaultParagraphProperties,
		} as DocumentDefaults);

		//We should not get here unless there's *NOTHING* telling us what to do.
		let instanceFontProperties: TextProperties['font'] =
			instance.#docDefaultStyles?.defaultRunProperties?.font;
		if (
			instanceFontProperties &&
			typeof instanceFontProperties !== 'string' &&
			theme
		) {
			for (const key in instanceFontProperties) {
				if (
					instanceFontProperties[
						key as keyof TextProperties['font']
					] === null
				) {
					// instanceFontProperties[key as keyof TextProperties['font']] = theme.getMinorFonts().latinFont.typeface;
					instanceFontProperties = {
						[key]: theme.fontScheme.minorFont.latinFont.typeface,
					};
				}
			}
		}

		// Warning! Untyped objects
		instance.addStyles(
			evaluateXPathToArray(
				`array { /*/${QNS.w}style[@${QNS.w}type = ("paragraph", "table", "character") and @${QNS.w}styleId]/map {
					"id": @${QNS.w}styleId/string(),
					"type": @${QNS.w}type/string(),
					"name": ./${QNS.w}name/@${QNS.w}val/string(),
					"basedOn": ./${QNS.w}basedOn/@${QNS.w}val/string(),
					"isDefault": docxml:st-on-off(@${QNS.w}default),
					"tblpr": ./${QNS.w}tblPr,
					"tblStylePr": array{ ./${QNS.w}tblStylePr },
					"ppr": ./${QNS.w}pPr,
					"rpr": ./${QNS.w}rPr
				}}`,
				dom
			).map(({ ppr, rpr, tblpr, tblStylePr, ...json }) => {
				const runProperties = textPropertiesFromNode(rpr);
				const instanceFont =
					instance.#docDefaultStyles?.defaultRunProperties?.font;
				if (json.isDefault) {
					if (
						runProperties.font === undefined ||
						runProperties.font === null
					) {
						runProperties.font = instanceFont;
					}
					if (
						runProperties.font &&
						typeof runProperties.font !== 'string'
					) {
						for (const key in runProperties.font) {
							if (
								runProperties.font[
									key as keyof TextProperties['font']
								] === null &&
								instanceFont &&
								typeof instanceFont !== 'string'
							) {
								runProperties.font[
									key as keyof TextProperties['font']
								] =
									instanceFont[
										key as keyof TextProperties['font']
									];
							}
						}
					}
				}
				return {
					...json,
					paragraph: paragraphPropertiesFromNode(ppr),
					text: runProperties,
					table: {
						...tablePropertiesFromNode(tblpr),
						...(tblStylePr.length
							? {
									conditions: (
										tblStylePr.map(
											tableConditionalPropertiesFromNode
										) as TableConditionalProperties[]
									).reduce(
										(m, { type, ...style }) =>
											Object.assign(m, {
												[type]: style,
											}),
										{}
									),
							  }
							: {}),
					},
				};
			})
		);

		// Warning! Untyped objects
		evaluateXPathToArray(
			`array { /*/${QNS.w}latentStyles/${QNS.w}lsdException/map {
				"name": @${QNS.w}name/string(),
				"uiPriority": @${QNS.w}uiPriority/number(),
				"qFormat": docxml:st-on-off(@${QNS.w}qFormat),
				"unhideWhenUsed": docxml:st-on-off(@${QNS.w}unhideWhenUsed),
				"locked": docxml:st-on-off(@${QNS.w}locked),
				"semiHidden": docxml:st-on-off(@${QNS.w}semiHidden)
			}}`,
			dom
		).forEach((json) => instance.addLatent(json));

		return instance;
	}

	/**
	 * Instantiate this class by looking at the DOCX XML for it.
	 */
	public static override async fromArchive(
		archive: Archive,
		location: string
	): Promise<StylesXml> {
		if (archive.hasFile(location)) {
			const theme = await ThemeXml.fromArchive(archive);
			const dom = await archive.readXml(location);
			return this.fromDom(dom, location, theme);
		}
		return Promise.resolve(new StylesXml(location));
	}
}
