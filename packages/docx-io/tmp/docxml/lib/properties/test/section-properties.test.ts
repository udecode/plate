import { describe } from 'std/testing/bdd';

import { twip } from '../../utilities/src/length.ts';
import { ALL_NAMESPACE_DECLARATIONS } from '../../utilities/src/namespaces.ts';
import {
	createObjectRoundRobinTest,
	createXmlRoundRobinTest,
} from '../../utilities/src/tests.ts';
import {
	type SectionProperties,
	sectionPropertiesFromNode,
	sectionPropertiesToNode,
} from '../src/section-properties.ts';

const test = createXmlRoundRobinTest<SectionProperties>(
	sectionPropertiesFromNode,
	sectionPropertiesToNode
);

const reverseTest = createObjectRoundRobinTest<SectionProperties>(
	sectionPropertiesToNode,
	sectionPropertiesFromNode
);

const date = new Date();

describe('Section formatting', () => {
	test(
		`<w:sectPr ${ALL_NAMESPACE_DECLARATIONS}>
			<w:pgSz
				w:w="1200"
				w:h="1600"
				w:orient="landscape"
			/>
			<w:pgMar
				w:top="1000"
				w:right="1000"
				w:bottom="1000"
				w:left="1000"
				w:header="1000"
				w:footer="1000"
				w:gutter="1000"
			/>
		</w:sectPr>`,
		{
			pageWidth: twip(1200),
			pageHeight: twip(1600),
			pageOrientation: 'landscape',
			pageMargin: {
				top: twip(1000),
				right: twip(1000),
				bottom: twip(1000),
				left: twip(1000),
				header: twip(1000),
				footer: twip(1000),
				gutter: twip(1000),
			},
		}
	);
});

describe('Section property change', () => {
	// Node with id, author and date
	test(
		`<w:sectPr ${ALL_NAMESPACE_DECLARATIONS}>
			<w:pgSz w:orient="portrait"/>
			<w:sectPrChange w:id="0" w:author="Gabe" w:date="${date.toISOString()}">
				<w:sectPr>
					<w:pgSz w:orient="portrait" w:w="12240" w:h="15840" /> 
				</w:sectPr>
			</w:sectPrChange> 
		</w:sectPr>`,
		{
			pageOrientation: 'portrait',
			change: {
				id: 0,
				author: 'Gabe',
				date: date,
				pageWidth: twip(12240),
				pageHeight: twip(15840),
			},
		}
	);

	// Node with id and date, but without author
	test(
		`<w:sectPr ${ALL_NAMESPACE_DECLARATIONS}>
				<w:pgSz w:orient="portrait"/>
				<w:sectPrChange w:id="0" w:date="${date.toISOString()}">
					<w:sectPr>
						<w:pgSz w:orient="portrait" w:w="12240" w:h="15840" /> 
					</w:sectPr>
				</w:sectPrChange> 
			</w:sectPr>`,
		{
			pageOrientation: 'portrait',
			change: {
				id: 0,
				date: date,
				pageWidth: twip(12240),
				pageHeight: twip(15840),
			},
		}
	);
	// Node with id and author, but without date
	test(
		`<w:sectPr ${ALL_NAMESPACE_DECLARATIONS}>
			<w:pgSz w:orient="portrait"/>
			<w:sectPrChange w:id="0" w:author="Gabe">
				<w:sectPr>
					<w:pgSz w:orient="portrait" w:w="12240" w:h="15840" /> 
				</w:sectPr>
			</w:sectPrChange> 
		</w:sectPr>`,
		{
			pageOrientation: 'portrait',
			change: {
				id: 0,
				author: 'Gabe',
				pageWidth: twip(12240),
				pageHeight: twip(15840),
			},
		}
	);

	// Node with id, but without date and author
	test(
		`<w:sectPr ${ALL_NAMESPACE_DECLARATIONS}>
				<w:pgSz w:orient="portrait"/>
				<w:sectPrChange w:id="0">
					<w:sectPr>
						<w:pgSz w:orient="portrait" w:w="12240" w:h="15840" /> 
					</w:sectPr>
				</w:sectPrChange> 
			</w:sectPr>`,
		{
			pageOrientation: 'portrait',
			change: {
				id: 0,
				pageWidth: twip(12240),
				pageHeight: twip(15840),
			},
		}
	);
});

describe('Section column formatting for equally sized columns', () => {
	test(
		`<w:sectPr ${ALL_NAMESPACE_DECLARATIONS}>
			<w:cols w:num="3" w:equalWidth="1" w:sep="0" w:space="720"/>
		</w:sectPr>`,
		{
			columns: {
				numberOfColumns: 3,
				equalWidth: true,
				separator: false,
				columnSpace: twip(720),
				columnDefs: [],
			},
		}
	);
});

