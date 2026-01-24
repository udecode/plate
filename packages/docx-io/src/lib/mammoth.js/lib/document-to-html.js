var _ = require('underscore');

var promises = require('./promises');
var documents = require('./documents');
var htmlPaths = require('./styles/html-paths');
var results = require('./results');
var images = require('./images');
var Html = require('./html');
var writers = require('./writers');

exports.DocumentConverter = DocumentConverter;

// Token prefixes for tracked changes - parsed by import-toolbar-button.tsx
var DOCX_INSERTION_START_TOKEN_PREFIX = '[[DOCX_INS_START:';
var DOCX_INSERTION_END_TOKEN_PREFIX = '[[DOCX_INS_END:';
var DOCX_INSERTION_TOKEN_SUFFIX = ']]';
var DOCX_DELETION_START_TOKEN_PREFIX = '[[DOCX_DEL_START:';
var DOCX_DELETION_END_TOKEN_PREFIX = '[[DOCX_DEL_END:';
var DOCX_DELETION_TOKEN_SUFFIX = ']]';

// Token prefixes for comment ranges - parsed by import-toolbar-button.tsx
var DOCX_COMMENT_START_TOKEN_PREFIX = '[[DOCX_CMT_START:';
var DOCX_COMMENT_END_TOKEN_PREFIX = '[[DOCX_CMT_END:';
var DOCX_COMMENT_TOKEN_SUFFIX = ']]';

function DocumentConverter(options) {
  return {
    convertToHtml(element) {
      var comments = _.indexBy(
        element.type === documents.types.document ? element.comments : [],
        'commentId'
      );
      var conversion = new DocumentConversion(options, comments);
      return conversion.convertToHtml(element);
    },
  };
}

