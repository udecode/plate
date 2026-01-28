/**
 * @typedef {Object} CommentsXmlDefinitions
 * @property {Object} COMMENTS_XML_DEF - XML definition for the basic comments structure.
 * @property {Object} COMMENTS_EXTENDED_XML_DEF - XML definition for extended comments.
 * @property {Object} COMMENTS_EXTENSIBLE_XML_DEF - XML definition for extensible comments.
 * @property {Object} COMMENTS_IDS_XML_DEF - XML definition for comment identifiers.
 * @property {Object} DOCUMENT_RELS_XML_DEF - XML definition for document relationships.
 * @property {Object} PEOPLE_XML_DEF - XML definition for people-related information.
 * @property {Object} CONTENT_TYPES - XML definition for custom settings.
 */

export const DEFAULT_DOCX_DEFS = {
  'xmlns:wpc': 'http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas',
  'xmlns:cx': 'http://schemas.microsoft.com/office/drawing/2014/chartex',
  'xmlns:cx1': 'http://schemas.microsoft.com/office/drawing/2015/9/8/chartex',
  'xmlns:cx2': 'http://schemas.microsoft.com/office/drawing/2015/10/21/chartex',
  'xmlns:cx3': 'http://schemas.microsoft.com/office/drawing/2016/5/9/chartex',
  'xmlns:cx4': 'http://schemas.microsoft.com/office/drawing/2016/5/10/chartex',
  'xmlns:cx5': 'http://schemas.microsoft.com/office/drawing/2016/5/11/chartex',
  'xmlns:cx6': 'http://schemas.microsoft.com/office/drawing/2016/5/12/chartex',
  'xmlns:cx7': 'http://schemas.microsoft.com/office/drawing/2016/5/13/chartex',
  'xmlns:cx8': 'http://schemas.microsoft.com/office/drawing/2016/5/14/chartex',
  'xmlns:mc': 'http://schemas.openxmlformats.org/markup-compatibility/2006',
  'xmlns:aink': 'http://schemas.microsoft.com/office/drawing/2016/ink',
  'xmlns:am3d': 'http://schemas.microsoft.com/office/drawing/2017/model3d',
  'xmlns:o': 'urn:schemas-microsoft-com:office:office',
  'xmlns:oel': 'http://schemas.microsoft.com/office/2019/extlst',
  'xmlns:r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
  'xmlns:m': 'http://schemas.openxmlformats.org/officeDocument/2006/math',
  'xmlns:v': 'urn:schemas-microsoft-com:vml',
  'xmlns:wp14': 'http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing',
  'xmlns:wp': 'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing',
  'xmlns:w10': 'urn:schemas-microsoft-com:office:word',
  'xmlns:w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
  'xmlns:w14': 'http://schemas.microsoft.com/office/word/2010/wordml',
  'xmlns:w15': 'http://schemas.microsoft.com/office/word/2012/wordml',
  'xmlns:w16cex': 'http://schemas.microsoft.com/office/word/2018/wordml/cex',
  'xmlns:w16cid': 'http://schemas.microsoft.com/office/word/2016/wordml/cid',
  'xmlns:w16': 'http://schemas.microsoft.com/office/word/2018/wordml',
  'xmlns:w16du': 'http://schemas.microsoft.com/office/word/2023/wordml/word16du',
  'xmlns:w16sdtdh': 'http://schemas.microsoft.com/office/word/2020/wordml/sdtdatahash',
  'xmlns:w16sdtfl': 'http://schemas.microsoft.com/office/word/2024/wordml/sdtformatlock',
  'xmlns:w16se': 'http://schemas.microsoft.com/office/word/2015/wordml/symex',
  'xmlns:wpg': 'http://schemas.microsoft.com/office/word/2010/wordprocessingGroup',
  'xmlns:wpi': 'http://schemas.microsoft.com/office/word/2010/wordprocessingInk',
  'xmlns:wne': 'http://schemas.microsoft.com/office/word/2006/wordml',
  'xmlns:wps': 'http://schemas.microsoft.com/office/word/2010/wordprocessingShape',
  'mc:Ignorable': 'w14 w15 w16se w16cid w16 w16cex w16sdtdh w16sdtfl w16du wp14',
};

export const DEFAULT_CUSTOM_XML = {
  elements: [
    {
      type: 'element',
      name: 'Properties',
      attributes: {
        xmlns: 'http://schemas.openxmlformats.org/officeDocument/2006/custom-properties',
        'xmlns:vt': 'http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes',
      },
      elements: [],
    },
  ],
};

export const SETTINGS_CUSTOM_XML = {
  elements: [
    {
      type: 'element',
      name: 'w:settings',
      attributes: {
        'xmlns:w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
      },
      elements: [],
    },
  ],
};

export const COMMENT_REF = {
  type: 'element',
  name: 'w:r',
  elements: [
    {
      type: 'element',
      name: 'w:rPr',
      elements: [
        {
          type: 'element',
          name: 'w:rStyle',
          attributes: {
            'w:val': 'CommentReference',
          },
        },
      ],
    },
    {
      type: 'element',
      name: 'w:annotationRef',
    },
  ],
};

