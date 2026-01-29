import type { Archive } from '../../classes/src/Archive.ts';
import { NumberMap } from '../../classes/src/NumberMap.ts';
import { XmlFile } from '../../classes/src/XmlFile.ts';
import { FileMime } from '../../enums.ts';
import {
	type ParagraphProperties,
	paragraphPropertiesFromNode,
	paragraphPropertiesToNode,
} from '../../properties/src/paragraph-properties.ts';
import {
	type TextProperties,
	textPropertiesFromNode,
	textPropertiesToNode,
} from '../../properties/src/text-properties.ts';
import { create } from '../../utilities/src/dom.ts';
import {
	ALL_NAMESPACE_DECLARATIONS,
	QNS,
} from '../../utilities/src/namespaces.ts';
import { evaluateXPathToMap } from '../../utilities/src/xquery.ts';

type AbstractNumbering = {
	id: number;
	type: 'hybridMultilevel' | 'singleLevel' | 'multilevel' | null;
	levels: Array<{
		start: number | null;
		format:
			| 'bullet'
			// the cardinal text of the run language. (In English, One, Two, Three, etc.):
			| 'cardinalText'
			// Set of symbols from the Chicago Manual of Style. (e.g., *, †, ‡, §):
			| 'chicago'
			// decimal numbering (1, 2, 3, 4, etc.):
			| 'decimal'
			// decimal number enclosed in a circle:
			| 'decimalEnclosedCircle'
			// decimal number followed by a period:
			| 'decimalEnclosedFullstop'
			// decimal number enclosed in parentheses:
			| 'decimalEnclosedParen'
			// decimal number but with a zero added to numbers 1 through 9:
			| 'decimalZero'
			// based on the run language (e.g., a, b, c, etc.). Letters repeat for values greater than the size of the alphabet:
			| 'lowerLetter'
			// lowercase Roman numerals (i, ii, iii, iv, etc.):
			| 'lowerRoman'
			// ordinal text of the run laguage. (In English, First, Second, Third, etc.):
			| 'ordinalText'
			// based on the run language (e.g., A, B, C, etc.). Letters repeat for values greater than the size of the alphabet:
			| 'upperLetter'
			// uppercase Roman numerals (I, II, III, IV, etc.):
			| 'upperRoman'
			| 'none'
			| null;
		affix: string | null;
		alignment: 'left' | 'right' | 'center' | 'both' | null;
		paragraph?: ParagraphProperties | null;
		text?: TextProperties | null;
	}>;
};

type AbstractNumberingWithOptionalId = Omit<AbstractNumbering, 'id'> & {
	id?: number;
};

type ConcreteNumbering = {
	id: number;
	abstract: number;
};

export class NumberingXml extends XmlFile {
	public static override contentType = FileMime.numbering;

	/**
	 * The abstract numbering rules.
	 *
	 * Each item correlates with <w:abstractNum>
	 */
	private readonly abstracts = new NumberMap<AbstractNumbering>(0);

	/**
	 * Concrete numbering rules, the ones that are directly associated with zero or more paragraphs.
	 *
	 * Each item correlates with <w:num>
	 */
	private readonly implementations = new NumberMap<ConcreteNumbering>(1);

	public override isEmpty(): boolean {
		return !this.abstracts.size;
	}

	/**
	 * Register a new abstract numberign style and return the identifier.
	 *
	 * Not meant for public use.
	 */
	public addAbstract(style: AbstractNumberingWithOptionalId): number {
		const id = style.id || this.abstracts.getNextAvailableKey();
		if (this.abstracts.has(id)) {
			throw new Error(`There already is an abstract numbering "${id}"`);
		}
		this.abstracts.add({ ...style, id });
		return id;
	}

	/**
	 * Register a concrete implementation of an abstract numbering style and return the concrete
	 * identifier.
	 */
	public addImplementation(abstract: number): number {
		if (!this.abstracts.has(abstract)) {
			throw new Error(`No abstract numbering at ID "${abstract}"`);
		}
		const id = this.implementations.getNextAvailableKey();
		this.implementations.add({ id, abstract });
		return id;
	}

	/**
	 * Register a concrete implementation of an abstract numbering style and return the concrete
	 * identifier. Create the abstract numbering style if the passed argument is an object rather
	 * than a reference to an existing abstract.
	 *
	 * Not meant for public use.
	 */
	public add(abstract: number | AbstractNumberingWithOptionalId): number {
		if (typeof abstract === 'object') {
			abstract = this.addAbstract(abstract);
		}
		return this.addImplementation(abstract);
	}