function DocumentConversion(options, comments) {
  var noteNumber = 1;
  // Counter for generating unique IDs for tracked changes without explicit IDs
  var trackedChangeIdCounter = 1;

  var noteReferences = [];

  var referencedComments = [];

  options = _.extend({ ignoreEmptyParagraphs: true }, options);
  var idPrefix = options.idPrefix === undefined ? '' : options.idPrefix;
  var ignoreEmptyParagraphs = options.ignoreEmptyParagraphs;

  var defaultParagraphStyle = htmlPaths.topLevelElement('p');

  var styleMap = options.styleMap || [];

  function convertToHtml(document) {
    var messages = [];

    var html = elementToHtml(document, messages, {});

    var deferredNodes = [];
    walkHtml(html, (node) => {
      if (node.type === 'deferred') {
        deferredNodes.push(node);
      }
    });
    var deferredValues = {};
    return promises
      .mapSeries(deferredNodes, (deferred) =>
        deferred.value().then((value) => {
          deferredValues[deferred.id] = value;
        })
      )
      .then(() => {
        function replaceDeferred(nodes) {
          return flatMap(nodes, (node) => {
            if (node.type === 'deferred') {
              return deferredValues[node.id];
            }
            if (node.children) {
              return [
                _.extend({}, node, {
                  children: replaceDeferred(node.children),
                }),
              ];
            }
            return [node];
          });
        }
        var writer = writers.writer({
          prettyPrint: options.prettyPrint,
          outputFormat: options.outputFormat,
        });
        Html.write(writer, Html.simplify(replaceDeferred(html)));
        return new results.Result(writer.asString(), messages);
      });
  }

  function convertElements(elements, messages, options) {
    return flatMap(elements, (element) =>
      elementToHtml(element, messages, options)
    );
  }

  function elementToHtml(element, messages, options) {
    if (!options) {
      throw new Error('options not set');
    }
    var handler = elementConverters[element.type];
    if (handler) {
      return handler(element, messages, options);
    }
    return [];
  }

  function convertParagraph(element, messages, options) {
    return htmlPathForParagraph(element, messages).wrap(() => {
      var content = convertElements(element.children, messages, options);
      if (ignoreEmptyParagraphs) {
        return content;
      }
      return [Html.forceWrite].concat(content);
    });
  }

  function htmlPathForParagraph(element, messages) {
    var style = findStyle(element);

    if (style) {
      return style.to;
    }
    if (element.styleId) {
      messages.push(unrecognisedStyleWarning('paragraph', element));
    }
    return defaultParagraphStyle;
  }

  function convertRun(run, messages, options) {
    var nodes = () => convertElements(run.children, messages, options);
    var paths = [];
    if (run.highlight !== null) {
      var path = findHtmlPath({ type: 'highlight', color: run.highlight });
      if (path) {
        paths.push(path);
      }
    }
    if (run.isSmallCaps) {
      paths.push(findHtmlPathForRunProperty('smallCaps'));
    }
    if (run.isAllCaps) {
      paths.push(findHtmlPathForRunProperty('allCaps'));
    }
    if (run.isStrikethrough) {
      paths.push(findHtmlPathForRunProperty('strikethrough', 's'));
    }
    if (run.isUnderline) {
      paths.push(findHtmlPathForRunProperty('underline'));
    }
    if (run.verticalAlignment === documents.verticalAlignment.subscript) {
      paths.push(htmlPaths.element('sub', {}, { fresh: false }));
    }
    if (run.verticalAlignment === documents.verticalAlignment.superscript) {
      paths.push(htmlPaths.element('sup', {}, { fresh: false }));
    }
    if (run.isItalic) {
      paths.push(findHtmlPathForRunProperty('italic', 'em'));
    }
    if (run.isBold) {
      paths.push(findHtmlPathForRunProperty('bold', 'strong'));
    }
    var stylePath = htmlPaths.empty;
    var style = findStyle(run);
    if (style) {
      stylePath = style.to;
    } else if (run.styleId) {
      messages.push(unrecognisedStyleWarning('run', run));
    }
    paths.push(stylePath);

    paths.forEach((path) => {
      nodes = path.wrap.bind(path, nodes);
    });

    return nodes();
  }

  function findHtmlPathForRunProperty(elementType, defaultTagName) {
    var path = findHtmlPath({ type: elementType });
    if (path) {
      return path;
    }
    if (defaultTagName) {
      return htmlPaths.element(defaultTagName, {}, { fresh: false });
    }
    return htmlPaths.empty;
  }

  function findHtmlPath(element, defaultPath) {
    var style = findStyle(element);
    return style ? style.to : defaultPath;
  }

  function findStyle(element) {
    for (var i = 0; i < styleMap.length; i++) {
      if (styleMap[i].from.matches(element)) {
        return styleMap[i];
      }
    }
  }

  function recoveringConvertImage(convertImage) {
    return (image, messages) =>
      promises
        .attempt(() => convertImage(image, messages))
        .caught((error) => {
          messages.push(results.error(error));
          return [];
        });
  }

  function noteHtmlId(note) {
    return referentHtmlId(note.noteType, note.noteId);
  }

  function noteRefHtmlId(note) {
    return referenceHtmlId(note.noteType, note.noteId);
  }

  function referentHtmlId(referenceType, referenceId) {
    return htmlId(referenceType + '-' + referenceId);
  }

  function referenceHtmlId(referenceType, referenceId) {
    return htmlId(referenceType + '-ref-' + referenceId);
  }

  function htmlId(suffix) {
    return idPrefix + suffix;
  }

  var defaultTablePath = htmlPaths.elements([
    htmlPaths.element('table', {}, { fresh: true }),
  ]);

  function convertTable(element, messages, options) {
    return findHtmlPath(element, defaultTablePath).wrap(() =>
      convertTableChildren(element, messages, options)
    );
  }

  function convertTableChildren(element, messages, options) {
    var bodyIndex = _.findIndex(
      element.children,
      (child) => child.type !== documents.types.tableRow || !child.isHeader
    );
    if (bodyIndex === -1) {
      bodyIndex = element.children.length;
    }
    var children;
    if (bodyIndex === 0) {
      children = convertElements(
        element.children,
        messages,
        _.extend({}, options, { isTableHeader: false })
      );
    } else {
      var headRows = convertElements(
        element.children.slice(0, bodyIndex),
        messages,
        _.extend({}, options, { isTableHeader: true })
      );
      var bodyRows = convertElements(
        element.children.slice(bodyIndex),
        messages,
        _.extend({}, options, { isTableHeader: false })
      );
      children = [
        Html.freshElement('thead', {}, headRows),
        Html.freshElement('tbody', {}, bodyRows),
      ];
    }
    return [Html.forceWrite].concat(children);
  }

  function convertTableRow(element, messages, options) {
    var children = convertElements(element.children, messages, options);
    return [Html.freshElement('tr', {}, [Html.forceWrite].concat(children))];
  }

  function convertTableCell(element, messages, options) {
    var tagName = options.isTableHeader ? 'th' : 'td';
    var children = convertElements(element.children, messages, options);
    var attributes = {};
    if (element.colSpan !== 1) {
      attributes.colspan = element.colSpan.toString();
    }
    if (element.rowSpan !== 1) {
      attributes.rowspan = element.rowSpan.toString();
    }

    return [
      Html.freshElement(
        tagName,
        attributes,
        [Html.forceWrite].concat(children)
      ),
    ];
  }

  function convertCommentReference(reference, messages, options) {
    // Since we use [[DOCX_CMT_START/END:...]] tokens for comments,
    // we don't need footnote-style references. Return empty.
    // The comment data is already embedded in the tokens.
    void reference;
    void messages;
    void options;
    return [];
  }

  function convertComment(referencedComment, messages, options) {
    // Since we use [[DOCX_CMT_START/END:...]] tokens for comments,
    // we don't need footnote-style definition lists. Return empty.
    // The comment data is already embedded in the tokens.
    void referencedComment;
    void messages;
    void options;
    return [];
  }

  function convertBreak(element, messages, options) {
    return htmlPathForBreak(element).wrap(() => []);
  }

  function htmlPathForBreak(element) {
    var style = findStyle(element);
    if (style) {
      return style.to;
    }
    if (element.breakType === 'line') {
      return htmlPaths.topLevelElement('br');
    }
    return htmlPaths.empty;
  }

  var elementConverters = {
    document(document, messages, options) {
      var children = convertElements(document.children, messages, options);
      var notes = noteReferences.map((noteReference) =>
        document.notes.resolve(noteReference)
      );
      var notesNodes = convertElements(notes, messages, options);
      return children.concat([
        Html.freshElement('ol', {}, notesNodes),
        Html.freshElement(
          'dl',
          {},
          flatMap(referencedComments, (referencedComment) =>
            convertComment(referencedComment, messages, options)
          )
        ),
      ]);
    },
    paragraph: convertParagraph,
    run: convertRun,
    text(element, messages, options) {
      void messages;
      void options;
      return [Html.text(element.value)];
    },
    tab(element, messages, options) {
      return [Html.text('\t')];
    },
    hyperlink(element, messages, options) {
      var href = element.anchor ? '#' + htmlId(element.anchor) : element.href;
      var attributes = { href };
      if (element.targetFrame != null) {
        attributes.target = element.targetFrame;
      }

      var children = convertElements(element.children, messages, options);
      return [Html.nonFreshElement('a', attributes, children)];
    },
    checkbox(element) {
      var attributes = { type: 'checkbox' };
      if (element.checked) {
        attributes['checked'] = 'checked';
      }
      return [Html.freshElement('input', attributes)];
    },
    bookmarkStart(element, messages, options) {
      var anchor = Html.freshElement(
        'a',
        {
          id: htmlId(element.name),
        },
        [Html.forceWrite]
      );
      return [anchor];
    },
    noteReference(element, messages, options) {
      void messages;
      void options;
      noteReferences.push(element);
      var anchor = Html.freshElement(
        'a',
        {
          href: '#' + noteHtmlId(element),
          id: noteRefHtmlId(element),
        },
        [Html.text('[' + noteNumber++ + ']')]
      );

      return [Html.freshElement('sup', {}, [anchor])];
    },
    note(element, messages, options) {
      var children = convertElements(element.body, messages, options);
      var backLink = Html.elementWithTag(
        htmlPaths.element('p', {}, { fresh: false }),
        [
          Html.text(' '),
          Html.freshElement('a', { href: '#' + noteRefHtmlId(element) }, [
            Html.text('↑'),
          ]),
        ]
      );
      var body = children.concat([backLink]);

      return Html.freshElement('li', { id: noteHtmlId(element) }, body);
    },
    commentReference: convertCommentReference,
    comment: convertComment,
    commentRangeStart(element, messages, options) {
      void options;
      // Get the comment data for this range
      var comment = comments[element.commentId];
      var payload = {
        id: element.commentId,
      };
      if (!comment) {
        messages.push(
          results.warning(
            'Comment with ID ' +
              element.commentId +
              ' was referenced by a range but not found in the document'
          )
        );
      }
      if (comment) {
        payload.authorName = comment.authorName;
        payload.authorInitials = comment.authorInitials;
        payload.date = comment.date;
        // Convert comment body to plain text
        if (comment.body && comment.body.length > 0) {
          payload.text = extractTextFromElements(comment.body);
        }
      }
      // Emit token for comment range start - will be parsed by import-toolbar-button.tsx
      var token =
        DOCX_COMMENT_START_TOKEN_PREFIX +
        encodeURIComponent(JSON.stringify(payload)) +
        DOCX_COMMENT_TOKEN_SUFFIX;
      return [Html.text(token)];
    },
    commentRangeEnd(element) {
      // Emit token for comment range end - will be parsed by import-toolbar-button.tsx
      var token =
        DOCX_COMMENT_END_TOKEN_PREFIX +
        encodeURIComponent(element.commentId) +
        DOCX_COMMENT_TOKEN_SUFFIX;
      return [Html.text(token)];
    },
    inserted(element, messages, options) {
      var children = convertElements(element.children, messages, options);
      // Use Word's original changeId if available, otherwise generate one
      var changeId = element.changeId || 'ins-' + trackedChangeIdCounter++;
      var payload = encodeTrackedChangePayload({
        id: changeId,
        author: element.author,
        date: element.date,
      });
      var startToken =
        DOCX_INSERTION_START_TOKEN_PREFIX +
        payload +
        DOCX_INSERTION_TOKEN_SUFFIX;
      var endToken =
        DOCX_INSERTION_END_TOKEN_PREFIX +
        changeId +
        DOCX_INSERTION_TOKEN_SUFFIX;
      return [Html.text(startToken)]
        .concat(children)
        .concat([Html.text(endToken)]);
    },
    deleted(element, messages, options) {
      var children = convertElements(element.children, messages, options);
      // Use Word's original changeId if available, otherwise generate one
      var changeId = element.changeId || 'del-' + trackedChangeIdCounter++;
      var payload = encodeTrackedChangePayload({
        id: changeId,
        author: element.author,
        date: element.date,
      });
      var startToken =
        DOCX_DELETION_START_TOKEN_PREFIX + payload + DOCX_DELETION_TOKEN_SUFFIX;
      var endToken =
        DOCX_DELETION_END_TOKEN_PREFIX + changeId + DOCX_DELETION_TOKEN_SUFFIX;
      return [Html.text(startToken)]
        .concat(children)
        .concat([Html.text(endToken)]);
    },
    image: deferredConversion(
      recoveringConvertImage(options.convertImage || images.dataUri)
    ),
    table: convertTable,
    tableRow: convertTableRow,
    tableCell: convertTableCell,
    break: convertBreak,
  };
  return {
    convertToHtml,
  };
}

