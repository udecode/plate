import { basename, dirname } from '@util-path';

import type { ContentTypesXml, Length } from '../../../mod.ts';
import type { Archive } from '../../classes/src/Archive.ts';
import { XmlFileWithContentTypes } from '../../classes/src/XmlFile.ts';
import type { FootnoteProps } from '../../components/document/src/FootnoteReference.ts';
import { FileMime, RelationshipType } from '../../enums.ts';
import { create } from '../../utilities/src/dom.ts';
import { twip } from '../../utilities/src/length.ts';
import {
	ALL_NAMESPACE_DECLARATIONS,
	QNS,
} from '../../utilities/src/namespaces.ts';
import {
	evaluateXPathToMap,
	evaluateXPathToNumber,
} from '../../utilities/src/xquery.ts';
import { type File, RelationshipsXml } from './RelationshipsXml.ts';

export type SettingsI = {
	isTrackChangesEnabled: boolean;
	/**
	 * When set to `true`, the file will use different headers between odd and even pages, or leave them
	 * empty. When set to `false`, odd and even pages will get the same header (the one set for "odd").
	 *
	 * Defaults to `false`
	 */
	evenAndOddHeaders: boolean;

	attachedTemplate: string | null;

	defaultTabStop: Length | null;

	footnoteProperties?: FootnoteProps | null;
};

const DEFAULT_SETTINGS: SettingsI = {
	isTrackChangesEnabled: false,
	evenAndOddHeaders: false,
	attachedTemplate: null,
	defaultTabStop: null,
	footnoteProperties: null,
};

enum SettingType {
	Length,
	OnOff,
	Relationship,
	Formatting,
}

type SettingMeta =
	| {
			docxmlName: keyof SettingsI;
			ooxmlLocalName: string;
			ooxmlType: SettingType.Length;
	  }
	| {
			docxmlName: keyof SettingsI;
			ooxmlLocalName: string;
			ooxmlType: SettingType.OnOff;
	  }
	| {
			docxmlName: keyof SettingsI;
			ooxmlLocalName: string;
			ooxmlType: SettingType.Formatting;
	  }
	| {
			docxmlName: keyof SettingsI;
			ooxmlLocalName: string;
			ooxmlType: SettingType.Relationship;
			ooxmlRelationshipType: RelationshipType;
	  };
const settingsMeta: Array<SettingMeta> = [
	{
		docxmlName: 'isTrackChangesEnabled',
		ooxmlLocalName: 'trackRevisions',
		ooxmlType: SettingType.OnOff,
	},
	{
		docxmlName: 'evenAndOddHeaders',
		ooxmlLocalName: 'evenAndOddHeaders',
		ooxmlType: SettingType.OnOff,
	},
	{
		docxmlName: 'attachedTemplate',
		ooxmlLocalName: 'attachedTemplate',
		ooxmlType: SettingType.Relationship,
		ooxmlRelationshipType: RelationshipType.attachedTemplate,
	},
	{
		docxmlName: 'defaultTabStop',
		ooxmlLocalName: 'defaultTabStop',
		ooxmlType: SettingType.Length,
	},
	{
		docxmlName: 'footnoteProperties',
		ooxmlLocalName: 'footnotePr',
		ooxmlType: SettingType.Formatting,
	},
];

export class SettingsXml extends XmlFileWithContentTypes {
	public static override contentType = FileMime.settings;

	public readonly relationships: RelationshipsXml;

	#props: SettingsI;

	public constructor(
		location: string,
		relationships: RelationshipsXml = new RelationshipsXml(
			`${dirname(location)}/_rels/${basename(location)}.rels`
		),
		settings: Partial<SettingsI> = {}
	) {
		super(location);
		this.relationships = relationships;
		this.#props = Object.assign({}, DEFAULT_SETTINGS, settings);
	}

	/**
	 * Set a setting.
	 */
	public set<Key extends keyof SettingsI>(
		key: Key,
		value: SettingsI[Key]
	): void {
		const meta = settingsMeta.find((meta) => meta.docxmlName === key);
		if (!meta) {
			throw new Error(`Unsupported setting "${key}"`);
		}
		if (meta.ooxmlType === SettingType.Relationship) {
			this.#props[key] = value
				? (this.relationships.add(
						meta.ooxmlRelationshipType,
						value as string
				  ) as SettingsI[Key])
				: value;
		} else {
			this.#props[key] = value;
		}
	}

