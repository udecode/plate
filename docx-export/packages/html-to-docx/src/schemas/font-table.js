import namespaces from '../namespaces';

// Font data available here: https://fossies.org/linux/pandoc/data/docx/word/fontTable.xml
const fontTableXML = `
    <?xml version="1.0" encoding="UTF-8" standalone="yes"?>

    <w:fonts
      xmlns:r="${namespaces.r}"
      xmlns:w="${namespaces.w}"
      >
        <w:font w:name="Arial">
            <w:panose1 w:val="020B0604020202020204"/>
            <w:charset w:val="00"/>
            <w:family w:val="auto"/>
            <w:pitch w:val="variable"/>
            <w:sig w:usb0="00000003" w:usb1="00000000" w:usb2="00000000" w:usb3="00000000" w:csb0="00000001" w:csb1="00000000"/>
        </w:font>
        <w:font w:name="Calibri">
            <w:panose1 w:val="020F0502020204030204"/>
            <w:charset w:val="00"/>
            <w:family w:val="swiss"/>
            <w:pitch w:val="variable"/>
            <w:sig w:usb0="E4002EFF" w:usb1="C000247B" w:usb2="00000009" w:usb3="00000000" w:csb0="000001FF" w:csb1="00000000"/>
        </w:font>
        <w:font w:name="Calibri Light">
            <w:panose1 w:val="020F0302020204030204"/>
            <w:charset w:val="00"/>
            <w:family w:val="swiss"/>
            <w:pitch w:val="variable"/>
            <w:sig w:usb0="E4002EFF" w:usb1="C000247B" w:usb2="00000009" w:usb3="00000000" w:csb0="000001FF" w:csb1="00000000"/>
        </w:font>
        <w:font w:name="Courier New">
            <w:panose1 w:val="02070309020205020404"/>
            <w:charset w:val="00"/>
            <w:family w:val="auto"/>
            <w:pitch w:val="variable"/>
            <w:sig w:usb0="00000003" w:usb1="00000000" w:usb2="00000000" w:usb3="00000000" w:csb0="00000001" w:csb1="00000000"/>
        </w:font>
        <w:font w:name="Symbol">
            <w:panose1 w:val="05050102010706020507"/>
            <w:charset w:val="02"/>
            <w:family w:val="decorative"/>
            <w:pitch w:val="variable"/>
            <w:sig w:usb0="00000000" w:usb1="10000000" w:usb2="00000000" w:usb3="00000000" w:csb0="80000000" w:csb1="00000000"/>
        </w:font>
        <w:font w:name="Times New Roman">
            <w:panose1 w:val="02020603050405020304"/>
            <w:charset w:val="00"/>
            <w:family w:val="roman"/>
            <w:pitch w:val="variable"/>
            <w:sig w:usb0="E0002EFF" w:usb1="C000785B" w:usb2="00000009" w:usb3="00000000" w:csb0="000001FF" w:csb1="00000000"/>
        </w:font>
    </w:fonts>
`;

export default fontTableXML;
