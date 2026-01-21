var _ = require('underscore');

var types = (exports.types = {
  document: 'document',
  paragraph: 'paragraph',
  run: 'run',
  text: 'text',
  tab: 'tab',
  checkbox: 'checkbox',
  hyperlink: 'hyperlink',
  noteReference: 'noteReference',
  image: 'image',
  note: 'note',
  commentReference: 'commentReference',
  comment: 'comment',
  commentRangeStart: 'commentRangeStart',
  commentRangeEnd: 'commentRangeEnd',
  inserted: 'inserted',
  deleted: 'deleted',
  table: 'table',
  tableRow: 'tableRow',
  tableCell: 'tableCell',
  break: 'break',
  bookmarkStart: 'bookmarkStart',
});

function Document(children, options) {
  options = options || {};
  return {
    type: types.document,
    children,
    notes: options.notes || new Notes({}),
    comments: options.comments || [],
  };
}

function Paragraph(children, properties) {
  properties = properties || {};
  var indent = properties.indent || {};
  return {
    type: types.paragraph,
    children,
    styleId: properties.styleId || null,
    styleName: properties.styleName || null,
    numbering: properties.numbering || null,
    alignment: properties.alignment || null,
    indent: {
      start: indent.start || null,
      end: indent.end || null,
      firstLine: indent.firstLine || null,
      hanging: indent.hanging || null,
    },
  };
}

function Run(children, properties) {
  properties = properties || {};
  return {
    type: types.run,
    children,
    styleId: properties.styleId || null,
    styleName: properties.styleName || null,
    isBold: !!properties.isBold,
    isUnderline: !!properties.isUnderline,
    isItalic: !!properties.isItalic,
    isStrikethrough: !!properties.isStrikethrough,
    isAllCaps: !!properties.isAllCaps,
    isSmallCaps: !!properties.isSmallCaps,
    verticalAlignment:
      properties.verticalAlignment || verticalAlignment.baseline,
    font: properties.font || null,
    fontSize: properties.fontSize || null,
    highlight: properties.highlight || null,
  };
}

var verticalAlignment = {
  baseline: 'baseline',
  superscript: 'superscript',
  subscript: 'subscript',
};

function Text(value) {
  return {
    type: types.text,
    value,
  };
}

function Tab() {
  return {
    type: types.tab,
  };
}

function Checkbox(options) {
  return {
    type: types.checkbox,
    checked: options.checked,
  };
}

function Hyperlink(children, options) {
  return {
    type: types.hyperlink,
    children,
    href: options.href,
    anchor: options.anchor,
    targetFrame: options.targetFrame,
  };
}

function NoteReference(options) {
  return {
    type: types.noteReference,
    noteType: options.noteType,
    noteId: options.noteId,
  };
}

function Notes(notes) {
  this._notes = _.indexBy(notes, (note) => noteKey(note.noteType, note.noteId));
}

Notes.prototype.resolve = function (reference) {
  return this.findNoteByKey(noteKey(reference.noteType, reference.noteId));
};

Notes.prototype.findNoteByKey = function (key) {
  return this._notes[key] || null;
};

function Note(options) {
  return {
    type: types.note,
    noteType: options.noteType,
    noteId: options.noteId,
    body: options.body,
  };
}

function commentReference(options) {
  return {
    type: types.commentReference,
    commentId: options.commentId,
  };
}

function comment(options) {
  return {
    type: types.comment,
    commentId: options.commentId,
    body: options.body,
    authorName: options.authorName || null,
    authorInitials: options.authorInitials || null,
    date: options.date || null,
  };
}

function commentRangeStart(options) {
  return {
    type: types.commentRangeStart,
    commentId: options.commentId,
  };
}

function commentRangeEnd(options) {
  return {
    type: types.commentRangeEnd,
    commentId: options.commentId,
  };
}

function inserted(children, options) {
  options = options || {};
  return {
    type: types.inserted,
    children,
    author: options.author || null,
    date: options.date || null,
    changeId: options.changeId || null,
  };
}

function deleted(children, options) {
  options = options || {};
  return {
    type: types.deleted,
    children,
    author: options.author || null,
    date: options.date || null,
    changeId: options.changeId || null,
  };
}

function noteKey(noteType, id) {
  return noteType + '-' + id;
}

function Image(options) {
  return {
    type: types.image,
    // `read` is retained for backwards compatibility, but other read
    // methods should be preferred.
    read(encoding) {
      if (encoding) {
        return options.readImage(encoding);
      }
      return options
        .readImage()
        .then((arrayBuffer) => Buffer.from(arrayBuffer));
    },
    readAsArrayBuffer() {
      return options.readImage();
    },
    readAsBase64String() {
      return options.readImage('base64');
    },
    readAsBuffer() {
      return options
        .readImage()
        .then((arrayBuffer) => Buffer.from(arrayBuffer));
    },
    altText: options.altText,
    contentType: options.contentType,
  };
}

function Table(children, properties) {
  properties = properties || {};
  return {
    type: types.table,
    children,
    styleId: properties.styleId || null,
    styleName: properties.styleName || null,
  };
}

function TableRow(children, options) {
  options = options || {};
  return {
    type: types.tableRow,
    children,
    isHeader: options.isHeader || false,
  };
}

function TableCell(children, options) {
  options = options || {};
  return {
    type: types.tableCell,
    children,
    colSpan: options.colSpan == null ? 1 : options.colSpan,
    rowSpan: options.rowSpan == null ? 1 : options.rowSpan,
  };
}

function Break(breakType) {
  return {
    type: types['break'],
    breakType,
  };
}

function BookmarkStart(options) {
  return {
    type: types.bookmarkStart,
    name: options.name,
  };
}

exports.document = exports.Document = Document;
exports.paragraph = exports.Paragraph = Paragraph;
exports.run = exports.Run = Run;
exports.text = exports.Text = Text;
exports.tab = exports.Tab = Tab;
exports.checkbox = exports.Checkbox = Checkbox;
exports.Hyperlink = Hyperlink;
exports.noteReference = exports.NoteReference = NoteReference;
exports.Notes = Notes;
exports.Note = Note;
exports.commentReference = commentReference;
exports.comment = comment;
exports.commentRangeStart = commentRangeStart;
exports.commentRangeEnd = commentRangeEnd;
exports.inserted = inserted;
exports.deleted = deleted;
exports.Image = Image;
exports.Table = Table;
exports.TableRow = TableRow;
exports.TableCell = TableCell;
exports.lineBreak = Break('line');
exports.pageBreak = Break('page');
exports.columnBreak = Break('column');
exports.BookmarkStart = BookmarkStart;

exports.verticalAlignment = verticalAlignment;
