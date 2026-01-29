var _ = require('underscore');

function symmetricMarkdownElement(end) {
  return markdownElement(end, end);
}

function markdownElement(start, end) {
  return () => ({ start, end });
}

function markdownLink(attributes) {
  var href = attributes.href || '';
  if (href) {
    return {
      start: '[',
      end: '](' + href + ')',
      anchorPosition: 'before',
    };
  }
  return {};
}

function markdownImage(attributes) {
  var src = attributes.src || '';
  var altText = attributes.alt || '';
  if (src || altText) {
    return { start: '![' + altText + '](' + src + ')' };
  }
  return {};
}

function markdownList(options) {
  return (attributes, list) => ({
    start: list ? '\n' : '',
    end: list ? '' : '\n',
    list: {
      isOrdered: options.isOrdered,
      indent: list ? list.indent + 1 : 0,
      count: 0,
    },
  });
}

function markdownListItem(attributes, list, listItem) {
  list = list || { indent: 0, isOrdered: false, count: 0 };
  list.count++;
  listItem.hasClosed = false;

  var bullet = list.isOrdered ? list.count + '.' : '-';
  var start = repeatString('\t', list.indent) + bullet + ' ';

  return {
    start,
    end() {
      if (!listItem.hasClosed) {
        listItem.hasClosed = true;
        return '\n';
      }
    },
  };
}

var htmlToMarkdown = {
  p: markdownElement('', '\n\n'),
  br: markdownElement('', '  \n'),
  ul: markdownList({ isOrdered: false }),
  ol: markdownList({ isOrdered: true }),
  li: markdownListItem,
  strong: symmetricMarkdownElement('__'),
  em: symmetricMarkdownElement('*'),
  a: markdownLink,
  img: markdownImage,
};

(() => {
  for (var i = 1; i <= 6; i++) {
    htmlToMarkdown['h' + i] = markdownElement(
      repeatString('#', i) + ' ',
      '\n\n'
    );
  }
})();

function repeatString(value, count) {
  return new Array(count + 1).join(value);
}

function markdownWriter() {
  var fragments = [];
  var elementStack = [];
  var list = null;
  var listItem = {};

  function open(tagName, attributes) {
    attributes = attributes || {};

    var createElement = htmlToMarkdown[tagName] || (() => ({}));
    var element = createElement(attributes, list, listItem);
    elementStack.push({ end: element.end, list });

    if (element.list) {
      list = element.list;
    }

    var anchorBeforeStart = element.anchorPosition === 'before';
    if (anchorBeforeStart) {
      writeAnchor(attributes);
    }

    fragments.push(element.start || '');
    if (!anchorBeforeStart) {
      writeAnchor(attributes);
    }
  }

  function writeAnchor(attributes) {
    if (attributes.id) {
      fragments.push('<a id="' + attributes.id + '"></a>');
    }
  }

  function close(tagName) {
    var element = elementStack.pop();
    list = element.list;
    var end = _.isFunction(element.end) ? element.end() : element.end;
    fragments.push(end || '');
  }

  function selfClosing(tagName, attributes) {
    open(tagName, attributes);
    close(tagName);
  }

  function text(value) {
    fragments.push(escapeMarkdown(value));
  }

  function asString() {
    return fragments.join('');
  }

  return {
    asString,
    open,
    close,
    text,
    selfClosing,
  };
}

exports.writer = markdownWriter;

function escapeMarkdown(value) {
  return value.replace(/\\/g, '\\\\').replace(/([`*_{}[\]()#+\-.!])/g, '\\$1');
}