export const DEFAULT_LINKED_STYLES = {
  Normal: {
    type: 'element',
    name: 'w:style',
    attributes: {
      'w:type': 'paragraph',
      'w:default': '1',
      'w:styleId': 'Normal',
    },
    elements: [
      {
        type: 'element',
        name: 'w:name',
        attributes: {
          'w:val': 'Normal',
        },
      },
      {
        type: 'element',
        name: 'w:qFormat',
      },
    ],
  },
  Title: {
    type: 'element',
    name: 'w:style',
    attributes: {
      'w:type': 'paragraph',
      'w:styleId': 'Title',
    },
    elements: [
      {
        type: 'element',
        name: 'w:name',
        attributes: {
          'w:val': 'Title',
        },
      },
      {
        type: 'element',
        name: 'w:basedOn',
        attributes: {
          'w:val': 'Normal',
        },
      },
      {
        type: 'element',
        name: 'w:next',
        attributes: {
          'w:val': 'Normal',
        },
      },
      {
        type: 'element',
        name: 'w:link',
        attributes: {
          'w:val': 'TitleChar',
        },
      },
      {
        type: 'element',
        name: 'w:uiPriority',
        attributes: {
          'w:val': '10',
        },
      },
      {
        type: 'element',
        name: 'w:qFormat',
      },
      {
        type: 'element',
        name: 'w:rsid',
        attributes: {
          'w:val': '00B72667',
        },
      },
      {
        type: 'element',
        name: 'w:pPr',
        elements: [
          {
            type: 'element',
            name: 'w:spacing',
            attributes: {
              'w:after': '80',
            },
          },
          {
            type: 'element',
            name: 'w:contextualSpacing',
          },
        ],
      },
      {
        type: 'element',
        name: 'w:rPr',
        elements: [
          {
            type: 'element',
            name: 'w:rFonts',
            attributes: {
              'w:asciiTheme': 'majorHAnsi',
              'w:eastAsiaTheme': 'majorEastAsia',
              'w:hAnsiTheme': 'majorHAnsi',
              'w:cstheme': 'majorBidi',
            },
          },
          {
            type: 'element',
            name: 'w:spacing',
            attributes: {
              'w:val': '-10',
            },
          },
          {
            type: 'element',
            name: 'w:kern',
            attributes: {
              'w:val': '28',
            },
          },
          {
            type: 'element',
            name: 'w:sz',
            attributes: {
              'w:val': '56',
            },
          },
          {
            type: 'element',
            name: 'w:szCs',
            attributes: {
              'w:val': '56',
            },
          },
        ],
      },
    ],
  },
  Subtitle: {
    type: 'element',
    name: 'w:style',
    attributes: {
      'w:type': 'paragraph',
      'w:styleId': 'Subtitle',
    },
    elements: [
      {
        type: 'element',
        name: 'w:name',
        attributes: {
          'w:val': 'Subtitle',
        },
      },
      {
        type: 'element',
        name: 'w:basedOn',
        attributes: {
          'w:val': 'Normal',
        },
      },
      {
        type: 'element',
        name: 'w:next',
        attributes: {
          'w:val': 'Normal',
        },
      },
      {
        type: 'element',
        name: 'w:link',
        attributes: {
          'w:val': 'SubtitleChar',
        },
      },
      {
        type: 'element',
        name: 'w:uiPriority',
        attributes: {
          'w:val': '11',
        },
      },
      {
        type: 'element',
        name: 'w:qFormat',
      },
      {
        type: 'element',
        name: 'w:rsid',
        attributes: {
          'w:val': '00B72667',
        },
      },
      {
        type: 'element',
        name: 'w:pPr',
        elements: [
          {
            type: 'element',
            name: 'w:numPr',
            elements: [
              {
                type: 'element',
                name: 'w:ilvl',
                attributes: {
                  'w:val': '1',
                },
              },
            ],
          },
          {
            type: 'element',
            name: 'w:spacing',
            attributes: {
              'w:after': '160',
            },
          },
        ],
      },
      {
        type: 'element',
        name: 'w:rPr',
        elements: [
          {
            type: 'element',
            name: 'w:rFonts',
            attributes: {
              'w:asciiTheme': 'minorHAnsi',
              'w:eastAsiaTheme': 'majorEastAsia',
              'w:hAnsiTheme': 'minorHAnsi',
              'w:cstheme': 'majorBidi',
            },
          },
          {
            type: 'element',
            name: 'w:color',
            attributes: {
              'w:val': '595959',
              'w:themeColor': 'text1',
              'w:themeTint': 'A6',
            },
          },
          {
            type: 'element',
            name: 'w:spacing',
            attributes: {
              'w:val': '15',
            },
          },
          {
            type: 'element',
            name: 'w:sz',
            attributes: {
              'w:val': '28',
            },
          },
          {
            type: 'element',
            name: 'w:szCs',
            attributes: {
              'w:val': '28',
            },
          },
        ],
      },
    ],
  },
  Heading1: {
    type: 'element',
    name: 'w:style',
    attributes: {
      'w:type': 'paragraph',
      'w:styleId': 'Heading1',
    },
    elements: [
      {
        type: 'element',
        name: 'w:name',
        attributes: {
          'w:val': 'heading 1',
        },
      },
      {
        type: 'element',
        name: 'w:basedOn',
        attributes: {
          'w:val': 'Normal',
        },
      },
      {
        type: 'element',
        name: 'w:next',
        attributes: {
          'w:val': 'Normal',
        },
      },
      {
        type: 'element',
        name: 'w:link',
        attributes: {
          'w:val': 'Heading1Char',
        },
      },
      {
        type: 'element',
        name: 'w:uiPriority',
        attributes: {
          'w:val': '9',
        },
      },
      {
        type: 'element',
        name: 'w:qFormat',
      },
      {
        type: 'element',
        name: 'w:rsid',
        attributes: {
          'w:val': '00233D7B',
        },
      },
      {
        type: 'element',
        name: 'w:pPr',
        elements: [
          {
            type: 'element',
            name: 'w:keepNext',
          },
          {
            type: 'element',
            name: 'w:keepLines',
          },
          {
            type: 'element',
            name: 'w:spacing',
            attributes: {
              'w:before': '360',
              'w:after': '80',
            },
          },
          {
            type: 'element',
            name: 'w:outlineLvl',
            attributes: {
              'w:val': '0',
            },
          },
        ],
      },
      {
        type: 'element',
        name: 'w:rPr',
        elements: [
          {
            type: 'element',
            name: 'w:rFonts',
            attributes: {
              'w:asciiTheme': 'majorHAnsi',
              'w:eastAsiaTheme': 'majorEastAsia',
              'w:hAnsiTheme': 'majorHAnsi',
              'w:cstheme': 'majorBidi',
            },
          },
          {
            type: 'element',
            name: 'w:color',
            attributes: {
              'w:val': '0F4761',
              'w:themeColor': 'accent1',
              'w:themeShade': 'BF',
            },
          },
          {
            type: 'element',
            name: 'w:sz',
            attributes: {
              'w:val': '40',
            },
          },
          {
            type: 'element',
            name: 'w:szCs',
            attributes: {
              'w:val': '40',
            },
          },
        ],
      },
    ],
  },
  Heading2: {
    type: 'element',
    name: 'w:style',
    attributes: {
      'w:type': 'paragraph',
      'w:styleId': 'Heading2',
    },
    elements: [
      {
        type: 'element',
        name: 'w:name',
        attributes: {
          'w:val': 'heading 2',
        },
      },
      {
        type: 'element',
        name: 'w:basedOn',
        attributes: {
          'w:val': 'Normal',
        },
      },
      {
        type: 'element',
        name: 'w:next',
        attributes: {
          'w:val': 'Normal',
        },
      },
      {
        type: 'element',
        name: 'w:link',
        attributes: {
          'w:val': 'Heading2Char',
        },
      },
      {
        type: 'element',
        name: 'w:uiPriority',
        attributes: {
          'w:val': '9',
        },
      },
      {
        type: 'element',
        name: 'w:semiHidden',
      },
      {
        type: 'element',
        name: 'w:unhideWhenUsed',
      },
      {
        type: 'element',
        name: 'w:qFormat',
      },
      {
        type: 'element',
        name: 'w:rsid',
        attributes: {
          'w:val': '00233D7B',
        },
      },
      {
        type: 'element',
        name: 'w:pPr',
        elements: [
          {
            type: 'element',
            name: 'w:keepNext',
          },
          {
            type: 'element',
            name: 'w:keepLines',
          },
          {
            type: 'element',
            name: 'w:spacing',
            attributes: {
              'w:before': '160',
              'w:after': '80',
            },
          },
          {
            type: 'element',
            name: 'w:outlineLvl',
            attributes: {
              'w:val': '1',
            },
          },
        ],
      },
      {
        type: 'element',
        name: 'w:rPr',
        elements: [
          {
            type: 'element',
            name: 'w:rFonts',
            attributes: {
              'w:asciiTheme': 'majorHAnsi',
              'w:eastAsiaTheme': 'majorEastAsia',
              'w:hAnsiTheme': 'majorHAnsi',
              'w:cstheme': 'majorBidi',
            },
          },
          {
            type: 'element',
            name: 'w:color',
            attributes: {
              'w:val': '0F4761',
              'w:themeColor': 'accent1',
              'w:themeShade': 'BF',
            },
          },
          {
            type: 'element',
            name: 'w:sz',
            attributes: {
              'w:val': '32',
            },
          },
          {
            type: 'element',
            name: 'w:szCs',
            attributes: {
              'w:val': '32',
            },
          },
        ],
      },
    ],
  },
  Heading3: {
    type: 'element',
    name: 'w:style',
    attributes: {
      'w:type': 'paragraph',
      'w:styleId': 'Heading3',
    },
    elements: [
      {
        type: 'element',
        name: 'w:name',
        attributes: {
          'w:val': 'heading 3',
        },
      },
      {
        type: 'element',
        name: 'w:basedOn',
        attributes: {
          'w:val': 'Normal',
        },
      },
      {
        type: 'element',
        name: 'w:next',
        attributes: {
          'w:val': 'Normal',
        },
      },
      {
        type: 'element',
        name: 'w:link',
        attributes: {
          'w:val': 'Heading3Char',
        },
      },
      {
        type: 'element',
        name: 'w:uiPriority',
        attributes: {
          'w:val': '9',
        },
      },
      {
        type: 'element',
        name: 'w:semiHidden',
      },
      {
        type: 'element',
        name: 'w:unhideWhenUsed',
      },
      {
        type: 'element',
        name: 'w:qFormat',
      },
      {
        type: 'element',
        name: 'w:rsid',
        attributes: {
          'w:val': '00233D7B',
        },
      },
      {
        type: 'element',
        name: 'w:pPr',
        elements: [
          {
            type: 'element',
            name: 'w:keepNext',
          },
          {
            type: 'element',
            name: 'w:keepLines',
          },
          {
            type: 'element',
            name: 'w:spacing',
            attributes: {
              'w:before': '160',
              'w:after': '80',
            },
          },
          {
            type: 'element',
            name: 'w:outlineLvl',
            attributes: {
              'w:val': '2',
            },
          },
        ],
      },
      {
        type: 'element',
        name: 'w:rPr',
        elements: [
          {
            type: 'element',
            name: 'w:rFonts',
            attributes: {
              'w:eastAsiaTheme': 'majorEastAsia',
              'w:cstheme': 'majorBidi',
            },
          },
          {
            type: 'element',
            name: 'w:color',
            attributes: {
              'w:val': '0F4761',
              'w:themeColor': 'accent1',
              'w:themeShade': 'BF',
            },
          },
          {
            type: 'element',
            name: 'w:sz',
            attributes: {
              'w:val': '28',
            },
          },
          {
            type: 'element',
            name: 'w:szCs',
            attributes: {
              'w:val': '28',
            },
          },
        ],
      },
    ],
  },
};