	/**
	 * Get a setting.
	 */
	public get<Key extends keyof SettingsI>(key: Key): SettingsI[Key] {
		const meta = settingsMeta.find((meta) => meta.docxmlName === key);
		if (!meta) {
			throw new Error(`Unsupported setting "${key}"`);
		}
		if (meta.ooxmlType === SettingType.Relationship) {
			return this.#props[key]
				? (this.relationships.getTarget(
						this.#props[key] as string
				  ) as SettingsI[Key])
				: (this.#props[key] as SettingsI[Key]);
		} else {
			return this.#props[key];
		}
	}

	/**
	 * Returns a list of setting key values (similar to `Object.entries`). Useful for cloning these
	 * settings into a new instance.
	 */
	public entries(): Array<[keyof SettingsI, SettingsI[keyof SettingsI]]> {
		return Object.keys(this.#props).map((key) => [
			key,
			this.get(key as keyof SettingsI),
		]) as Array<[keyof SettingsI, SettingsI[keyof SettingsI]]>;
	}

	protected override toNode(): Document {
		// Notice the two footnote elements. MSWord needs those there so it can display the horizontal separator line.
		return create(
			`<w:settings ${ALL_NAMESPACE_DECLARATIONS}>
				{
					if ($isTrackChangesEnabled) then element ${QNS.w}trackRevisions {
						(: attribute ${QNS.w}val { $isTrackChangesEnabled } :)
					} else (),
					if ($evenAndOddHeaders) then element ${QNS.w}evenAndOddHeaders {
						attribute ${QNS.w}val { $evenAndOddHeaders }
					} else (),
					if ($attachedTemplate) then element ${QNS.w}attachedTemplate {
						attribute ${QNS.r}id { $attachedTemplate }
					} else (),
					if (exists($footnoteProperties)) then (
						element ${QNS.w}footnotePr {
							element ${QNS.w}numFmt { 
								attribute ${QNS.w}val { $footnoteProperties('numberingFormat')}
							}, 
							element ${QNS.w}pos{ 
								attribute ${QNS.w}val { $footnoteProperties('position')}
							}, 
							element ${QNS.w}numRestart { 
								attribute ${QNS.w}val { $footnoteProperties('restart')}
							},
							element ${QNS.w}footnote { 
								attribute ${QNS.w}id { -1 }
							},
							element ${QNS.w}footnote { 
								attribute ${QNS.w}id { 0 }
							}
						}
					) else (), 
					${
						this.#props.defaultTabStop
							? `
						element ${QNS.w}defaultTabStop {
							attribute ${QNS.w}val { map:get($defaultTabStop, 'twip') }
						}`
							: '()'
					}
				}
			</w:settings>`,
			this.#props,
			true
		);
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
	 * Instantiate this class by looking at the DOCX XML for it.
	 */
	public static override async fromArchive(
		archive: Archive,
		contentTypes: ContentTypesXml,
		location: string
	): Promise<SettingsXml> {
		let relationships;

		const relationshipsLocation = `${dirname(location)}/_rels/${basename(
			location
		)}.rels`;
		try {
			relationships = await RelationshipsXml.fromArchive(
				archive,
				contentTypes,
				relationshipsLocation
			);
		} catch (_error: unknown) {
			// console.error(
			// 	'Warning, relationships could not be resolved\n' +
			// 		((error as Error).stack || (error as Error).message),
			// );
		}

		const xml = await archive.readXml(location);

		const settings = evaluateXPathToMap<SettingsI>(
			`/${QNS.w}settings/map {
				"isTrackChangesEnabled": docxml:ct-on-off(./${QNS.w}trackChanges),
				"evenAndOddHeaders": docxml:ct-on-off(./${QNS.w}evenAndOddHeaders)
			}`,
			xml
		);

		const defaultTabStopTwips = evaluateXPathToNumber(
			`number(/*/${QNS.w}defaultTabStop/@${QNS.w}val)`,
			xml
		);
		if (defaultTabStopTwips !== null) {
			settings.defaultTabStop = twip(defaultTabStopTwips);
		}

		return new SettingsXml(
			location,
			relationships || new RelationshipsXml(relationshipsLocation),
			settings
		);
	}
}
