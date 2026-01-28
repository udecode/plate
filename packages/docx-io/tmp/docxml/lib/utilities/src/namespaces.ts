export const NamespaceUri = {
	aink: 'http://schemas.microsoft.com/office/drawing/2016/ink',
	am3d: 'http://schemas.microsoft.com/office/drawing/2017/model3d',
	cx: 'http://schemas.microsoft.com/office/drawing/2014/chartex',
	cx1: 'http://schemas.microsoft.com/office/drawing/2015/9/8/chartex',
	cx2: 'http://schemas.microsoft.com/office/drawing/2015/10/21/chartex',
	cx3: 'http://schemas.microsoft.com/office/drawing/2016/5/9/chartex',
	cx4: 'http://schemas.microsoft.com/office/drawing/2016/5/10/chartex',
	cx5: 'http://schemas.microsoft.com/office/drawing/2016/5/11/chartex',
	cx6: 'http://schemas.microsoft.com/office/drawing/2016/5/12/chartex',
	cx7: 'http://schemas.microsoft.com/office/drawing/2016/5/13/chartex',
	cx8: 'http://schemas.microsoft.com/office/drawing/2016/5/14/chartex',
	m: 'http://schemas.openxmlformats.org/officeDocument/2006/math',
	mc: 'http://schemas.openxmlformats.org/markup-compatibility/2006',
	o: 'urn:schemas-microsoft-com:office:office',
	oel: 'http://schemas.microsoft.com/office/2019/extlst',
	op: 'http://schemas.openxmlformats.org/officeDocument/2006/custom-properties',
	r: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
	v: 'urn:schemas-microsoft-com:vml',
	vt: 'http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes',
	w: 'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
	w10: 'urn:schemas-microsoft-com:office:word',
	w14: 'http://schemas.microsoft.com/office/word/2010/wordml',
	w15: 'http://schemas.microsoft.com/office/word/2012/wordml',
	w16: 'http://schemas.microsoft.com/office/word/2018/wordml',
	w16cex: 'http://schemas.microsoft.com/office/word/2018/wordml/cex',
	w16cid: 'http://schemas.microsoft.com/office/word/2016/wordml/cid',
	w16sdtdh:
		'http://schemas.microsoft.com/office/word/2020/wordml/sdtdatahash',
	w16se: 'http://schemas.microsoft.com/office/word/2015/wordml/symex',
	wne: 'http://schemas.microsoft.com/office/word/2006/wordml',
	wp: 'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing',
	wp14: 'http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing',
	wpc: 'http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas',
	wpg: 'http://schemas.microsoft.com/office/word/2010/wordprocessingGroup',
	wpi: 'http://schemas.microsoft.com/office/word/2010/wordprocessingInk',
	wps: 'http://schemas.microsoft.com/office/word/2010/wordprocessingShape',

	// Documents
	relationshipsDocument:
		'http://schemas.openxmlformats.org/package/2006/relationships',
	contentTypesDocument:
		'http://schemas.openxmlformats.org/package/2006/content-types',
	cp: 'http://schemas.openxmlformats.org/package/2006/metadata/core-properties',
	dc: 'http://purl.org/dc/elements/1.1/',
	dcterms: 'http://purl.org/dc/terms/',
	dcmitype: 'http://purl.org/dc/dcmitype/',
	xsi: 'http://www.w3.org/2001/XMLSchema-instance',

	// Drawings/images
	a: 'http://schemas.openxmlformats.org/drawingml/2006/main',
	asvg: 'http://schemas.microsoft.com/office/drawing/2016/SVG/main',
	a14: 'http://schemas.microsoft.com/office/drawing/2010/main',
	pic: 'http://schemas.openxmlformats.org/drawingml/2006/picture',
};

/**
 * A helper object containing the "Q{https://…}" notation of each namespace. Makes writing queries
 * a lot less verbose.
 *
 * For example;
 *   const query = `/${QNS.w}document`;
 *   // "/Q{https://…}document"
 */
export const QNS = Object.keys(NamespaceUri).reduce<
	Record<keyof typeof NamespaceUri, string>
>(
	(map: Record<keyof typeof NamespaceUri, string>, prefix) => ({
		...map,
		[prefix]: `Q{${NamespaceUri[prefix as keyof typeof NamespaceUri]}}`,
	}),
	{} as Record<keyof typeof NamespaceUri, string>
);

export const ALL_NAMESPACE_DECLARATIONS = Object.keys(NamespaceUri)
	.map(
		(prefix) =>
			`xmlns:${prefix}="${
				NamespaceUri[prefix as keyof typeof NamespaceUri]
			}"`
	)
	.join(' ');
