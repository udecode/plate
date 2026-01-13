import namespaces from '../namespaces';

const settingsXML = `
    <?xml version="1.0" encoding="UTF-8" standalone="yes"?>

    <w:settings xmlns:w="${namespaces.w}" xmlns:o="${namespaces.o}" xmlns:r="${namespaces.r}" xmlns:v="${namespaces.v}" xmlns:w10="${namespaces.w10}" xmlns:sl="${namespaces.sl}">
        <w:zoom w:percent="100"/>
        <w:defaultTabStop w:val="720"/>
        <w:decimalSymbol w:val="."/>
        <w:listSeparator w:val=","/>
    </w:settings>
`;

export default settingsXML;
