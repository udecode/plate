/* global process */

var fs = require("fs");
var path = require("path");

var mammoth = require("./");
var promises = require("./promises");
var images = require("./images");

function main(argv) {
	var docxPath = argv["docx-path"];
	var outputPath = argv["output-path"];
	var outputDir = argv.output_dir;
	var outputFormat = argv.output_format;
	var styleMapPath = argv.style_map;

	readStyleMap(styleMapPath)
		.then(function (styleMap) {
			var options = {
				styleMap: styleMap,
				outputFormat: outputFormat,
			};

			if (outputDir) {
				var basename = path.basename(docxPath, ".docx");
				outputPath = path.join(outputDir, basename + ".html");
				var imageIndex = 0;
				options.convertImage = images.imgElement(function (element) {
					imageIndex++;
					var contentTypeParts = (element.contentType || "").split("/");
					var extension = contentTypeParts[1] || "bin";
					var filename = imageIndex + "." + extension;

					return element
						.read()
						.then(function (imageBuffer) {
							var imagePath = path.join(outputDir, filename);
							return promises.nfcall(fs.writeFile, imagePath, imageBuffer);
						})
						.then(function () {
							return { src: filename };
						});
				});
			}

			return mammoth
				.convert({ path: docxPath }, options)
				.then(function (result) {
					result.messages.forEach(function (message) {
						process.stderr.write(message.message);
						process.stderr.write("\n");
					});

					var outputStream = outputPath
						? fs.createWriteStream(outputPath)
						: process.stdout;

					return new Promise(function (resolve, reject) {
						outputStream.write(result.value, function (err) {
							if (err) reject(err);
							else resolve();
						});
					});
				});
		})
		.then(function () {
			process.exit(0);
		})
		.catch(function (err) {
			process.stderr.write("Error: " + err.message + "\n");
			process.exit(1);
		});
}

function readStyleMap(styleMapPath) {
	if (styleMapPath) {
		return promises.nfcall(fs.readFile, styleMapPath, "utf8");
	} else {
		return promises.resolve(null);
	}
}

module.exports = main;
