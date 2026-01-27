.PHONY: test setup install

test:
	bun test

setup: install mammoth.browser.min.js

install:
	bun install

mammoth.browser.js: install
	bunx browserify lib/index.js --standalone mammoth -p browserify-prepend-licenses > $@

mammoth.browser.min.js: mammoth.browser.js install
	bunx uglifyjs mammoth.browser.js -c -m > $@
