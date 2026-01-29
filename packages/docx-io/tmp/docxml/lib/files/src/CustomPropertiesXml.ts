import type { Archive } from '../../classes/src/Archive.ts';
import { NumberMap } from '../../classes/src/NumberMap.ts';
import { XmlFile } from '../../classes/src/XmlFile.ts';
import { FileMime } from '../../enums.ts';
import { create } from '../../utilities/src/dom.ts';
import {
	ALL_NAMESPACE_DECLARATIONS,
	NamespaceUri,
	QNS,
} from '../../utilities/src/namespaces.ts';
import { evaluateXPathToArray } from '../../utilities/src/xquery.ts';

export enum CustomPropertyType {
	Text = 'lpwstr',
	Number = 'i4',
	Date = 'filetime',
	Boolean = 'bool',
}

type CustomProperty = {
	type: CustomPropertyType;
	name: string;
	value: string | number | boolean;
};

export class CustomPropertiesXml extends XmlFile {
	public static override contentType = FileMime.customProperties;

	private readonly properties = new NumberMap<CustomProperty>(2);

	public constructor(location: string) {
		super(location);
	}

	public values(): Array<CustomProperty> {
		return Array.from(this.properties.values());
	}

	public override toNode(): Document {
		return create(
			`
				<op:Properties ${ALL_NAMESPACE_DECLARATIONS}>
					{
						for $prop in array:flatten($properties)
							return <op:property fmtid="{$fmtid}" pid="{$prop('key')}" name="{$prop('name')}">
								{
									element { QName("${NamespaceUri.vt}", $prop('type')) } { $prop('value') }
								}
							</op:property>
					}
				</op:Properties>
			`,
			{
				properties: Array.from(this.properties.entries()).map(
					([key, data]) => ({
						key: String(key),
						type: data.type,
						name: data.name,
						value: String(data.value),
					})
				),
				// For some reason, this identifier is always the same;
				fmtid: '{D5CDD505-2E9C-101B-9397-08002B2CF9AE}',
			},
			true
		);
	}

	public override isEmpty(): boolean {
		return !this.properties.size;
	}

	public add(name: Array<CustomProperty>): void;
	public add(
		name: string,
		type: CustomPropertyType,
		value: string | number | boolean
	): void;
	public add(
		nameOrMultiple: Array<CustomProperty> | string,
		type?: CustomPropertyType,
		value?: string | number | boolean
	): void {
		if (Array.isArray(nameOrMultiple)) {
			nameOrMultiple.forEach((property) => this.properties.add(property));
		} else {
			if (type === undefined || value === undefined) {
				throw new Error('Bad input');
			}
			this.properties.add({ name: nameOrMultiple, type, value });
		}
	}

	/**
	 * Instantiate this class by looking at the DOCX XML for it.
	 */
	public static override async fromArchive(
		archive: Archive,
		location: string
	): Promise<CustomPropertiesXml> {
		const dom = await archive.readXml(location);
		const instance = new CustomPropertiesXml(location);
		evaluateXPathToArray(
			`
				array{/*/${QNS.op}property/map{
					"type": fn:local-name(./*[1]),
					"name": string(@name),
					"value": string(./*)
				}}
			`,
			dom
		).forEach(({ name, type, value }) => instance.add(name, type, value));
		return instance;
	}
}
