import namespaces from '../namespaces';

const relsXML = `
    <?xml version="1.0" encoding="UTF-8" standalone="yes"?>

    <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
        <Relationship Id="rId1" Type="${namespaces.officeDocumentRelation}" Target="word/document.xml"/>
        <Relationship Id="rId2" Type="${namespaces.corePropertiesRelation}" Target="docProps/core.xml"/>
    </Relationships>
`;

export default relsXML;