export const COMMENTS_XML_DEF = {
  declaration: {
    attributes: {
      version: '1.0',
      encoding: 'UTF-8',
      standalone: 'yes',
    },
  },
  elements: [
    {
      type: 'element',
      name: 'w:comments',
      attributes: {
        'xmlns:wpc': 'http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas',
        'xmlns:cx': 'http://schemas.microsoft.com/office/drawing/2014/chartex',
        'xmlns:cx1': 'http://schemas.microsoft.com/office/drawing/2015/9/8/chartex',
        'xmlns:cx2': 'http://schemas.microsoft.com/office/drawing/2015/10/21/chartex',
        'xmlns:cx3': 'http://schemas.microsoft.com/office/drawing/2016/5/9/chartex',
        'xmlns:cx4': 'http://schemas.microsoft.com/office/drawing/2016/5/10/chartex',
        'xmlns:cx5': 'http://schemas.microsoft.com/office/drawing/2016/5/11/chartex',
        'xmlns:cx6': 'http://schemas.microsoft.com/office/drawing/2016/5/12/chartex',
        'xmlns:cx7': 'http://schemas.microsoft.com/office/drawing/2016/5/13/chartex',
        'xmlns:cx8': 'http://schemas.microsoft.com/office/drawing/2016/5/14/chartex',
        'xmlns:mc': 'http://schemas.openxmlformats.org/markup-compatibility/2006',
        'xmlns:aink': 'http://schemas.microsoft.com/office/drawing/2016/ink',
        'xmlns:am3d': 'http://schemas.microsoft.com/office/drawing/2017/model3d',
        'xmlns:o': 'urn:schemas-microsoft-com:office:office',
        'xmlns:oel': 'http://schemas.microsoft.com/office/2019/extlst',
        'xmlns:r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
        'xmlns:m': 'http://schemas.openxmlformats.org/officeDocument/2006/math',
        'xmlns:v': 'urn:schemas-microsoft-com:vml',
        'xmlns:wp14': 'http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing',
        'xmlns:wp': 'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing',
        'xmlns:w10': 'urn:schemas-microsoft-com:office:word',
        'xmlns:w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
        'xmlns:w14': 'http://schemas.microsoft.com/office/word/2010/wordml',
        'xmlns:w15': 'http://schemas.microsoft.com/office/word/2012/wordml',
        'xmlns:w16cex': 'http://schemas.microsoft.com/office/word/2018/wordml/cex',
        'xmlns:w16cid': 'http://schemas.microsoft.com/office/word/2016/wordml/cid',
        'xmlns:w16': 'http://schemas.microsoft.com/office/word/2018/wordml',
        'xmlns:w16du': 'http://schemas.microsoft.com/office/word/2023/wordml/word16du',
        'xmlns:w16sdtdh': 'http://schemas.microsoft.com/office/word/2020/wordml/sdtdatahash',
        'xmlns:w16sdtfl': 'http://schemas.microsoft.com/office/word/2024/wordml/sdtformatlock',
        'xmlns:w16se': 'http://schemas.microsoft.com/office/word/2015/wordml/symex',
        'xmlns:wpg': 'http://schemas.microsoft.com/office/word/2010/wordprocessingGroup',
        'xmlns:wpi': 'http://schemas.microsoft.com/office/word/2010/wordprocessingInk',
        'xmlns:wne': 'http://schemas.microsoft.com/office/word/2006/wordml',
        'xmlns:wps': 'http://schemas.microsoft.com/office/word/2010/wordprocessingShape',
        'mc:Ignorable': 'w14 w15 w16se w16cid w16 w16cex w16sdtdh w16sdtfl w16du wp14',
      },
      elements: [],
    },
  ],
};

