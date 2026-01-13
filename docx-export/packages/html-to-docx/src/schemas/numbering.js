import namespaces from '../namespaces';

const generateNumberingXMLTemplate = () => `
        <?xml version="1.0" encoding="UTF-8" standalone="yes"?>

        <w:numbering
        xmlns:w="${namespaces.w}"
        xmlns:ve="${namespaces.ve}"
        xmlns:o="${namespaces.o}"
        xmlns:r="${namespaces.r}"
        xmlns:v="${namespaces.v}"
        xmlns:wp="${namespaces.wp}"
        xmlns:w10="${namespaces.w10}"
        xmlns:wne="${namespaces.wne}">
        </w:numbering>
    `;

export default generateNumberingXMLTemplate;
