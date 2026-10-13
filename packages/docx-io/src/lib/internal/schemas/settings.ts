import namespaces from '../namespaces';

/**
 * `doNotExpandShiftReturn` keeps a justified line that ends with a line break unstretched, as browsers render a
 * `<br>`; Word otherwise spreads its words across the whole width. It applies to the whole document.
 */
const settingsXML: string = `
    <?xml version="1.0" encoding="UTF-8" standalone="yes"?>

    <w:settings xmlns:w="${namespaces.w}" xmlns:o="${namespaces.o}" xmlns:r="${namespaces.r}" xmlns:v="${namespaces.v}" xmlns:w10="${namespaces.w10}" xmlns:sl="${namespaces.sl}">
        <w:zoom w:percent="100"/>
        <w:defaultTabStop w:val="720"/>
        <w:compat>
            <w:doNotExpandShiftReturn/>
        </w:compat>
        <w:decimalSymbol w:val="."/>
        <w:listSeparator w:val=","/>
    </w:settings>
`;

export default settingsXML;