	protected override async toNode(): Promise<Document> {
		return create(
			`<w:numbering ${ALL_NAMESPACE_DECLARATIONS}>
				{
					for $abstract in array:flatten($abstracts)
						return element ${QNS.w}abstractNum {
							attribute ${QNS.w}abstractNumId { $abstract('id') },
							if ($abstract('type')) then element ${QNS.w}multiLevelType {
								attribute ${QNS.w}val { $abstract('type') }
							} else (),
							for $index in (0 to count(array:flatten($abstract('levels'))) - 1)
								let $lvl := $abstract('levels')($index + 1)
								return element ${QNS.w}lvl {
									attribute ${QNS.w}ilvl { $index },
									if (exists($lvl('start'))) then element ${QNS.w}start {
										attribute ${QNS.w}val { $lvl('start') }
									} else (),
									if (exists($lvl('format'))) then element ${QNS.w}numFmt {
										attribute ${QNS.w}val { $lvl('format') }
									} else (),
									if (exists($lvl('affix'))) then element ${QNS.w}lvlText {
										attribute ${QNS.w}val { $lvl('affix') }
									} else (),
									if (exists($lvl('alignment'))) then element ${QNS.w}lvlJc {
										attribute ${QNS.w}val { $lvl('alignment') }
									} else (),
									$lvl('pPr'),
									$lvl('rPr')
								}
						},
					for $concrete in array:flatten($implementations)
						return element ${QNS.w}num {
							attribute ${QNS.w}numId { $concrete('id') },
							element ${QNS.w}abstractNumId {
								attribute ${QNS.w}val { $concrete('abstract') }
							}
						}
				}
			</w:numbering>`,
			{
				abstracts: await Promise.all(
					this.abstracts.array().map(async (abstract) => ({
						...abstract,
						levels: await Promise.all(
							abstract.levels.map(
								async ({ paragraph, text, ...level }) => ({
									...level,
									pPr: paragraph
										? await paragraphPropertiesToNode(
												paragraph
										  )
										: null,
									rPr: text
										? await textPropertiesToNode(text)
										: null,
								})
							)
						),
					}))
				),
				implementations: this.implementations.array(),
			},
			true
		);
	}

	public static fromNode(dom: Document, location: string): NumberingXml {
		const instance = new NumberingXml(location);
		const { implementations, abstracts } = evaluateXPathToMap<{
			implementations: ConcreteNumbering[];
			abstracts: (Omit<AbstractNumbering, 'levels'> & {
				levels: ((AbstractNumbering['levels'] extends Array<infer P>
					? P
					: never) & {
					pPr: Element | null;
					rPr: Element | null;
				})[];
			})[];
		}>(
			`map {
				"abstracts": array { /*/${QNS.w}abstractNum/map {
					"id": ./@${QNS.w}abstractNumId/number(),
					"type": ./${QNS.w}multiLevelType/@${QNS.w}val/string(),
					"levels": array {./${QNS.w}lvl/map {
						"start": ./${QNS.w}start/@${QNS.w}val/number(),
						"format": ./${QNS.w}numFmt/@${QNS.w}val/string(),
						"affix": ./${QNS.w}lvlText/@${QNS.w}val/string(),
						"alignment": ./${QNS.w}lvlJc/@${QNS.w}val/string(),
						"pPr": ./${QNS.w}pPr,
						"rPr": ./${QNS.w}rPr
					}}
				}},
				"implementations": array { /*/${QNS.w}num/map {
					"id": ./@${QNS.w}numId/number(),
					"abstract": ./${QNS.w}abstractNumId/@${QNS.w}val/number()
				}}
			}`,
			dom
		);
		abstracts.forEach((abstract) =>
			instance.addAbstract({
				...abstract,
				levels: abstract.levels.map(({ pPr, rPr, ...level }) => ({
					...level,
					paragraph: paragraphPropertiesFromNode(pPr),
					text: textPropertiesFromNode(rPr),
				})),
			})
		);
		implementations.forEach((concrete) =>
			instance.implementations.set(concrete.id, concrete)
		);

		return instance;
	}

	public static override async fromArchive(
		archive: Archive,
		location: string
	): Promise<NumberingXml> {
		return this.fromNode(await archive.readXml(location), location);
	}

	public getImplementations(): ConcreteNumbering[] {
		return this.implementations.array();
	}
	public getAbstracts(): AbstractNumbering[] {
		return this.abstracts.array();
	}
}
