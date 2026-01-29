/**
 * Values that can be used as `uri` attributes of DrawingML ExtensionList children.
 * @see {@link https://learn.microsoft.com/en-us/dotnet/api/documentformat.openxml.drawing.extensionlist?view=openxml-2.8.1}
 */
export const extensionListUris = {
	/** @see {@link https://learn.microsoft.com/en-us/dotnet/api/documentformat.openxml.office2010.drawing.uselocaldpi?view=openxml-2.8.1} */
	useLocalDpi: '{28A0092B-C50C-407E-A947-70E740481C1C}',

	/**
	 * Unfortunately this URI is not documented. There is also no official name
	 * for the extension it represents so we just call it 'svg'.
	 */
	svg: '{96DAC541-7B7A-43D3-8B79-37D633B846F1}',
};