export const COMMENTS_EXTENDED_XML_DEF = {
  declaration: {
    attributes: {
      version: '1.0',
      encoding: 'UTF-8',
      standalone: 'yes',
    },
  },
  elements: [
    {
      type: 'element',
      name: 'w15:commentsEx',
      attributes: {
        'xmlns:wpc': 'http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas',
        'xmlns:cx': 'http://schemas.microsoft.com/office/drawing/2014/chartex',
        'xmlns:cx1': 'http://schemas.microsoft.com/office/drawing/2015/9/8/chartex',
        'xmlns:cx2': 'http://schemas.microsoft.com/office/drawing/2015/10/21/chartex',
        'xmlns:cx3': 'http://schemas.microsoft.com/office/drawing/2016/5/9/chartex',
        'xmlns:cx4': 'http://schemas.microsoft.com/office/drawing/2016/5/10/chartex',
        'xmlns:cx5': 'http://schemas.microsoft.com/office/drawing/2016/5/11/chartex',
        'xmlns:cx6': 'http://schemas.microsoft.com/office/drawing/2016/5/12/chartex',
        'xmlns:cx7': 'http://schemas.microsoft.com/office/drawing/2016/5/13/chartex',
        'xmlns:cx8': 'http://schemas.microsoft.com/office/drawing/2016/5/14/chartex',
        'xmlns:mc': 'http://schemas.openxmlformats.org/markup-compatibility/2006',
        'xmlns:aink': 'http://schemas.microsoft.com/office/drawing/2016/ink',
        'xmlns:am3d': 'http://schemas.microsoft.com/office/drawing/2017/model3d',
        'xmlns:o': 'urn:schemas-microsoft-com:office:office',
        'xmlns:oel': 'http://schemas.microsoft.com/office/2019/extlst',
        'xmlns:r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
        'xmlns:m': 'http://schemas.openxmlformats.org/officeDocument/2006/math',
        'xmlns:v': 'urn:schemas-microsoft-com:vml',
        'xmlns:wp14': 'http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing',
        'xmlns:wp': 'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing',
        'xmlns:w10': 'urn:schemas-microsoft-com:office:word',
        'xmlns:w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
        'xmlns:w14': 'http://schemas.microsoft.com/office/word/2010/wordml',
        'xmlns:w15': 'http://schemas.microsoft.com/office/word/2012/wordml',
        'xmlns:w16cex': 'http://schemas.microsoft.com/office/word/2018/wordml/cex',
        'xmlns:w16cid': 'http://schemas.microsoft.com/office/word/2016/wordml/cid',
        'xmlns:w16': 'http://schemas.microsoft.com/office/word/2018/wordml',
        'xmlns:w16du': 'http://schemas.microsoft.com/office/word/2023/wordml/word16du',
        'xmlns:w16sdtdh': 'http://schemas.microsoft.com/office/word/2020/wordml/sdtdatahash',
        'xmlns:w16sdtfl': 'http://schemas.microsoft.com/office/word/2024/wordml/sdtformatlock',
        'xmlns:w16se': 'http://schemas.microsoft.com/office/word/2015/wordml/symex',
        'xmlns:wpg': 'http://schemas.microsoft.com/office/word/2010/wordprocessingGroup',
        'xmlns:wpi': 'http://schemas.microsoft.com/office/word/2010/wordprocessingInk',
        'xmlns:wne': 'http://schemas.microsoft.com/office/word/2006/wordml',
        'xmlns:wps': 'http://schemas.microsoft.com/office/word/2010/wordprocessingShape',
        'mc:Ignorable': 'w14 w15 w16se w16cid w16 w16cex w16sdtdh w16sdtfl w16du wp14',
      },
      elements: [],
    },
  ],
};

