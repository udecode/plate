exports.readContentTypesFromXml = readContentTypesFromXml;

var fallbackContentTypes = {
	png: "png",
	gif: "gif",
	jpeg: "jpeg",
	jpg: "jpeg",
	tif: "tiff",
	tiff: "tiff",
	bmp: "bmp",
};

exports.defaultContentTypes = contentTypes({}, {});

function readContentTypesFromXml(element) {
	var extensionDefaults = {};
	var overrides = {};

	if (!element || !element.children) {
		return contentTypes(overrides, extensionDefaults);
	}

	element.children.forEach(function (child) {
		if (!child || !child.attributes) return;

		if (child.name === "content-types:Default") {
			extensionDefaults[child.attributes.Extension] =
				child.attributes.ContentType;
		}
		if (child.name === "content-types:Override") {
			var name = child.attributes.PartName;
			if (name && name.charAt(0) === "/") {
				name = name.substring(1);
			}
			if (name) {
				overrides[name] = child.attributes.ContentType;
			}
		}
	});
	return contentTypes(overrides, extensionDefaults);
}

function contentTypes(overrides, extensionDefaults) {
	return {
		findContentType: function (path) {
			if (!path) return null;

			var overrideContentType = overrides[path];
			if (overrideContentType) {
				return overrideContentType;
			} else {
				var pathParts = path.split(".");
				var extension = pathParts[pathParts.length - 1];
				var extensionLower = extension.toLowerCase();
				if (
					extensionDefaults.hasOwnProperty(extension) ||
					extensionDefaults.hasOwnProperty(extensionLower)
				) {
					return (
						extensionDefaults[extension] || extensionDefaults[extensionLower]
					);
				} else {
					var fallback = fallbackContentTypes[extensionLower];
					if (fallback) {
						return "image/" + fallback;
					} else {
						return null;
					}
				}
			}
		},
	};
}
