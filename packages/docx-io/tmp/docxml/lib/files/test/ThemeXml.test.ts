import { expect } from 'std/expect';
import { describe, it } from 'std/testing/bdd';
import { Archive } from '../../classes/src/Archive.ts';
import { parse, serialize } from '../../utilities/src/dom.ts';
import {
	ThemeXml,
	type Font,
	type FontScheme,
	type LatinFont,
} from '../src/ThemeXml.ts';

describe('Themes', () => {
	it('Throws an error when the archive is unreadable', () => {
		const fakeArchive = new Archive();
		expect(ThemeXml.fromArchive(fakeArchive, undefined)).rejects.toThrow();
	});

	it('Serializes implemented theme elements correctly', async () => {
		const fakeThemeXml = `<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
			<a:themeElements>
				<a:fontScheme>
					<a:majorFont>
						<a:latin typeface="Calibri Light" panose="020F0302020204030204"/>
						<a:font script="Jpan" typeface="Light"/>
						<a:font script="Hang" typeface="this"/>
					</a:majorFont>
					<a:minorFont>
						<a:latin typeface="Calibri" panose="020F0502020204030204"/>
						<a:font script="Jpan" typeface="this"/>
						<a:font script="Hang" typeface="this"/>
					</a:minorFont>
				</a:fontScheme>
			</a:themeElements>
		</a:theme>`;
		const fakeThemeDocument = parse(fakeThemeXml);
		const themeXml = await ThemeXml.fromDom(
			fakeThemeDocument,
			'fakelocation'
		);
		const testFontScheme: FontScheme = {
			majorFont: {
				latinFont: {
					typeface: 'Calibri Light',
					panose: '020F0302020204030204',
				} as LatinFont,
				otherFonts: [
					{
						script: 'Jpan',
						typeface: 'Light',
					} as Font,
					{
						script: 'Hang',
						typeface: 'this',
					} as Font,
				],
			},
			minorFont: {
				latinFont: {
					typeface: 'Calibri',
					panose: '020F0502020204030204',
				} as LatinFont,
				otherFonts: [
					{
						script: 'Jpan',
						typeface: 'this',
					} as Font,
					{
						script: 'Hang',
						typeface: 'this',
					} as Font,
				],
			},
		};
		expect(themeXml.fontScheme).toEqual(testFontScheme);
		expect(serialize(themeXml.toNode())).toEqual(
			fakeThemeXml.replace(/\n|\t/g, '')
		);
	});
});