export const COMMENTS_EXTENSIBLE_XML_DEF = {
  declaration: {
    attributes: {
      version: '1.0',
      encoding: 'UTF-8',
      standalone: 'yes',
    },
  },
  elements: [
    {
      type: 'element',
      name: 'w16cex:commentsExtensible',
      attributes: {
        'xmlns:wpc': 'http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas',
        'xmlns:cx': 'http://schemas.microsoft.com/office/drawing/2014/chartex',
        'xmlns:cx1': 'http://schemas.microsoft.com/office/drawing/2015/9/8/chartex',
        'xmlns:cx2': 'http://schemas.microsoft.com/office/drawing/2015/10/21/chartex',
        'xmlns:cx3': 'http://schemas.microsoft.com/office/drawing/2016/5/9/chartex',
        'xmlns:cx4': 'http://schemas.microsoft.com/office/drawing/2016/5/10/chartex',
        'xmlns:cx5': 'http://schemas.microsoft.com/office/drawing/2016/5/11/chartex',
        'xmlns:cx6': 'http://schemas.microsoft.com/office/drawing/2016/5/12/chartex',
        'xmlns:cx7': 'http://schemas.microsoft.com/office/drawing/2016/5/13/chartex',
        'xmlns:cx8': 'http://schemas.microsoft.com/office/drawing/2016/5/14/chartex',
        'xmlns:cr': 'http://schemas.microsoft.com/office/comments/2020/reactions',
        'xmlns:mc': 'http://schemas.openxmlformats.org/markup-compatibility/2006',
        'xmlns:aink': 'http://schemas.microsoft.com/office/drawing/2016/ink',
        'xmlns:am3d': 'http://schemas.microsoft.com/office/drawing/2017/model3d',
        'xmlns:o': 'urn:schemas-microsoft-com:office:office',
        'xmlns:oel': 'http://schemas.microsoft.com/office/2019/extlst',
        'xmlns:r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
        'xmlns:m': 'http://schemas.openxmlformats.org/officeDocument/2006/math',
        'xmlns:v': 'urn:schemas-microsoft-com:vml',
        'xmlns:wp14': 'http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing',
        'xmlns:wp': 'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing',
        'xmlns:w10': 'urn:schemas-microsoft-com:office:word',
        'xmlns:w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
        'xmlns:w14': 'http://schemas.microsoft.com/office/word/2010/wordml',
        'xmlns:w15': 'http://schemas.microsoft.com/office/word/2012/wordml',
        'xmlns:w16cex': 'http://schemas.microsoft.com/office/word/2018/wordml/cex',
        'xmlns:w16cid': 'http://schemas.microsoft.com/office/word/2016/wordml/cid',
        'xmlns:w16': 'http://schemas.microsoft.com/office/word/2018/wordml',
        'xmlns:w16du': 'http://schemas.microsoft.com/office/word/2023/wordml/word16du',
        'xmlns:w16sdtdh': 'http://schemas.microsoft.com/office/word/2020/wordml/sdtdatahash',
        'xmlns:w16sdtfl': 'http://schemas.microsoft.com/office/word/2024/wordml/sdtformatlock',
        'xmlns:w16se': 'http://schemas.microsoft.com/office/word/2015/wordml/symex',
        'xmlns:wpg': 'http://schemas.microsoft.com/office/word/2010/wordprocessingGroup',
        'xmlns:wpi': 'http://schemas.microsoft.com/office/word/2010/wordprocessingInk',
        'xmlns:wne': 'http://schemas.microsoft.com/office/word/2006/wordml',
        'xmlns:wps': 'http://schemas.microsoft.com/office/word/2010/wordprocessingShape',
        'mc:Ignorable': 'w14 w15 w16se w16cid w16 w16cex w16sdtdh w16sdtfl cr w16du wp14',
      },
      elements: [],
    },
  ],
};

