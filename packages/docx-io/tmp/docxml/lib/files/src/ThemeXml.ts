import type { Archive } from '../../classes/src/Archive.ts';
import { XmlFile } from '../../classes/src/XmlFile.ts';
import { FileMime } from '../../enums.ts';
import { create } from '../../utilities/src/dom.ts';
import { QNS } from '../../utilities/src/namespaces.ts';
import { evaluateXPathToMap } from '../../utilities/src/xquery.ts';

/**
 * Represents the various 'scheme' elements that comprise a theme.
 *
 * Currently, only FontScheme is implemented. It functions as a fallback for
 * determining which fonts to apply when the StylesXml cannot determine which
 * font to apply for the required Normal style in MS Word.
 *
 * @TODO Implement ColorScheme and FormatScheme
 */

export type Font = {
	script?: string;
	typeface: string;
};

export interface LatinFont extends Font {
	typeface: string;
	/**
	 * The Panose system is used by ooxml and other word processors as a reference
	 * system to classify fonts based on their attributes. e.g. Family, Serif, Weight, etc.
	 * The system represents 10 attributes with a single (hex) digit for each,
	 * with each attribute separated by a 0.
	 */
	panose: string;
}

export type FontScheme = {
	majorFont: {
		latinFont: LatinFont;
		otherFonts: Font[];
	};
	minorFont: {
		latinFont: LatinFont;
		otherFonts: Font[];
	};
};

export class ThemeXml extends XmlFile {
	public static override contentType = FileMime.theme;
	public fontScheme: FontScheme;

	public constructor(location: string) {
		const fallbackLatinFont = {
			typeface: 'Times New Roman',
			panose: '020206030504020304',
		};
		super(location);
		this.fontScheme = {
			majorFont: {
				latinFont: fallbackLatinFont,
				otherFonts: [],
			},
			minorFont: {
				latinFont: fallbackLatinFont,
				otherFonts: [],
			},
		};
	}

	public setFontScheme(fontScheme: FontScheme): void {
		this.fontScheme = fontScheme;
	}

	public getFontScheme(): FontScheme {
		return this.fontScheme;
	}

	public setMajorFonts(latin: LatinFont, others: Font[]): void {
		this.fontScheme.majorFont.latinFont = latin;
		this.fontScheme.majorFont.otherFonts = others;
	}

	public getMajorFonts(): {
		latinFont: LatinFont;
		otherFonts: Font[];
	} {
		return this.fontScheme.majorFont;
	}

	public setMinorFonts(latin: LatinFont, others: Font[]): void {
		this.fontScheme.minorFont.latinFont = latin;
		this.fontScheme.minorFont.otherFonts = others;
	}

	public getMinorFonts(): {
		latinFont: LatinFont;
		otherFonts: Font[];
	} {
		return this.fontScheme.minorFont;
	}

	public override toNode(): Document {
		return create(
			`<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
			{
				element a:themeElements {
					element a:fontScheme {
						element a:majorFont {
							element a:latin {
								attribute typeface { $majorFontLatinTypeface },
								attribute panose { $majorFontLatinPanose }
							},
							for $font in array:flatten($majorOtherFonts)
							return element a:font {
								attribute script { $font('script') },
								attribute typeface { $font('typeface') }
							}
						},
						element a:minorFont {
							element a:latin {
								attribute typeface { $minorFontLatinTypeface },
								attribute panose { $minorFontLatinPanose }
							},
							for $font in array:flatten($minorOtherFonts)
								return element a:font {
								attribute script { $font('script') },
								attribute typeface { $font('typeface') }
							}
						}
					}
				}
			}</a:theme>`,
			{
				majorFontLatinTypeface:
					this.fontScheme.majorFont.latinFont.typeface,
				majorFontLatinPanose:
					this.fontScheme.majorFont.latinFont.panose,
				majorOtherFonts: this.fontScheme.majorFont.otherFonts,
				minorFontLatinTypeface:
					this.fontScheme.minorFont.latinFont.typeface,
				minorFontLatinPanose:
					this.fontScheme.minorFont.latinFont.panose,
				minorOtherFonts: this.fontScheme.minorFont.otherFonts,
			},
			true
		);
	}

	public static fromDom(dom: Document, location: string): Promise<ThemeXml> {
		const fontScheme = evaluateXPathToMap<FontScheme>(
			`
		./${QNS.a}theme/${QNS.a}themeElements/${QNS.a}fontScheme/map {
			"majorFont": map {
				"latinFont": map {
					"typeface": ${QNS.a}majorFont/${QNS.a}latin/@typeface/string(),
					"panose":  ${QNS.a}majorFont/${QNS.a}latin/@panose/string()
				},
				"otherFonts": array{${QNS.a}majorFont/${QNS.a}font/map { "script": @script/string(), "typeface": @typeface/string()}}
			},
			"minorFont": map {
				"latinFont": map {
					"typeface": ${QNS.a}minorFont/${QNS.a}latin/@typeface/string(),
					"panose": ${QNS.a}minorFont/${QNS.a}latin/@panose/string()
				},
				"otherFonts": array{${QNS.a}minorFont/${QNS.a}font/map { "script": @script/string(), "typeface": @typeface/string()}}
			}
		}`,
			dom
		);
		const newTheme = new ThemeXml(location);
		newTheme.setFontScheme(fontScheme);
		return Promise.resolve(newTheme);
	}

	/**
	 * Instantiate this class by looking at the DOCX XML for it.
	 */
	public static override async fromArchive(
		archive: Archive,
		location?: string
	): Promise<ThemeXml> {
		// If a location is supplied, use that, otherwise use the default location for theme files.
		location = location ?? 'word/theme/theme1.xml';
		const themeDocument = await archive.readXml(location);
		return this.fromDom(themeDocument!, location);
	}
}
