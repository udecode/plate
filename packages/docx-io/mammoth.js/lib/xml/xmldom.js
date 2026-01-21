var xmldom = require("@xmldom/xmldom");
var dom = require("@xmldom/xmldom/lib/dom");

function parseFromString(string) {
	var errors = [];

	var domParser = new xmldom.DOMParser({
		errorHandler: function (level, message) {
			errors.push({ level: level, message: message });
		},
	});

	var document = domParser.parseFromString(string);

	if (errors.length === 0) {
		return document;
	} else {
		var errorMessages = errors
			.map(function (e) {
				return e.level + ": " + e.message;
			})
			.join("\n");
		throw new Error(errorMessages);
	}
}

exports.parseFromString = parseFromString;
exports.Node = dom.Node;