var deferredId = 1;

function encodeTrackedChangePayload(payload) {
  return encodeURIComponent(JSON.stringify(payload));
}

function extractTextFromElements(elements) {
  var text = '';
  for (var i = 0; i < elements.length; i++) {
    var element = elements[i];
    if (element.type === 'text') {
      text += element.value;
    } else if (element.type === 'paragraph') {
      text += extractTextFromElements(element.children || []) + '\n';
    } else if (element.children) {
      text += extractTextFromElements(element.children);
    }
  }
  return text;
}

function deferredConversion(func) {
  return (element, messages, options) => [
    {
      type: 'deferred',
      id: deferredId++,
      value() {
        return func(element, messages, options);
      },
    },
  ];
}

function unrecognisedStyleWarning(type, element) {
  return results.warning(
    'Unrecognised ' +
      type +
      " style: '" +
      element.styleName +
      "'" +
      ' (Style ID: ' +
      element.styleId +
      ')'
  );
}

function flatMap(values, func) {
  return _.flatten(values.map(func), true);
}

function walkHtml(nodes, callback) {
  nodes.forEach((node) => {
    callback(node);
    if (node.children) {
      walkHtml(node.children, callback);
    }
  });
}

var commentAuthorLabel = (exports.commentAuthorLabel =
  function commentAuthorLabel(comment) {
    return comment.authorInitials || '';
  });