export const COMMENTS_IDS_XML_DEF = {
  declaration: {
    attributes: {
      version: '1.0',
      encoding: 'UTF-8',
      standalone: 'yes',
    },
  },
  elements: [
    {
      type: 'element',
      name: 'w16cid:commentsIds',
      attributes: {
        'xmlns:wpc': 'http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas',
        'xmlns:cx': 'http://schemas.microsoft.com/office/drawing/2014/chartex',
        'xmlns:cx1': 'http://schemas.microsoft.com/office/drawing/2015/9/8/chartex',
        'xmlns:cx2': 'http://schemas.microsoft.com/office/drawing/2015/10/21/chartex',
        'xmlns:cx3': 'http://schemas.microsoft.com/office/drawing/2016/5/9/chartex',
        'xmlns:cx4': 'http://schemas.microsoft.com/office/drawing/2016/5/10/chartex',
        'xmlns:cx5': 'http://schemas.microsoft.com/office/drawing/2016/5/11/chartex',
        'xmlns:cx6': 'http://schemas.microsoft.com/office/drawing/2016/5/12/chartex',
        'xmlns:cx7': 'http://schemas.microsoft.com/office/drawing/2016/5/13/chartex',
        'xmlns:cx8': 'http://schemas.microsoft.com/office/drawing/2016/5/14/chartex',
        'xmlns:mc': 'http://schemas.openxmlformats.org/markup-compatibility/2006',
        'xmlns:aink': 'http://schemas.microsoft.com/office/drawing/2016/ink',
        'xmlns:am3d': 'http://schemas.microsoft.com/office/drawing/2017/model3d',
        'xmlns:o': 'urn:schemas-microsoft-com:office:office',
        'xmlns:oel': 'http://schemas.microsoft.com/office/2019/extlst',
        'xmlns:r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
        'xmlns:m': 'http://schemas.openxmlformats.org/officeDocument/2006/math',
        'xmlns:v': 'urn:schemas-microsoft-com:vml',
        'xmlns:wp14': 'http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing',
        'xmlns:wp': 'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing',
        'xmlns:w10': 'urn:schemas-microsoft-com:office:word',
        'xmlns:w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
        'xmlns:w14': 'http://schemas.microsoft.com/office/word/2010/wordml',
        'xmlns:w15': 'http://schemas.microsoft.com/office/word/2012/wordml',
        'xmlns:w16cex': 'http://schemas.microsoft.com/office/word/2018/wordml/cex',
        'xmlns:w16cid': 'http://schemas.microsoft.com/office/word/2016/wordml/cid',
        'xmlns:w16': 'http://schemas.microsoft.com/office/word/2018/wordml',
        'xmlns:w16du': 'http://schemas.microsoft.com/office/word/2023/wordml/word16du',
        'xmlns:w16sdtdh': 'http://schemas.microsoft.com/office/word/2020/wordml/sdtdatahash',
        'xmlns:w16sdtfl': 'http://schemas.microsoft.com/office/word/2024/wordml/sdtformatlock',
        'xmlns:w16se': 'http://schemas.microsoft.com/office/word/2015/wordml/symex',
        'xmlns:wpg': 'http://schemas.microsoft.com/office/word/2010/wordprocessingGroup',
        'xmlns:wpi': 'http://schemas.microsoft.com/office/word/2010/wordprocessingInk',
        'xmlns:wne': 'http://schemas.microsoft.com/office/word/2006/wordml',
        'xmlns:wps': 'http://schemas.microsoft.com/office/word/2010/wordprocessingShape',
        'mc:Ignorable': 'w14 w15 w16se w16cid w16 w16cex w16sdtdh w16sdtfl w16du wp14',
      },
      elements: [],
    },
  ],
};

