# SuperDoc
## SuperDoc: Init a docx from HTML content

An example of initializing SuperDoc with HTML content.

This example will initialize a docx file in SuperDoc (either a blank file or your own file), replacing the file's main contents with the HTML provided.

Note: In the example we pass in `document: sample-document.docx` in the config, which loads our sample docx containing a header and footer. The inner contents are replaced with the HTML. You can simply **omit** this key and SuperDoc will initialize a blank document for your HTML.
