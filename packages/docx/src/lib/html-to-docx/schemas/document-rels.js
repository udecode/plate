import namespaces from '../namespaces';

const documentRelsXML = `
  <?xml version="1.0" encoding="UTF-8" standalone="yes"?>

  <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
    <Relationship Id="rId1" Type="${namespaces.numbering}" Target="numbering.xml"/>
    <Relationship Id="rId2" Type="${namespaces.styles}" Target="styles.xml"/>
    <Relationship Id="rId3" Type="${namespaces.settingsRelation}" Target="settings.xml"/>
    <Relationship Id="rId4" Type="${namespaces.webSettingsRelation}" Target="webSettings.xml"/>
    <Relationship Id="rId5" Type="${namespaces.fontTable}" Target="fontTable.xml"/>
  </Relationships>
`;

export default documentRelsXML;