export const DOCUMENT_RELS_XML_DEF = {
  declaration: {
    attributes: {
      version: '1.0',
      encoding: 'UTF-8',
      standalone: 'yes',
    },
  },
  elements: [
    {
      type: 'element',
      name: 'Relationships',
      attributes: {
        xmlns: 'http://schemas.openxmlformats.org/package/2006/relationships',
      },
      elements: [
        {
          type: 'element',
          name: 'Relationship',
          attributes: {
            Id: 'rId8',
            Type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/fontTable',
            Target: 'fontTable.xml',
          },
        },
        {
          type: 'element',
          name: 'Relationship',
          attributes: {
            Id: 'rId3',
            Type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/webSettings',
            Target: 'webSettings.xml',
          },
        },
        {
          type: 'element',
          name: 'Relationship',
          attributes: {
            Id: 'rId7',
            Type: 'http://schemas.microsoft.com/office/2018/08/relationships/commentsExtensible',
            Target: 'commentsExtensible.xml',
          },
        },
        {
          type: 'element',
          name: 'Relationship',
          attributes: {
            Id: 'rId2',
            Type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings',
            Target: 'settings.xml',
          },
        },
        {
          type: 'element',
          name: 'Relationship',
          attributes: {
            Id: 'rId1',
            Type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles',
            Target: 'styles.xml',
          },
        },
        {
          type: 'element',
          name: 'Relationship',
          attributes: {
            Id: 'rId6',
            Type: 'http://schemas.microsoft.com/office/2016/09/relationships/commentsIds',
            Target: 'commentsIds.xml',
          },
        },
        {
          type: 'element',
          name: 'Relationship',
          attributes: {
            Id: 'rId5',
            Type: 'http://schemas.microsoft.com/office/2011/relationships/commentsExtended',
            Target: 'commentsExtended.xml',
          },
        },
        {
          type: 'element',
          name: 'Relationship',
          attributes: {
            Id: 'rId10',
            Type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme',
            Target: 'theme/theme1.xml',
          },
        },
        {
          type: 'element',
          name: 'Relationship',
          attributes: {
            Id: 'rId4',
            Type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/comments',
            Target: 'comments.xml',
          },
        },
        // {
        //     "type": "element",
        //     "name": "Relationship",
        //     "attributes": {
        //         "Id": "rId9",
        //         "Type": "http://schemas.microsoft.com/office/2011/relationships/people",
        //         "Target": "people.xml"
        //     }
        // }
      ],
    },
  ],
};

export const PEOPLE_XML_DEF = {
  declaration: {
    attributes: {
      version: '1.0',
      encoding: 'UTF-8',
      standalone: 'yes',
    },
  },
  elements: [
    {
      type: 'element',
      name: 'w15:people',
      attributes: {
        'xmlns:wpc': 'http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas',
        'xmlns:cx': 'http://schemas.microsoft.com/office/drawing/2014/chartex',
        'xmlns:cx1': 'http://schemas.microsoft.com/office/drawing/2015/9/8/chartex',
        'xmlns:cx2': 'http://schemas.microsoft.com/office/drawing/2015/10/21/chartex',
        'xmlns:cx3': 'http://schemas.microsoft.com/office/drawing/2016/5/9/chartex',
        'xmlns:cx4': 'http://schemas.microsoft.com/office/drawing/2016/5/10/chartex',
        'xmlns:cx5': 'http://schemas.microsoft.com/office/drawing/2016/5/11/chartex',
        'xmlns:cx6': 'http://schemas.microsoft.com/office/drawing/2016/5/12/chartex',
        'xmlns:cx7': 'http://schemas.microsoft.com/office/drawing/2016/5/13/chartex',
        'xmlns:cx8': 'http://schemas.microsoft.com/office/drawing/2016/5/14/chartex',
        'xmlns:mc': 'http://schemas.openxmlformats.org/markup-compatibility/2006',
        'xmlns:aink': 'http://schemas.microsoft.com/office/drawing/2016/ink',
        'xmlns:am3d': 'http://schemas.microsoft.com/office/drawing/2017/model3d',
        'xmlns:o': 'urn:schemas-microsoft-com:office:office',
        'xmlns:oel': 'http://schemas.microsoft.com/office/2019/extlst',
        'xmlns:r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
        'xmlns:m': 'http://schemas.openxmlformats.org/officeDocument/2006/math',
        'xmlns:v': 'urn:schemas-microsoft-com:vml',
        'xmlns:wp14': 'http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing',
        'xmlns:wp': 'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing',
        'xmlns:w10': 'urn:schemas-microsoft-com:office:word',
        'xmlns:w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
        'xmlns:w14': 'http://schemas.microsoft.com/office/word/2010/wordml',
        'xmlns:w15': 'http://schemas.microsoft.com/office/word/2012/wordml',
        'xmlns:w16cex': 'http://schemas.microsoft.com/office/word/2018/wordml/cex',
        'xmlns:w16cid': 'http://schemas.microsoft.com/office/word/2016/wordml/cid',
        'xmlns:w16': 'http://schemas.microsoft.com/office/word/2018/wordml',
        'xmlns:w16du': 'http://schemas.microsoft.com/office/word/2023/wordml/word16du',
        'xmlns:w16sdtdh': 'http://schemas.microsoft.com/office/word/2020/wordml/sdtdatahash',
        'xmlns:w16sdtfl': 'http://schemas.microsoft.com/office/word/2024/wordml/sdtformatlock',
        'xmlns:w16se': 'http://schemas.microsoft.com/office/word/2015/wordml/symex',
        'xmlns:wpg': 'http://schemas.microsoft.com/office/word/2010/wordprocessingGroup',
        'xmlns:wpi': 'http://schemas.microsoft.com/office/word/2010/wordprocessingInk',
        'xmlns:wne': 'http://schemas.microsoft.com/office/word/2006/wordml',
        'xmlns:wps': 'http://schemas.microsoft.com/office/word/2010/wordprocessingShape',
        'mc:Ignorable': 'w14 w15 w16se w16cid w16 w16cex w16sdtdh w16sdtfl w16du wp14',
      },
      elements: [
        {
          type: 'element',
          name: 'w15:person',
          attributes: {
            'w15:author': 'Nick Bernal',
          },
          elements: [],
        },
      ],
    },
  ],
};

