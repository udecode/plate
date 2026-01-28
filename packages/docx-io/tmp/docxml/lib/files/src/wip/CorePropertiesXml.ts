import type { Archive } from '../../../classes/src/Archive.ts';
import { XmlFile } from '../../../classes/src/XmlFile.ts';
import { FileMime } from '../../../enums.ts';
import { create } from '../../../utilities/src/dom.ts';
import { ALL_NAMESPACE_DECLARATIONS } from '../../../utilities/src/namespaces.ts';
import { evaluateXPathToArray } from '../../../utilities/src/xquery.ts';

export class CorePropertiesXml extends XmlFile {
	public static override contentType = FileMime.coreProperties;

	public created: Date = new Date();
	public creator: string | null = null;
	public description: string | null = null;
	public keywords: string[] = [];
	public lastModifiedBy: string | null = null;
	public modified: Date = new Date();
	public revision = 1;
	public subject: string | null = null;
	public title: string | null = null;

	public constructor(location: string) {
		super(location);
	}

	public override toNode(): Document {
		return create(
			`
				<cp:coreProperties ${ALL_NAMESPACE_DECLARATIONS}>
					<dc:title>{ $title }</dc:title>
					<dc:subject>{ $subject }</dc:subject>
					<dc:creator>{ $creator }</dc:creator>
					<cp:keywords>{ $keywords }</cp:keywords>
					<dc:description>{ $description }</dc:description>
					<cp:lastModifiedBy>{ $lastModifiedBy }</cp:lastModifiedBy>
					<cp:revision>{ $revision }</cp:revision>
					<dcterms:created xsi:type="dcterms:W3CDTF">{ $created }</dcterms:created>
					<dcterms:modified xsi:type="dcterms:W3CDTF">{ $modified }</dcterms:modified>
				</cp:coreProperties>
			`,
			{
				title: this.title,
				subject: this.subject,
				creator: this.creator,
				keywords: this.keywords.join(' '),
				description: this.description,
				lastModifiedBy: this.lastModifiedBy,
				revision: this.revision,
				created: this.created.toISOString(),
				modified: this.modified.toISOString(),
			},
			true
		);
	}

	/**
	 * Instantiate this class by looking at the DOCX XML for it.
	 */
	public static override async fromArchive(
		archive: Archive,
		location: string
	): Promise<CorePropertiesXml> {
		const dom = await archive.readXml(location);
		const instance = new CorePropertiesXml(location);
		Object.assign(
			instance,
			evaluateXPathToArray(
				`
				array{/*/Override/map{
					"partName": string(@PartName),
					"contentType": string(@ContentType)
				}}
			`,
				dom
			)
		);
		return instance;
	}
}