describe('Section breaks', () => {
	test(
		`<w:sectPr ${ALL_NAMESPACE_DECLARATIONS}>
			<w:type w:val="nextPage" />
		</w:sectPr>`,
		{
			pageBreakType: 'nextPage',
		}
	);
	test(
		`<w:sectPr ${ALL_NAMESPACE_DECLARATIONS}>
			<w:type w:val="nextColumn" />
		</w:sectPr>`,
		{
			pageBreakType: 'nextColumn',
		}
	);
	test(
		`<w:sectPr ${ALL_NAMESPACE_DECLARATIONS}>
			<w:type w:val="oddPage" />
		</w:sectPr>`,
		{
			pageBreakType: 'oddPage',
		}
	);
	test(
		`<w:sectPr ${ALL_NAMESPACE_DECLARATIONS}>
			<w:type w:val="evenPage" />
		</w:sectPr>`,
		{
			pageBreakType: 'evenPage',
		}
	);
	test(
		`<w:sectPr ${ALL_NAMESPACE_DECLARATIONS}>
			<w:type w:val="continuous" />
		</w:sectPr>`,
		{
			pageBreakType: 'continuous',
		}
	);

	reverseTest(
		{
			pageBreakType: 'evenPage',
		},
		`<w:sectPr ${ALL_NAMESPACE_DECLARATIONS}>
			<w:type w:val='evenPage' />
		</w:sectPr>
		`
	);
	reverseTest(
		{
			pageBreakType: 'oddPage',
		},
		`<w:sectPr ${ALL_NAMESPACE_DECLARATIONS}>
			<w:type w:val='oddPage' />
		</w:sectPr>
		`
	);
	reverseTest(
		{
			pageBreakType: 'nextColumn',
		},
		`<w:sectPr ${ALL_NAMESPACE_DECLARATIONS}>
			<w:type w:val='nextColumn' />
		</w:sectPr>
		`
	);
	reverseTest(
		{
			pageBreakType: 'continuous',
		},
		`<w:sectPr ${ALL_NAMESPACE_DECLARATIONS}>
			<w:type w:val='continuous' />
		</w:sectPr>
		`
	);
	reverseTest(
		{
			pageBreakType: 'nextPage',
		},
		`<w:sectPr ${ALL_NAMESPACE_DECLARATIONS}>
			<w:type w:val='nextPage' />
		</w:sectPr>
		`
	);
});

describe('Section column formatting for differently sized columns', () => {
	test(
		`<w:sectPr ${ALL_NAMESPACE_DECLARATIONS}>
			<w:cols w:num="3" w:equalWidth="0" w:sep="1" w:space="720" >
				<w:col w:w="1440" w:space="720"/>
				<w:col w:w="1440" w:space="720" />
				<w:col w:w="2880" />
			</w:cols>
		</w:sectPr>`,
		{
			columns: {
				numberOfColumns: 3,
				equalWidth: false,
				separator: true,
				columnSpace: twip(720),
				columnDefs: [
					{ columnWidth: twip(1440), columnSpace: twip(720) },
					{ columnWidth: twip(1440), columnSpace: twip(720) },
					{ columnWidth: twip(2880) },
				],
			},
		}
	);
});

describe('Section column formatting for with missing properties', () => {
	reverseTest(
		{
			columns: {
				numberOfColumns: 3,
				equalWidth: true,
			},
		},
		`<w:sectPr ${ALL_NAMESPACE_DECLARATIONS}>
			<w:cols w:num="3" w:equalWidth="1" />
		</w:sectPr>`
	);

	reverseTest(
		{
			columns: {
				columnDefs: [
					{ columnWidth: twip(1440), columnSpace: twip(720) },
					{ columnWidth: twip(1440) },
				],
			},
		},
		`<w:sectPr ${ALL_NAMESPACE_DECLARATIONS}>
			<w:cols w:num="2" w:equalWidth="0">
				<w:col w:w="1440" w:space="720" />
				<w:col w:w="1440"/>
			</w:cols>
		</w:sectPr>`
	);
});

describe('Section header/footer references', () => {
	test(
		`<w:sectPr ${ALL_NAMESPACE_DECLARATIONS}>
			<w:headerReference r:id="test1" w:type="default" />
			<w:headerReference r:id="test2" w:type="first" />
			<w:headerReference r:id="test3" w:type="even" />
		</w:sectPr>`,
		{
			headers: {
				first: 'test2',
				even: 'test3',
				odd: 'test1',
			},
			footers: {
				first: null,
				even: null,
				odd: null,
			},
		}
	);
});

describe('Section titlePg', () => {
	test(
		`<w:sectPr ${ALL_NAMESPACE_DECLARATIONS}>
		</w:sectPr>`,
		{
			isTitlePage: false,
		}
	);
	test(
		`<w:sectPr ${ALL_NAMESPACE_DECLARATIONS}>
			<w:titlePg />
		</w:sectPr>`,
		{
			isTitlePage: true,
		}
	);
	test(
		`<w:sectPr ${ALL_NAMESPACE_DECLARATIONS}>
			<w:titlePg w:val="1" />
		</w:sectPr>`,
		{
			isTitlePage: true,
		}
	);
	test(
		`<w:sectPr ${ALL_NAMESPACE_DECLARATIONS}>
			<w:titlePg w:val="0" />
		</w:sectPr>`,
		{
			isTitlePage: false,
		}
	);
});