export const CONTENT_TYPES = {
  declaration: {
    attributes: {
      version: '1.0',
      encoding: 'UTF-8',
      standalone: 'yes',
    },
  },
  elements: [
    {
      type: 'element',
      name: 'Types',
      attributes: {
        xmlns: 'http://schemas.openxmlformats.org/package/2006/content-types',
      },
      elements: [
        {
          type: 'element',
          name: 'Default',
          attributes: {
            Extension: 'rels',
            ContentType: 'application/vnd.openxmlformats-package.relationships+xml',
          },
        },
        {
          type: 'element',
          name: 'Default',
          attributes: {
            Extension: 'xml',
            ContentType: 'application/xml',
          },
        },
        {
          type: 'element',
          name: 'Override',
          attributes: {
            PartName: '/word/document.xml',
            ContentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml',
          },
        },
        {
          type: 'element',
          name: 'Override',
          attributes: {
            PartName: '/word/styles.xml',
            ContentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml',
          },
        },
        {
          type: 'element',
          name: 'Override',
          attributes: {
            PartName: '/word/settings.xml',
            ContentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml',
          },
        },
        {
          type: 'element',
          name: 'Override',
          attributes: {
            PartName: '/word/webSettings.xml',
            ContentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.webSettings+xml',
          },
        },
        {
          type: 'element',
          name: 'Override',
          attributes: {
            PartName: '/word/comments.xml',
            ContentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.comments+xml',
          },
        },
        {
          type: 'element',
          name: 'Override',
          attributes: {
            PartName: '/word/commentsExtended.xml',
            ContentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.commentsExtended+xml',
          },
        },
        {
          type: 'element',
          name: 'Override',
          attributes: {
            PartName: '/word/commentsIds.xml',
            ContentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.commentsIds+xml',
          },
        },
        {
          type: 'element',
          name: 'Override',
          attributes: {
            PartName: '/word/commentsExtensible.xml',
            ContentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.commentsExtensible+xml',
          },
        },
        {
          type: 'element',
          name: 'Override',
          attributes: {
            PartName: '/word/fontTable.xml',
            ContentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.fontTable+xml',
          },
        },
        {
          type: 'element',
          name: 'Override',
          attributes: {
            PartName: '/word/people.xml',
            ContentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.people+xml',
          },
        },
        {
          type: 'element',
          name: 'Override',
          attributes: {
            PartName: '/word/theme/theme1.xml',
            ContentType: 'application/vnd.openxmlformats-officedocument.theme+xml',
          },
        },
        {
          type: 'element',
          name: 'Override',
          attributes: {
            PartName: '/docProps/core.xml',
            ContentType: 'application/vnd.openxmlformats-package.core-properties+xml',
          },
        },
        {
          type: 'element',
          name: 'Override',
          attributes: {
            PartName: '/docProps/app.xml',
            ContentType: 'application/vnd.openxmlformats-officedocument.extended-properties+xml',
          },
        },
        {
          type: 'element',
          name: 'Override',
          attributes: {
            PartName: '/word/numbering.xml',
            ContentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml',
          },
        },
      ],
    },
  ],
};

/**
 * @type {CommentsXmlDefinitions}
 */
export const COMMENTS_XML_DEFINITIONS = {
  COMMENTS_XML_DEF,
  COMMENTS_EXTENDED_XML_DEF,
  COMMENTS_EXTENSIBLE_XML_DEF,
  COMMENTS_IDS_XML_DEF,
  DOCUMENT_RELS_XML_DEF,
  PEOPLE_XML_DEF,
  CONTENT_TYPES,
};
