# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.8.0](https://github.com/privateOmega/html-to-docx/compare/v1.7.0...v1.8.0) (2023-03-26)


### Features

* adds lang variable to the styles ([1102a5b](https://github.com/privateOmega/html-to-docx/commit/1102a5bd707bd7130ef047f33f94d0b665d6a82c))
* **font-family:** use the first element as the font name ([d62ecdc](https://github.com/privateOmega/html-to-docx/commit/d62ecdcf3d887bc23aa7c8e3f916db7444a48d96))
* **font:** register fonts in fontTable.xml ([013938e](https://github.com/privateOmega/html-to-docx/commit/013938ef0c46bcac5aa24c8b659763cdf916066b))


### Bug Fixes

* skip head tag from processing ([a3eedbc](https://github.com/privateOmega/html-to-docx/commit/a3eedbc375af33891bb4b474c4b957c825e96b1a))

## [1.7.0](https://github.com/privateOmega/html-to-docx/compare/v1.6.5...v1.7.0) (2023-03-19)


### Bug Fixes

* add option to decode unicode in order to prevent crash ([95d3419](https://github.com/privateOmega/html-to-docx/commit/95d3419fa9d5590deb9541f28dda813843592562))
* support plain text ([7b2ca06](https://github.com/privateOmega/html-to-docx/commit/7b2ca06c9ded9450d84cad5305a19c87d166daf3))
* use image alt as description for images ([46d1fb8](https://github.com/privateOmega/html-to-docx/commit/46d1fb8bead9ebb6f47a131c20247c316d638e6d))
* use image alt as description for images in paragraphs ([4d4da94](https://github.com/privateOmega/html-to-docx/commit/4d4da9457c74820bee0acd03f2dc1459bc2fa1e4))

### [1.6.5](https://github.com/privateOmega/html-to-docx/compare/v1.6.4...v1.6.5) (2023-01-17)

### [1.6.4](https://github.com/privateOmega/html-to-docx/compare/v1.6.3...v1.6.4) (2022-11-18)


### Bug Fixes

* force point to specific versions of @oozcitak/util and @oozcitak/dom ([968d8e1](https://github.com/privateOmega/html-to-docx/commit/968d8e1ccd1c6e21868c9bd01a012f3010677281))

### [1.6.3](https://github.com/privateOmega/html-to-docx/compare/v1.6.2...v1.6.3) (2022-11-17)


### Bug Fixes

* add pre-install script to force resolutions ([8f2ab68](https://github.com/privateOmega/html-to-docx/commit/8f2ab68e2d358ca96209b7df1065d403e2259c8a))
* add resolutions for xmlbuilder2 deps ([70e2ce1](https://github.com/privateOmega/html-to-docx/commit/70e2ce1cb3c6a4d8e814653a2746831bb3fb9e86))
* upgrades the xmlbuilder2 dependency version (Closes [#92](https://github.com/privateOmega/html-to-docx/issues/92)) ([108e1e9](https://github.com/privateOmega/html-to-docx/commit/108e1e92cc1b5a1e2d2d3958fa8086ef573274ef))

### [1.6.2](https://github.com/privateOmega/html-to-docx/compare/v1.6.1...v1.6.2) (2022-11-17)


### Bug Fixes

* add support for different units for column width and row height ([6286870](https://github.com/privateOmega/html-to-docx/commit/62868700852a07adf4ff39db2206fa64ba7c0efe))

### [1.6.1](https://github.com/privateOmega/html-to-docx/compare/v1.6.0...v1.6.1) (2022-11-16)

## [1.6.0](https://github.com/privateOmega/html-to-docx/compare/v1.5.0...v1.6.0) (2022-11-16)


### Features

* add pageSize as an optional additional document option ([ed9aeda](https://github.com/privateOmega/html-to-docx/commit/ed9aedaf1ad462bd0ce5d284fd915d24d280c428))
* include pageSize as an optional additional document option ([5aa34d5](https://github.com/privateOmega/html-to-docx/commit/5aa34d5dd6851001c53551a602f8b46ab538564e))


### Bug Fixes

* add null check for formatting that is not supported ([969e31b](https://github.com/privateOmega/html-to-docx/commit/969e31b044ed2d7764d4bf887b732e2a3afc7b57))
* add options param in modifiedStyleAttributesBbilder to support paragraph-only attributes ([b113dfb](https://github.com/privateOmega/html-to-docx/commit/b113dfb43a4ef5a2e253627f5eda8dd19cf1655f))
* change page size ternary order ([88938f3](https://github.com/privateOmega/html-to-docx/commit/88938f3efef46d8a9d310d9325cb6b476d1bec71))
* corrected case for decimal return value ([680b239](https://github.com/privateOmega/html-to-docx/commit/680b239ad56af3498c5da7c0cf834105ee8a1842))
* dont override maxwidth if already present ([678d6ad](https://github.com/privateOmega/html-to-docx/commit/678d6adfbb202a0604c2be805a36edeac0220530))
* replace options to use tiernary conditional operator ([da2d38e](https://github.com/privateOmega/html-to-docx/commit/da2d38e1061fa59c9e54832f39611bbb831d8390))
* update default height and width measurements ([5614566](https://github.com/privateOmega/html-to-docx/commit/5614566c2b067a14c5eb8d286b4fc8c3177cfd99))
* update unordered list symbol unicode ([e80f785](https://github.com/privateOmega/html-to-docx/commit/e80f7851b6c1dce3cd6430382960686dcb0d9db7))
* use symbol instead of wingdings font for bullet symbol ([8d62648](https://github.com/privateOmega/html-to-docx/commit/8d62648db4de82c56da4d772d6ed64ac23bb1e5d))

## [1.5.0](https://github.com/privateOmega/html-to-docx/compare/v1.4.0...v1.5.0) (2022-10-25)


### Features

* add support for nested images ([882014f](https://github.com/privateOmega/html-to-docx/commit/882014f4017359139dbbfd5f7c8c14cae48f55bf))
* add support for urls in image src ([60c7e5b](https://github.com/privateOmega/html-to-docx/commit/60c7e5bcefaaee26068206087be0345d0c79b988))
* add valid url regex and util method ([c5020ce](https://github.com/privateOmega/html-to-docx/commit/c5020ce220e324c7ba0d48976998604162b3a73f))


### Bug Fixes

* address issues with nested base64 images ([78f7e58](https://github.com/privateOmega/html-to-docx/commit/78f7e580b4cfe659f72ec24d2317f75e3fb35d54))
* address issues with nested images ([854b46e](https://github.com/privateOmega/html-to-docx/commit/854b46e3c337668005a0ecdb60d47b3723e98934))
* move url regex into the util function ([e9b289b](https://github.com/privateOmega/html-to-docx/commit/e9b289b6f27f89ec9bc5219a57621987f9522fc5))

## [1.4.0](https://github.com/privateOmega/html-to-docx/compare/v1.3.2...v1.4.0) (2022-06-01)


### Bug Fixes

* add support for multi level nested formatting ([48a98bc](https://github.com/privateOmega/html-to-docx/commit/48a98bc9a0352800f22c0c518e9ee432cd7ee19e))
* parent styles to children ([b0d004b](https://github.com/privateOmega/html-to-docx/commit/b0d004b64ee5ce47ca71137c581923e2e4ce4e77))
* point regex ([fb82509](https://github.com/privateOmega/html-to-docx/commit/fb8250997a7c9fef6538fdadfc0c2c1d8430ea18))

### [1.3.2](https://github.com/privateOmega/html-to-docx/compare/v1.3.1...v1.3.2) (2022-01-23)


### Features

* add support for lists within table cells ([b7d5ce7](https://github.com/privateOmega/html-to-docx/commit/b7d5ce7c6381c8e5ea79e537ee78768c9fefdbb5))
* allow different list style types ([5579be2](https://github.com/privateOmega/html-to-docx/commit/5579be26639286bd0abd75cd3957795b52f044d3))

### [1.3.1](https://github.com/privateOmega/html-to-docx/compare/v1.3.0...v1.3.1) (2021-12-27)

## [1.3.0](https://github.com/privateOmega/html-to-docx/compare/v1.2.4...v1.3.0) (2021-12-27)


### Features

* **indentation:** html margins to indentation [#106](https://github.com/privateOmega/html-to-docx/issues/106) ([0a8d6e6](https://github.com/privateOmega/html-to-docx/commit/0a8d6e6a8cfeffd9543e17e7d4bc729dfde88ed4))


### Bug Fixes

* generate numbering for independent list types ([67151ce](https://github.com/privateOmega/html-to-docx/commit/67151ce957b01d4563b95def543f0bc004036153))
* generating numbering xml based on type instead of type elements ([56c165e](https://github.com/privateOmega/html-to-docx/commit/56c165e6d5f9b3f26adc6508137022dbb69dae52))
* nanoid api usage ([4aa4edc](https://github.com/privateOmega/html-to-docx/commit/4aa4edc088dcf4e031b850754a9f7b2d6740a6c3))
* revert optional chaining on border check ([9ae5982](https://github.com/privateOmega/html-to-docx/commit/9ae59826b9885e867bfde26900e76fe34c1413b5))
* update @rollup/plugin-node-resolve usage ([c359d92](https://github.com/privateOmega/html-to-docx/commit/c359d92afc7373fc5f236b61e8176c6bda3b7310))
* update html-to-vdom import ([fbca2d3](https://github.com/privateOmega/html-to-docx/commit/fbca2d3b38edf6c14f883bf3f6f4eda1d8b55a8f))

### [1.2.4](https://github.com/privateOmega/html-to-docx/compare/v1.2.3...v1.2.4) (2021-09-20)


### Bug Fixes

* spacing issue in between tags and text on multiple lines ([98e1a8d](https://github.com/privateOmega/html-to-docx/commit/98e1a8d710a92e894513fdef120417849e932de6))

### [1.2.3](https://github.com/privateOmega/html-to-docx/compare/v1.2.2...v1.2.3) (2021-09-15)


### Features

* add support for code tag ([70a9485](https://github.com/privateOmega/html-to-docx/commit/70a948503d6b8c11b3f46141578047361c0bba87))
* add support for pre tag ([c43ed9e](https://github.com/privateOmega/html-to-docx/commit/c43ed9e3bef91d1c95eddb8779df8e2d2e7f151b))


### Bug Fixes

* add support for nested code and pre tags ([7a504e1](https://github.com/privateOmega/html-to-docx/commit/7a504e10af3819829a7cfc0d6fd2ef86e1dc289b))

### [1.2.2](https://github.com/privateOmega/html-to-docx/compare/v1.2.1...v1.2.2) (2021-07-17)


### Features

* **schema:** add theme ([d5aef3b](https://github.com/privateOmega/html-to-docx/commit/d5aef3b65376e71b594d494ae8426cab5ad5178c))
* added line numbers ([f87202c](https://github.com/privateOmega/html-to-docx/commit/f87202c4d4cd534e830d3a59d33b9cc27cf6d654))

### [1.2.1](https://github.com/privateOmega/html-to-docx/compare/v1.2.0...v1.2.1) (2021-06-05)

## [1.2.0](https://github.com/privateOmega/html-to-docx/compare/v1.1.34...v1.2.0) (2021-06-05)


### Features

* Headings should have headings style ([8a731bb](https://github.com/privateOmega/html-to-docx/commit/8a731bb430c64fd3608e5baac53d4f4074770664))


### Bug Fixes

* added browser module building support ([343867a](https://github.com/privateOmega/html-to-docx/commit/343867ab000cb14e813344b3bcb535aa67e00808))
* changed all imports to esm style ([d02320b](https://github.com/privateOmega/html-to-docx/commit/d02320bf22eefd3cf5fb90966b68e3d004ca9c1e))
* changed default value to "Normal" ([b0e67d8](https://github.com/privateOmega/html-to-docx/commit/b0e67d8fdef6f339700133095bfd828993e48183))
* moved to shortid for filename ([81ae184](https://github.com/privateOmega/html-to-docx/commit/81ae1848fa7359f4d7297b87b47fca96017d485d))
* removed code made redundant with heading styles ([48da1dc](https://github.com/privateOmega/html-to-docx/commit/48da1dc1686a0b45ab56cfaa24db421772c5945e))
* renamed method to more descriptive name ([b211f20](https://github.com/privateOmega/html-to-docx/commit/b211f205ddf03dab3c647bf0b91439677a33fb61))
* renamed to paragraphStyle ([a1c4429](https://github.com/privateOmega/html-to-docx/commit/a1c442942de956533fdfda03d4ced748fde06cb1))
* replaced html-minifier with regex replacement ([d6c9b38](https://github.com/privateOmega/html-to-docx/commit/d6c9b38ed485f73c14b759ad99bf4d3c91d9e07b))
* updated example to use umd build ([078fa5d](https://github.com/privateOmega/html-to-docx/commit/078fa5dd6174be4fe314b469999f1b1010353c68))

### [1.1.34](https://github.com/privateOmega/html-to-docx/compare/v1.1.33...v1.1.34) (2021-02-07)


### Bug Fixes

* superscript ([2fd87fd](https://github.com/privateOmega/html-to-docx/commit/2fd87fd406a97732e24d7f191147638ee7053ced))

### [1.1.33](https://github.com/privateOmega/html-to-docx/compare/v1.1.32...v1.1.33) (2021-01-20)


### Features

* added indentation support ([9c1c3a4](https://github.com/privateOmega/html-to-docx/commit/9c1c3a4d539f4dfeda2ab6484d69236a91ec5ae1))
* added row span support ([8f56a4a](https://github.com/privateOmega/html-to-docx/commit/8f56a4aae59b87d1e86e299bd88bb2bf0115d639))
* added skip first header footer flag ([7710f28](https://github.com/privateOmega/html-to-docx/commit/7710f2803e64eb3645a7e7440a326664159e340a))
* added table grid fragment from table row generator ([f8c4380](https://github.com/privateOmega/html-to-docx/commit/f8c4380ff5b7ff7b7df40c70f8a05938e4bacddf))


### Bug Fixes

* add table cell borders to span cells ([09b65e3](https://github.com/privateOmega/html-to-docx/commit/09b65e316a868a6e2e5032ab1889e817007d2b47))
* row span cell generation ([d93ad9c](https://github.com/privateOmega/html-to-docx/commit/d93ad9c41225e7b07d9eb0d8c3a55602e65ec30b))

### 1.1.32 (2020-12-04)


### Features

* **packaging:** added jszip for packaging ([89619ec](https://github.com/privateOmega/html-to-docx/commit/89619ec702564fb9c5eccaee55e65d366fcbacad))
* **packaging:** added method to create container ([9808cf2](https://github.com/privateOmega/html-to-docx/commit/9808cf211bbb50cf3d7cbe122d01c82d4272e888))
* added font size support ([0f27c60](https://github.com/privateOmega/html-to-docx/commit/0f27c609baa5b9488bc195dff1c060bcc04bbf2d))
* **template:** added base docx template ([abdb87b](https://github.com/privateOmega/html-to-docx/commit/abdb87bdfead91890f9d54e2cedd038e916b6dce))
* abstracted conversion using docxDocument class ([c625a01](https://github.com/privateOmega/html-to-docx/commit/c625a0181a6c328c0319b579fa1173192dff1187))
* added b tag support ([f867abd](https://github.com/privateOmega/html-to-docx/commit/f867abd41c6bc85bbba207a27c58d441f1a2b532))
* added builder methods for images ([9e2720f](https://github.com/privateOmega/html-to-docx/commit/9e2720f261a46701c8a2581aadafa9b60e6cee6b))
* added css border string parser ([15562e8](https://github.com/privateOmega/html-to-docx/commit/15562e817732d1d85b99fd33921694f2e3ad3ad7))
* added css color string ([cb0db2f](https://github.com/privateOmega/html-to-docx/commit/cb0db2ff2d3f2f66df823dbafbc5603030241bc3))
* added document file render helper ([6dd9c3a](https://github.com/privateOmega/html-to-docx/commit/6dd9c3a01f5fceab78404d8ebddb848fb91c933c))
* added eip conversions ([9d6e317](https://github.com/privateOmega/html-to-docx/commit/9d6e3171c0b0f9d71f776762357d4a329778cedb))
* added em tag support ([6a06265](https://github.com/privateOmega/html-to-docx/commit/6a06265f724a611b50144cb988e576bc4e40b4d4))
* added escape-html ([1a231d5](https://github.com/privateOmega/html-to-docx/commit/1a231d5dde3e6f9b5a23f248e19063191c07e54f))
* added font support in styles ([18b3281](https://github.com/privateOmega/html-to-docx/commit/18b3281ac3f91e5c1905efa0487354ff78badec2))
* added font table ([0903d6b](https://github.com/privateOmega/html-to-docx/commit/0903d6b98fae6dc378cdeafdadd80a86501c9959))
* added footer support ([24f60df](https://github.com/privateOmega/html-to-docx/commit/24f60df94d755689493b761340d16d090c8b1b16))
* added generic rels xml string ([7d2ea84](https://github.com/privateOmega/html-to-docx/commit/7d2ea8404093fd99ce5e6bccaedaf3603830f574))
* added header generation ([25fb44f](https://github.com/privateOmega/html-to-docx/commit/25fb44f945df3fdc5f37d619b3de3ebe68b84cd6))
* added header relationship support ([cc08355](https://github.com/privateOmega/html-to-docx/commit/cc083553e28a3ed88da3cc27ef0de0cbb26350b3))
* added heading sizes ([bb18e72](https://github.com/privateOmega/html-to-docx/commit/bb18e724c42b0c4581722b2899d5ff808c1495c4))
* added headings support ([fd489ee](https://github.com/privateOmega/html-to-docx/commit/fd489eeebfeedc7d05991f9366aeae2adc49fd6f))
* added highlight support ([6159925](https://github.com/privateOmega/html-to-docx/commit/6159925495b74ab254cd7dc5628526d531595a92))
* added horizontal text alignment ([d29669f](https://github.com/privateOmega/html-to-docx/commit/d29669ffdb0d63b7bdbbe09c6bca990e4c28cfb8))
* added hsl conversion support ([153fa43](https://github.com/privateOmega/html-to-docx/commit/153fa43f84c640085f45823bc2054b24c28023d0))
* added hyperlink styling ([6c3f1bd](https://github.com/privateOmega/html-to-docx/commit/6c3f1bd92f5c7b4ddf74beb1fc3f4e2e6b4762f5))
* added hyperlinks support ([3560ce9](https://github.com/privateOmega/html-to-docx/commit/3560ce9f23fa8f590aa340302bf0059c8dfb6d5f))
* added ins tag support ([6d64908](https://github.com/privateOmega/html-to-docx/commit/6d64908858dac290aa34421c236bdaf2d8ef07a7))
* added line height support ([3d0ea2f](https://github.com/privateOmega/html-to-docx/commit/3d0ea2fe56d13893e3c5cd0e4a35e7b26b7c1d0a))
* added linebreak support ([57c054c](https://github.com/privateOmega/html-to-docx/commit/57c054cd65f49d7c4244272af0117f2c141a8bc7))
* added method to archive images with other files ([b6da74b](https://github.com/privateOmega/html-to-docx/commit/b6da74be10be03d689ca044f3f95dd724a3a29b6))
* added minimum width support to tables ([b10d820](https://github.com/privateOmega/html-to-docx/commit/b10d820061b10531aa027fde304fbe3ceac849d5))
* added more unit converters ([8f78c52](https://github.com/privateOmega/html-to-docx/commit/8f78c5241cf33d471c8b08e3f941f401d6a50d7b))
* added more xml builder methods ([ffc584b](https://github.com/privateOmega/html-to-docx/commit/ffc584bed7ab434431999517a3308483ba99489a))
* added more xml statment builder methods ([337e530](https://github.com/privateOmega/html-to-docx/commit/337e5305aa8768b6507323bec2279d557a35b67b))
* added other measure units for margins and fonts ([1ae584a](https://github.com/privateOmega/html-to-docx/commit/1ae584a1b0a5350943e10c0d129402b843d7b9a2))
* added page break support ([085ed2a](https://github.com/privateOmega/html-to-docx/commit/085ed2a2cb439ee2a4189b3664deca047926672b))
* added page number support ([84ea1c3](https://github.com/privateOmega/html-to-docx/commit/84ea1c31923b4c4be6e46c892fbecb44c9c7689c))
* added strike through support ([b73e8c7](https://github.com/privateOmega/html-to-docx/commit/b73e8c76d0051bc6449ed57861b4ce1c7ad4b408))
* added support for span font sizing ([98b4844](https://github.com/privateOmega/html-to-docx/commit/98b4844858f967bd5a3932262d0b535cd53d499d))
* added support for subscript and superscript ([f1ee4ed](https://github.com/privateOmega/html-to-docx/commit/f1ee4edf183a45731b48bba2b91154da591c203f))
* added table max width support ([49ab5d3](https://github.com/privateOmega/html-to-docx/commit/49ab5d3876cdd58c2efd1b492fc5bb41e9a857e7))
* **template:** added styles schema ([d83d230](https://github.com/privateOmega/html-to-docx/commit/d83d230a66807f6ad08ebb4a6c0c5299c311aaf5))
* added table row cant split option ([252178c](https://github.com/privateOmega/html-to-docx/commit/252178c922d9910b8a89e6c4e30fafd2994d92d7))
* added table row height support ([031c3aa](https://github.com/privateOmega/html-to-docx/commit/031c3aa963e5a7b2ee985ae8ac6ff612c89ae974))
* added text formatting to paragraph ([bacd888](https://github.com/privateOmega/html-to-docx/commit/bacd888253a35a18ac7ea4e9141d4a4fb60e3cf7))
* added valign to table cell element ([20e94f1](https://github.com/privateOmega/html-to-docx/commit/20e94f18370e8a92034f6d35f5e744ceb57ed774))
* added vdom to xml method ([8b5a618](https://github.com/privateOmega/html-to-docx/commit/8b5a6185e6e211b0e07b9f1c1b7e23fb4b13dc9c))
* added virtual-dom and html-to-vdom ([feaa396](https://github.com/privateOmega/html-to-docx/commit/feaa396162465276d19b7d3d5c51a533987a1738))
* added xbuilder ([f13b5cc](https://github.com/privateOmega/html-to-docx/commit/f13b5cc06d29ae53493f1f4b8fdef6e8986e64e6))
* added xml builder methods for images ([f413ad8](https://github.com/privateOmega/html-to-docx/commit/f413ad89b263c63a8fb9890b44b1b219a7413c4b))
* added xml statement builder helper ([5e23c16](https://github.com/privateOmega/html-to-docx/commit/5e23c1636eb3c64f52589f1ac71a48dec3df65c2))
* changed list parsing to support nested lists ([4339f2f](https://github.com/privateOmega/html-to-docx/commit/4339f2f9d2bdc5ffd68def80449c9bce8c09c9a9))
* enabling header on flag ([516463c](https://github.com/privateOmega/html-to-docx/commit/516463cd532e58895faa8dd465b7e725f0de59e3))
* handle line breaks ([164c0f5](https://github.com/privateOmega/html-to-docx/commit/164c0f5e17f62e3f30da25be6e181d3414ca4dde))
* **template:** added numbering schema ([d179d73](https://github.com/privateOmega/html-to-docx/commit/d179d736e6e63ed42104a231ca0489430faae00a))
* **template:** added XML schemas ([42232da](https://github.com/privateOmega/html-to-docx/commit/42232da9d63ed404367703e56b1c65cdb8a23782))
* make tables center aligned ([077049b](https://github.com/privateOmega/html-to-docx/commit/077049b40babc45ec527b53211d4b33ba4f2b6ab))
* styling table color ([2b44bff](https://github.com/privateOmega/html-to-docx/commit/2b44bff7dee0dad0de75f3c3b2403278c19e3a4b))


### Bug Fixes

* 3 digit hex color code support ([255fe82](https://github.com/privateOmega/html-to-docx/commit/255fe82fc47e2a447c795c346ae7c6634ae442d1))
* added attributes to anchor drawing ([62e4a29](https://github.com/privateOmega/html-to-docx/commit/62e4a29ef664257d8f0364d5d97f056a62f0fb61))
* added black as default color ([bcfcba3](https://github.com/privateOmega/html-to-docx/commit/bcfcba36194925fdf08a4c297ceafcb5b08c124b))
* added bold to headings ([abe968a](https://github.com/privateOmega/html-to-docx/commit/abe968a0f2cdac5d01abf44bf7e7019922b295dd))
* added border for paragraph padding ([252ead6](https://github.com/privateOmega/html-to-docx/commit/252ead6dc9f09b84edc9f1b145bb76ad2cb4fc01))
* added colspan support for table cells ([bdf92f8](https://github.com/privateOmega/html-to-docx/commit/bdf92f8dbb10b4b58188364f3bdc5ff91e9cc982))
* added default options ([4590800](https://github.com/privateOmega/html-to-docx/commit/459080010f92ce7464f4815585088a46ce8e759d))
* added effectextent and srcrect fragment ([5f5e975](https://github.com/privateOmega/html-to-docx/commit/5f5e975b135eb38c48e18a09da590b363166d74e))
* added empty paragraph for spacing after table ([6bae787](https://github.com/privateOmega/html-to-docx/commit/6bae787cbf3f376b8ec34389f444d8c7c5f3b340))
* added extent fragment ([7ce81f2](https://github.com/privateOmega/html-to-docx/commit/7ce81f27e4c493bb9bf7d368a415f34cb0678e4c))
* added extra before spacing for heading elements ([dc50c8d](https://github.com/privateOmega/html-to-docx/commit/dc50c8dfe85a126be1780598974752cd939b6a9f))
* added header override in content-types xml ([5de681b](https://github.com/privateOmega/html-to-docx/commit/5de681be9295754eff648cea504e07bf9a6f6d09))
* added html string minifier ([8faa19c](https://github.com/privateOmega/html-to-docx/commit/8faa19c46ff85a31b16e89207cbc2120c6ed5805))
* added image conversion handler ([f726e71](https://github.com/privateOmega/html-to-docx/commit/f726e71ee2504bc254794ad09eaf5d67a8901b9a))
* added image in table cell support ([7d98a16](https://github.com/privateOmega/html-to-docx/commit/7d98a16b1509b57910e8294cfb3985a88b7154ae))
* added inline attributes ([0a4d2ce](https://github.com/privateOmega/html-to-docx/commit/0a4d2ce4b4c64952c3866928e6355b7c891ac044))
* added italics, underline and bold in runproperties ([34c2e18](https://github.com/privateOmega/html-to-docx/commit/34c2e18123c8a6a956209951afebc0dce2ab6cfc))
* added missing argument in buildParagraph ([2307076](https://github.com/privateOmega/html-to-docx/commit/23070766fe51d689e130d09fb5adcbba37781586))
* added more namespaces ([68636b4](https://github.com/privateOmega/html-to-docx/commit/68636b4c7cc73bf9e0de75b7bf97ac9afb4fb6f9))
* added namespace aliases to header and numbering xmls ([d0b4101](https://github.com/privateOmega/html-to-docx/commit/d0b4101017a6dabd0fa18e23228bd4af338129eb))
* added numbering and styles relationship ([c7e29af](https://github.com/privateOmega/html-to-docx/commit/c7e29af7414ce71515c46861942342d4f397222b))
* added other namespaces to the xml root ([afbbca9](https://github.com/privateOmega/html-to-docx/commit/afbbca9dbf723afc857034ce7770bc8f0840c0e4))
* added override for relationship ([30acddc](https://github.com/privateOmega/html-to-docx/commit/30acddc84d40dc6c66ed9539618b94adeeb2fc85))
* added override for settings and websettings ([977af04](https://github.com/privateOmega/html-to-docx/commit/977af04f48c19f2b3162cf6e61782cf63e7162e8))
* added overrides for relationships ([22b9cac](https://github.com/privateOmega/html-to-docx/commit/22b9cac2fa788b9654262e450774c588180a18de))
* added padding between image and wrapping text ([e45fbf5](https://github.com/privateOmega/html-to-docx/commit/e45fbf553c19071023634b692e3c4b0fab04aedf))
* added positioning fragments ([e6f7e1c](https://github.com/privateOmega/html-to-docx/commit/e6f7e1c3679aa813a2818725548dfb5ebb0d9bd7))
* added required attributes to anchor fragment ([d01c9f9](https://github.com/privateOmega/html-to-docx/commit/d01c9f915a929de201218af127103da627aaa4a1))
* added settings and websettings relation ([34aeedc](https://github.com/privateOmega/html-to-docx/commit/34aeedce6d0dd02822062762f9b077bb146b09b9))
* added settings and websettings to ooxml package ([6c829b5](https://github.com/privateOmega/html-to-docx/commit/6c829b5ec4596ba0b5d41fae9ba2bfd68fdf7230))
* added simple positioning to anchor ([5006cc4](https://github.com/privateOmega/html-to-docx/commit/5006cc47d112360e51d8051f1ebff570e9f12779))
* added support for decimal inch ([6027d2f](https://github.com/privateOmega/html-to-docx/commit/6027d2f36bbc9bb97ff4cbcaa59372df33528a54))
* added support for full width background color ([733a937](https://github.com/privateOmega/html-to-docx/commit/733a9373ba13ccb0b781f66fe87d91a3eed4aab9))
* added table and cell border support ([985f6a1](https://github.com/privateOmega/html-to-docx/commit/985f6a1e7a2e52f3b0a609a00da8a11bf113ef16))
* added table borders ([12864db](https://github.com/privateOmega/html-to-docx/commit/12864db468a08f4aca4d01cb8e8b6635aa09c57d))
* added table cell border support ([852c091](https://github.com/privateOmega/html-to-docx/commit/852c091e15a3b2add7b622472be8fc021bb05c06))
* added table header support ([592aa89](https://github.com/privateOmega/html-to-docx/commit/592aa893fa115a83bc1d056c98480dbe5cc872f9))
* added table width support ([73b172b](https://github.com/privateOmega/html-to-docx/commit/73b172b584aaeb7137d58e0eb2d8b73c4bb92561))
* added unit conversion utils ([d5b5a91](https://github.com/privateOmega/html-to-docx/commit/d5b5a915d215fb834cfe84996539ae663cc98914))
* added unit conversions ([e6d546b](https://github.com/privateOmega/html-to-docx/commit/e6d546bca1a87182568d15bad99ac0af23ee55de))
* added unit conversions ([5890b18](https://github.com/privateOmega/html-to-docx/commit/5890b18833cc11f10c8ffc1e57d1dd9ffd46395d))
* added wrap elements ([c951688](https://github.com/privateOmega/html-to-docx/commit/c95168864c4929e2ab95c5a6a53d0919c76f8a83))
* bold based on font-weight ([3f0376e](https://github.com/privateOmega/html-to-docx/commit/3f0376e0a1e267705117a2ec50c9f382286b2a60))
* border color ([a322450](https://github.com/privateOmega/html-to-docx/commit/a322450ceda77dbabaee24d1e9619ced04d88cad))
* changed attribute field for picture name ([aef241d](https://github.com/privateOmega/html-to-docx/commit/aef241dc3d3d9adb732c429df9f0c2771b319680))
* changed attribute used for name ([3885233](https://github.com/privateOmega/html-to-docx/commit/3885233bf14f9b7b16d48a2844d3e997e476a8ee))
* changed default namespace of relationship to solve render issue ([56a3554](https://github.com/privateOmega/html-to-docx/commit/56a3554e7b2e9d85cedeece8d20acfebf23666ad))
* changed file extension if octet stream is encountered ([32c5bf1](https://github.com/privateOmega/html-to-docx/commit/32c5bf1b5f7c5f8dc83a51fed142e932c7b008fd))
* changed line spacing rule to work with inline images ([489f1c6](https://github.com/privateOmega/html-to-docx/commit/489f1c62fc093b108bc16aee33d74baad4ced7d8))
* changed namespaces to original ecma 376 spec ([51be86e](https://github.com/privateOmega/html-to-docx/commit/51be86ecf0f4a78457840bf2a31579d217568208))
* changed paragraph after spacing ([025523b](https://github.com/privateOmega/html-to-docx/commit/025523b0f07433456e3f19f3774f441e46c7a89b))
* changed width conditions to match suggestions ([48347ab](https://github.com/privateOmega/html-to-docx/commit/48347abe339aadc3b322d763d52bc607d1293680))
* created seperate abstract numbering for each lists ([c723c74](https://github.com/privateOmega/html-to-docx/commit/c723c746a3feb2612e73dddac14f1c40864e9ad9))
* fix table render issue due to grid width ([636d499](https://github.com/privateOmega/html-to-docx/commit/636d499bcee00195f7b5ca198c60bb3e0f7d2a69))
* fixed abstract numbering id ([9814cb8](https://github.com/privateOmega/html-to-docx/commit/9814cb89582bc7e87cec638be37ee1cd326c6117))
* fixed coloring and refactored other text formatting ([c288f80](https://github.com/privateOmega/html-to-docx/commit/c288f809ea6387c91356976a6dd81396cecafc46))
* fixed document rels and numbering bug ([d6e3152](https://github.com/privateOmega/html-to-docx/commit/d6e3152081da7d2ab379a67bfda345964fa15c40))
* fixed docx generation ([3d96acf](https://github.com/privateOmega/html-to-docx/commit/3d96acf511d82776510fac857af57d5cb9453f89))
* fixed incorrect table row generation ([742dd18](https://github.com/privateOmega/html-to-docx/commit/742dd1882ce4c1a33ab51e10ee2a628b817eca31))
* fixed internal mode and added extensions ([1266121](https://github.com/privateOmega/html-to-docx/commit/12661213e00c55f7068e93abb019ba80cd4f2d87))
* fixed margin issues ([f841b76](https://github.com/privateOmega/html-to-docx/commit/f841b76caa944ea5eec206a3b3fce3e5a5eaf3e7))
* fixed numbering and header issue due to wrong filename ([64a04bc](https://github.com/privateOmega/html-to-docx/commit/64a04bc192616162aa67c43f80734e7ebb9ff588))
* fixed table and image rendering ([c153092](https://github.com/privateOmega/html-to-docx/commit/c1530924f93351ce63882bf0e6050b6315aa6017))
* formatted list ([2e00e44](https://github.com/privateOmega/html-to-docx/commit/2e00e448b812111d09c50b9759b9dd46bd36c860))
* handled empty formatting tag ([d97521f](https://github.com/privateOmega/html-to-docx/commit/d97521f8004d2e7af9f324cdbdcbbe4fcc299e4b))
* handled figure wrapper for images and tables ([4182a95](https://github.com/privateOmega/html-to-docx/commit/4182a9543aeb71fd8b0d2c7a2e08978a782de3e6))
* handled formatting within list element ([aeb3f00](https://github.com/privateOmega/html-to-docx/commit/aeb3f0041d352ea8442551d30770644d04698e7a))
* handled horizontal alignment ([72478cb](https://github.com/privateOmega/html-to-docx/commit/72478cb2308ac029f9a8149c416012101d23c18c))
* handled image inside table cell ([339c18a](https://github.com/privateOmega/html-to-docx/commit/339c18a3de7e7e86e4133a72e54cb6ed5ec386c2))
* handled table width ([237ddfd](https://github.com/privateOmega/html-to-docx/commit/237ddfd6bff914e0379c6cbd940a7eac29d7aeaf))
* handled vertical alignment ([b2b3bcc](https://github.com/privateOmega/html-to-docx/commit/b2b3bcc382dc645a3cdebe18d99558538bad6282))
* handling anchor tag ([8d0fa4b](https://github.com/privateOmega/html-to-docx/commit/8d0fa4bc8413c0aa256535eb3679c224eb79bcc2))
* handling multiple span children and multilevel formatting of text ([4c81f58](https://github.com/privateOmega/html-to-docx/commit/4c81f586400d1f227236a8b07d067331c0f02c5d))
* handling nested formatting ([04f0d7e](https://github.com/privateOmega/html-to-docx/commit/04f0d7e822a57fc3ba98d3990e17b9153c54afc7))
* handling non paragraph text elements ([b4cc062](https://github.com/privateOmega/html-to-docx/commit/b4cc06237862c07b900b7ce158cddf2b673f0e1c))
* hyperlink within table cell issue ([3a02365](https://github.com/privateOmega/html-to-docx/commit/3a02365b3f7232da17791f062d971cace65c0371))
* improved table border styling ([ba3aa67](https://github.com/privateOmega/html-to-docx/commit/ba3aa67fc484fa1a47b1f61f5dd7f69dff353f48))
* list element render ([2881455](https://github.com/privateOmega/html-to-docx/commit/2881455633e81127e192f8e0de7fe4711c320583))
* modified abstractnumbering definition to support nested lists ([3dd6e3e](https://github.com/privateOmega/html-to-docx/commit/3dd6e3e6a8e02b1cd0892735c9053eb0ba518092))
* modified example to use esm bundle ([491a83d](https://github.com/privateOmega/html-to-docx/commit/491a83d9b2c0deec13743817cdf32280d39bb9cd))
* moved namespaces into separate file ([75cdf30](https://github.com/privateOmega/html-to-docx/commit/75cdf3033e69934b189a74d6c77eef08d50492aa))
* namespace updated to 2016 standards ([6fc2ac2](https://github.com/privateOmega/html-to-docx/commit/6fc2ac2b6e904c4dd774b24e0ad119cccd873e0b))
* package-lock conflicts ([e577239](https://github.com/privateOmega/html-to-docx/commit/e5772392c30cfa188cb11f0b93250e90a71b1600))
* preserve spacing on text ([f2f12b1](https://github.com/privateOmega/html-to-docx/commit/f2f12b1f4903aa7caf6bae5cad3b88d9aed46d18))
* removed html tidying ([0a43396](https://github.com/privateOmega/html-to-docx/commit/0a43396a9f8e022fe0f5069d513c7aa841e57d6c))
* removed libtidy-updated ([aab3b19](https://github.com/privateOmega/html-to-docx/commit/aab3b19b725f53d3a34266f6bf49d8712190007e))
* removed unwanted attribute ([f3caf44](https://github.com/privateOmega/html-to-docx/commit/f3caf44faf95ba8c6dee1f6f959300374e2b65ff))
* renamed document rels schema file ([10c3fda](https://github.com/privateOmega/html-to-docx/commit/10c3fda9878847257b902d4c13c2d8dd36edd3f6))
* renamed unit converters ([eee4487](https://github.com/privateOmega/html-to-docx/commit/eee44877cfee7228eb27b9efeb10b07a0e67ada9))
* rewrote formatting loop to avoid memory leaks and text loss ([e5fe27c](https://github.com/privateOmega/html-to-docx/commit/e5fe27c232ba1394b93735dcc701354bbc5244b3))
* scaled down images ([72d7c44](https://github.com/privateOmega/html-to-docx/commit/72d7c448730a46499a1a5cab50c443a525967a54))
* set default values for table attributes and styles ([2a4fb23](https://github.com/privateOmega/html-to-docx/commit/2a4fb23747cc3830c1ed81fade8316a27f67efd7))
* set header and footer HTML strings if corresponding option is true ([c4aecd0](https://github.com/privateOmega/html-to-docx/commit/c4aecd07f5fdceaf025a8ad260b0af2feeebd557))
* table cell border style support ([2c5a205](https://github.com/privateOmega/html-to-docx/commit/2c5a2055d33ee02f55a07e9c8ba985e2e07f2871))
* table cell vertical align issue ([424d2c1](https://github.com/privateOmega/html-to-docx/commit/424d2c1177e1d335dbfa2b016d59cd50817e679a))
* table header bold ([aa62347](https://github.com/privateOmega/html-to-docx/commit/aa6234724f7b8f1ba91d724b9c6cd12ab2b725cb))
* updated document abstraction to track generation ids ([c34810f](https://github.com/privateOmega/html-to-docx/commit/c34810f1373f934b0b3ecbe9da2838f41a68dcc9))
* updated documentrels xml generation ([433e4b4](https://github.com/privateOmega/html-to-docx/commit/433e4b4eb9d71beede8feb1754363163ba5d1933))
* updated example ([ec6323a](https://github.com/privateOmega/html-to-docx/commit/ec6323aa0124bcfe5f0c11ad181c0930d9d9a825))
* updated high level option ([84a11bc](https://github.com/privateOmega/html-to-docx/commit/84a11bc364991910b0428567b95a662149ca71c5))
* updated numbering xml generation ([81b7a82](https://github.com/privateOmega/html-to-docx/commit/81b7a8296d1e3afa095f47007a66698852d29f95))
* updated row borders to use css borders ([76aeb85](https://github.com/privateOmega/html-to-docx/commit/76aeb85e8f75edb2c669f28674e5353599045866))
* updated xml builder to use namespace and child nodes ([2e28b5e](https://github.com/privateOmega/html-to-docx/commit/2e28b5ec07241c10c4288412a6ced8023e8c03ce))
* used image dimensions for extent fragment ([aa17f74](https://github.com/privateOmega/html-to-docx/commit/aa17f74d3a2fab51cfa730ce62c09c2862bad532))
* using libtidy for cleaning up HTML string ([6b237a8](https://github.com/privateOmega/html-to-docx/commit/6b237a885008414c4625ca6b891bd7e48cee2111))
* wrapped drawing inside paragraph tag ([d0476b4](https://github.com/privateOmega/html-to-docx/commit/d0476b4211fe13f5918091a6a06e5021015a5db8))
* **template:** fixed document templating ([5f6a74f](https://github.com/privateOmega/html-to-docx/commit/5f6a74f9964348590fbb7f5baf88230c8c796766))
* **template:** fixed numbering templating ([8b09691](https://github.com/privateOmega/html-to-docx/commit/8b096916284cbbe8452bb572d788caee23849084))
* **template:** removed word xml schema ([ee0e1ed](https://github.com/privateOmega/html-to-docx/commit/ee0e1ed7b0b00cbaf3644ad887175abac0282dcc))

### [1.1.31](https://github.com/privateOmega/html-to-docx/compare/v1.1.30...v1.1.31) (2020-10-06)


### Features

* added page break support ([085ed2a](https://github.com/privateOmega/html-to-docx/commit/085ed2a2cb439ee2a4189b3664deca047926672b))
* added table row cant split option ([252178c](https://github.com/privateOmega/html-to-docx/commit/252178c922d9910b8a89e6c4e30fafd2994d92d7))


### Bug Fixes

* removed html tidying ([0a43396](https://github.com/privateOmega/html-to-docx/commit/0a43396a9f8e022fe0f5069d513c7aa841e57d6c))
* removed libtidy-updated ([aab3b19](https://github.com/privateOmega/html-to-docx/commit/aab3b19b725f53d3a34266f6bf49d8712190007e))
* updated example ([ec6323a](https://github.com/privateOmega/html-to-docx/commit/ec6323aa0124bcfe5f0c11ad181c0930d9d9a825))
* updated high level option ([84a11bc](https://github.com/privateOmega/html-to-docx/commit/84a11bc364991910b0428567b95a662149ca71c5))

### [1.1.30](https://github.com/privateOmega/html-to-docx/compare/v1.1.29...v1.1.30) (2020-09-21)


### Features

* added generic rels xml string ([7d2ea84](https://github.com/privateOmega/html-to-docx/commit/7d2ea8404093fd99ce5e6bccaedaf3603830f574))
* added header relationship support ([cc08355](https://github.com/privateOmega/html-to-docx/commit/cc083553e28a3ed88da3cc27ef0de0cbb26350b3))

### [1.1.29](https://github.com/privateOmega/html-to-docx/compare/v1.1.28...v1.1.29) (2020-08-11)


### Bug Fixes

* formatted list ([2e00e44](https://github.com/privateOmega/html-to-docx/commit/2e00e448b812111d09c50b9759b9dd46bd36c860))

### [1.1.28](https://github.com/privateOmega/html-to-docx/compare/v1.1.27...v1.1.28) (2020-08-06)


### Features

* added table max width support ([49ab5d3](https://github.com/privateOmega/html-to-docx/commit/49ab5d3876cdd58c2efd1b492fc5bb41e9a857e7))


### Bug Fixes

* added extra before spacing for heading elements ([dc50c8d](https://github.com/privateOmega/html-to-docx/commit/dc50c8dfe85a126be1780598974752cd939b6a9f))
* changed width conditions to match suggestions ([48347ab](https://github.com/privateOmega/html-to-docx/commit/48347abe339aadc3b322d763d52bc607d1293680))

### [1.1.27](https://github.com/privateOmega/html-to-docx/compare/v1.1.26...v1.1.27) (2020-08-04)


### Bug Fixes

* list element render ([2881455](https://github.com/privateOmega/html-to-docx/commit/2881455633e81127e192f8e0de7fe4711c320583))

### [1.1.26](https://github.com/privateOmega/html-to-docx/compare/v1.1.25...v1.1.26) (2020-08-04)


### Bug Fixes

* handled formatting within list element ([aeb3f00](https://github.com/privateOmega/html-to-docx/commit/aeb3f0041d352ea8442551d30770644d04698e7a))

### [1.1.25](https://github.com/privateOmega/html-to-docx/compare/v1.1.24...v1.1.25) (2020-07-24)


### Features

* changed list parsing to support nested lists ([4339f2f](https://github.com/privateOmega/html-to-docx/commit/4339f2f9d2bdc5ffd68def80449c9bce8c09c9a9))


### Bug Fixes

* modified abstractnumbering definition to support nested lists ([3dd6e3e](https://github.com/privateOmega/html-to-docx/commit/3dd6e3e6a8e02b1cd0892735c9053eb0ba518092))

### [1.1.24](https://github.com/privateOmega/html-to-docx/compare/v1.1.23...v1.1.24) (2020-07-22)


### Bug Fixes

* updated row borders to use css borders ([76aeb85](https://github.com/privateOmega/html-to-docx/commit/76aeb85e8f75edb2c669f28674e5353599045866))

### [1.1.23](https://github.com/privateOmega/html-to-docx/compare/v1.1.22...v1.1.23) (2020-07-21)


### Features

* added css border string parser ([15562e8](https://github.com/privateOmega/html-to-docx/commit/15562e817732d1d85b99fd33921694f2e3ad3ad7))
* added eip conversions ([9d6e317](https://github.com/privateOmega/html-to-docx/commit/9d6e3171c0b0f9d71f776762357d4a329778cedb))
* added minimum width support to tables ([b10d820](https://github.com/privateOmega/html-to-docx/commit/b10d820061b10531aa027fde304fbe3ceac849d5))
* make tables center aligned ([077049b](https://github.com/privateOmega/html-to-docx/commit/077049b40babc45ec527b53211d4b33ba4f2b6ab))


### Bug Fixes

* border color ([a322450](https://github.com/privateOmega/html-to-docx/commit/a322450ceda77dbabaee24d1e9619ced04d88cad))
* improved table border styling ([ba3aa67](https://github.com/privateOmega/html-to-docx/commit/ba3aa67fc484fa1a47b1f61f5dd7f69dff353f48))
* set default values for table attributes and styles ([2a4fb23](https://github.com/privateOmega/html-to-docx/commit/2a4fb23747cc3830c1ed81fade8316a27f67efd7))

### 1.1.22 (2020-07-09)


### Features

* **packaging:** added jszip for packaging ([89619ec](https://github.com/privateOmega/html-to-docx/commit/89619ec702564fb9c5eccaee55e65d366fcbacad))
* **packaging:** added method to create container ([9808cf2](https://github.com/privateOmega/html-to-docx/commit/9808cf211bbb50cf3d7cbe122d01c82d4272e888))
* enabling header on flag ([516463c](https://github.com/privateOmega/html-to-docx/commit/516463cd532e58895faa8dd465b7e725f0de59e3))
* **template:** added base docx template ([abdb87b](https://github.com/privateOmega/html-to-docx/commit/abdb87bdfead91890f9d54e2cedd038e916b6dce))
* abstracted conversion using docxDocument class ([c625a01](https://github.com/privateOmega/html-to-docx/commit/c625a0181a6c328c0319b579fa1173192dff1187))
* added b tag support ([f867abd](https://github.com/privateOmega/html-to-docx/commit/f867abd41c6bc85bbba207a27c58d441f1a2b532))
* added builder methods for images ([9e2720f](https://github.com/privateOmega/html-to-docx/commit/9e2720f261a46701c8a2581aadafa9b60e6cee6b))
* added css color string ([cb0db2f](https://github.com/privateOmega/html-to-docx/commit/cb0db2ff2d3f2f66df823dbafbc5603030241bc3))
* added document file render helper ([6dd9c3a](https://github.com/privateOmega/html-to-docx/commit/6dd9c3a01f5fceab78404d8ebddb848fb91c933c))
* added em tag support ([6a06265](https://github.com/privateOmega/html-to-docx/commit/6a06265f724a611b50144cb988e576bc4e40b4d4))
* added escape-html ([1a231d5](https://github.com/privateOmega/html-to-docx/commit/1a231d5dde3e6f9b5a23f248e19063191c07e54f))
* added font size support ([0f27c60](https://github.com/privateOmega/html-to-docx/commit/0f27c609baa5b9488bc195dff1c060bcc04bbf2d))
* added font support in styles ([18b3281](https://github.com/privateOmega/html-to-docx/commit/18b3281ac3f91e5c1905efa0487354ff78badec2))
* added font table ([0903d6b](https://github.com/privateOmega/html-to-docx/commit/0903d6b98fae6dc378cdeafdadd80a86501c9959))
* added header generation ([25fb44f](https://github.com/privateOmega/html-to-docx/commit/25fb44f945df3fdc5f37d619b3de3ebe68b84cd6))
* added heading sizes ([bb18e72](https://github.com/privateOmega/html-to-docx/commit/bb18e724c42b0c4581722b2899d5ff808c1495c4))
* added headings support ([fd489ee](https://github.com/privateOmega/html-to-docx/commit/fd489eeebfeedc7d05991f9366aeae2adc49fd6f))
* added highlight support ([6159925](https://github.com/privateOmega/html-to-docx/commit/6159925495b74ab254cd7dc5628526d531595a92))
* added horizontal text alignment ([d29669f](https://github.com/privateOmega/html-to-docx/commit/d29669ffdb0d63b7bdbbe09c6bca990e4c28cfb8))
* added hsl conversion support ([153fa43](https://github.com/privateOmega/html-to-docx/commit/153fa43f84c640085f45823bc2054b24c28023d0))
* added hyperlinks support ([3560ce9](https://github.com/privateOmega/html-to-docx/commit/3560ce9f23fa8f590aa340302bf0059c8dfb6d5f))
* added ins tag support ([6d64908](https://github.com/privateOmega/html-to-docx/commit/6d64908858dac290aa34421c236bdaf2d8ef07a7))
* added line height support ([3d0ea2f](https://github.com/privateOmega/html-to-docx/commit/3d0ea2fe56d13893e3c5cd0e4a35e7b26b7c1d0a))
* added linebreak support ([57c054c](https://github.com/privateOmega/html-to-docx/commit/57c054cd65f49d7c4244272af0117f2c141a8bc7))
* added method to archive images with other files ([b6da74b](https://github.com/privateOmega/html-to-docx/commit/b6da74be10be03d689ca044f3f95dd724a3a29b6))
* added more unit converters ([8f78c52](https://github.com/privateOmega/html-to-docx/commit/8f78c5241cf33d471c8b08e3f941f401d6a50d7b))
* added more xml builder methods ([ffc584b](https://github.com/privateOmega/html-to-docx/commit/ffc584bed7ab434431999517a3308483ba99489a))
* added more xml statment builder methods ([337e530](https://github.com/privateOmega/html-to-docx/commit/337e5305aa8768b6507323bec2279d557a35b67b))
* added other measure units for margins and fonts ([1ae584a](https://github.com/privateOmega/html-to-docx/commit/1ae584a1b0a5350943e10c0d129402b843d7b9a2))
* added strike through support ([b73e8c7](https://github.com/privateOmega/html-to-docx/commit/b73e8c76d0051bc6449ed57861b4ce1c7ad4b408))
* added support for span font sizing ([98b4844](https://github.com/privateOmega/html-to-docx/commit/98b4844858f967bd5a3932262d0b535cd53d499d))
* added support for subscript and superscript ([f1ee4ed](https://github.com/privateOmega/html-to-docx/commit/f1ee4edf183a45731b48bba2b91154da591c203f))
* added table row height support ([031c3aa](https://github.com/privateOmega/html-to-docx/commit/031c3aa963e5a7b2ee985ae8ac6ff612c89ae974))
* added text formatting to paragraph ([bacd888](https://github.com/privateOmega/html-to-docx/commit/bacd888253a35a18ac7ea4e9141d4a4fb60e3cf7))
* added valign to table cell element ([20e94f1](https://github.com/privateOmega/html-to-docx/commit/20e94f18370e8a92034f6d35f5e744ceb57ed774))
* added vdom to xml method ([8b5a618](https://github.com/privateOmega/html-to-docx/commit/8b5a6185e6e211b0e07b9f1c1b7e23fb4b13dc9c))
* added virtual-dom and html-to-vdom ([feaa396](https://github.com/privateOmega/html-to-docx/commit/feaa396162465276d19b7d3d5c51a533987a1738))
* added xbuilder ([f13b5cc](https://github.com/privateOmega/html-to-docx/commit/f13b5cc06d29ae53493f1f4b8fdef6e8986e64e6))
* added xml builder methods for images ([f413ad8](https://github.com/privateOmega/html-to-docx/commit/f413ad89b263c63a8fb9890b44b1b219a7413c4b))
* added xml statement builder helper ([5e23c16](https://github.com/privateOmega/html-to-docx/commit/5e23c1636eb3c64f52589f1ac71a48dec3df65c2))
* handle line breaks ([164c0f5](https://github.com/privateOmega/html-to-docx/commit/164c0f5e17f62e3f30da25be6e181d3414ca4dde))
* styling table color ([2b44bff](https://github.com/privateOmega/html-to-docx/commit/2b44bff7dee0dad0de75f3c3b2403278c19e3a4b))
* **template:** added numbering schema ([d179d73](https://github.com/privateOmega/html-to-docx/commit/d179d736e6e63ed42104a231ca0489430faae00a))
* **template:** added styles schema ([d83d230](https://github.com/privateOmega/html-to-docx/commit/d83d230a66807f6ad08ebb4a6c0c5299c311aaf5))
* **template:** added XML schemas ([42232da](https://github.com/privateOmega/html-to-docx/commit/42232da9d63ed404367703e56b1c65cdb8a23782))


### Bug Fixes

* 3 digit hex color code support ([255fe82](https://github.com/privateOmega/html-to-docx/commit/255fe82fc47e2a447c795c346ae7c6634ae442d1))
* added attributes to anchor drawing ([62e4a29](https://github.com/privateOmega/html-to-docx/commit/62e4a29ef664257d8f0364d5d97f056a62f0fb61))
* added black as default color ([bcfcba3](https://github.com/privateOmega/html-to-docx/commit/bcfcba36194925fdf08a4c297ceafcb5b08c124b))
* added bold to headings ([abe968a](https://github.com/privateOmega/html-to-docx/commit/abe968a0f2cdac5d01abf44bf7e7019922b295dd))
* added border for paragraph padding ([252ead6](https://github.com/privateOmega/html-to-docx/commit/252ead6dc9f09b84edc9f1b145bb76ad2cb4fc01))
* added colspan support for table cells ([bdf92f8](https://github.com/privateOmega/html-to-docx/commit/bdf92f8dbb10b4b58188364f3bdc5ff91e9cc982))
* added default options ([4590800](https://github.com/privateOmega/html-to-docx/commit/459080010f92ce7464f4815585088a46ce8e759d))
* added effectextent and srcrect fragment ([5f5e975](https://github.com/privateOmega/html-to-docx/commit/5f5e975b135eb38c48e18a09da590b363166d74e))
* added empty paragraph for spacing after table ([6bae787](https://github.com/privateOmega/html-to-docx/commit/6bae787cbf3f376b8ec34389f444d8c7c5f3b340))
* added extent fragment ([7ce81f2](https://github.com/privateOmega/html-to-docx/commit/7ce81f27e4c493bb9bf7d368a415f34cb0678e4c))
* added header override in content-types xml ([5de681b](https://github.com/privateOmega/html-to-docx/commit/5de681be9295754eff648cea504e07bf9a6f6d09))
* added html string minifier ([8faa19c](https://github.com/privateOmega/html-to-docx/commit/8faa19c46ff85a31b16e89207cbc2120c6ed5805))
* added image conversion handler ([f726e71](https://github.com/privateOmega/html-to-docx/commit/f726e71ee2504bc254794ad09eaf5d67a8901b9a))
* added image in table cell support ([7d98a16](https://github.com/privateOmega/html-to-docx/commit/7d98a16b1509b57910e8294cfb3985a88b7154ae))
* added inline attributes ([0a4d2ce](https://github.com/privateOmega/html-to-docx/commit/0a4d2ce4b4c64952c3866928e6355b7c891ac044))
* added italics, underline and bold in runproperties ([34c2e18](https://github.com/privateOmega/html-to-docx/commit/34c2e18123c8a6a956209951afebc0dce2ab6cfc))
* added more namespaces ([68636b4](https://github.com/privateOmega/html-to-docx/commit/68636b4c7cc73bf9e0de75b7bf97ac9afb4fb6f9))
* added namespace aliases to header and numbering xmls ([d0b4101](https://github.com/privateOmega/html-to-docx/commit/d0b4101017a6dabd0fa18e23228bd4af338129eb))
* added numbering and styles relationship ([c7e29af](https://github.com/privateOmega/html-to-docx/commit/c7e29af7414ce71515c46861942342d4f397222b))
* added other namespaces to the xml root ([afbbca9](https://github.com/privateOmega/html-to-docx/commit/afbbca9dbf723afc857034ce7770bc8f0840c0e4))
* added override for relationship ([30acddc](https://github.com/privateOmega/html-to-docx/commit/30acddc84d40dc6c66ed9539618b94adeeb2fc85))
* added override for settings and websettings ([977af04](https://github.com/privateOmega/html-to-docx/commit/977af04f48c19f2b3162cf6e61782cf63e7162e8))
* added overrides for relationships ([22b9cac](https://github.com/privateOmega/html-to-docx/commit/22b9cac2fa788b9654262e450774c588180a18de))
* added padding between image and wrapping text ([e45fbf5](https://github.com/privateOmega/html-to-docx/commit/e45fbf553c19071023634b692e3c4b0fab04aedf))
* added positioning fragments ([e6f7e1c](https://github.com/privateOmega/html-to-docx/commit/e6f7e1c3679aa813a2818725548dfb5ebb0d9bd7))
* added required attributes to anchor fragment ([d01c9f9](https://github.com/privateOmega/html-to-docx/commit/d01c9f915a929de201218af127103da627aaa4a1))
* added settings and websettings relation ([34aeedc](https://github.com/privateOmega/html-to-docx/commit/34aeedce6d0dd02822062762f9b077bb146b09b9))
* added settings and websettings to ooxml package ([6c829b5](https://github.com/privateOmega/html-to-docx/commit/6c829b5ec4596ba0b5d41fae9ba2bfd68fdf7230))
* added simple positioning to anchor ([5006cc4](https://github.com/privateOmega/html-to-docx/commit/5006cc47d112360e51d8051f1ebff570e9f12779))
* added support for decimal inch ([6027d2f](https://github.com/privateOmega/html-to-docx/commit/6027d2f36bbc9bb97ff4cbcaa59372df33528a54))
* added support for full width background color ([733a937](https://github.com/privateOmega/html-to-docx/commit/733a9373ba13ccb0b781f66fe87d91a3eed4aab9))
* added table and cell border support ([985f6a1](https://github.com/privateOmega/html-to-docx/commit/985f6a1e7a2e52f3b0a609a00da8a11bf113ef16))
* added table borders ([12864db](https://github.com/privateOmega/html-to-docx/commit/12864db468a08f4aca4d01cb8e8b6635aa09c57d))
* added table cell border support ([852c091](https://github.com/privateOmega/html-to-docx/commit/852c091e15a3b2add7b622472be8fc021bb05c06))
* added table header support ([592aa89](https://github.com/privateOmega/html-to-docx/commit/592aa893fa115a83bc1d056c98480dbe5cc872f9))
* added table width support ([73b172b](https://github.com/privateOmega/html-to-docx/commit/73b172b584aaeb7137d58e0eb2d8b73c4bb92561))
* added unit conversion utils ([d5b5a91](https://github.com/privateOmega/html-to-docx/commit/d5b5a915d215fb834cfe84996539ae663cc98914))
* added unit conversions ([e6d546b](https://github.com/privateOmega/html-to-docx/commit/e6d546bca1a87182568d15bad99ac0af23ee55de))
* added unit conversions ([5890b18](https://github.com/privateOmega/html-to-docx/commit/5890b18833cc11f10c8ffc1e57d1dd9ffd46395d))
* added wrap elements ([c951688](https://github.com/privateOmega/html-to-docx/commit/c95168864c4929e2ab95c5a6a53d0919c76f8a83))
* bold based on font-weight ([3f0376e](https://github.com/privateOmega/html-to-docx/commit/3f0376e0a1e267705117a2ec50c9f382286b2a60))
* changed attribute field for picture name ([aef241d](https://github.com/privateOmega/html-to-docx/commit/aef241dc3d3d9adb732c429df9f0c2771b319680))
* changed attribute used for name ([3885233](https://github.com/privateOmega/html-to-docx/commit/3885233bf14f9b7b16d48a2844d3e997e476a8ee))
* changed default namespace of relationship to solve render issue ([56a3554](https://github.com/privateOmega/html-to-docx/commit/56a3554e7b2e9d85cedeece8d20acfebf23666ad))
* changed file extension if octet stream is encountered ([32c5bf1](https://github.com/privateOmega/html-to-docx/commit/32c5bf1b5f7c5f8dc83a51fed142e932c7b008fd))
* changed line spacing rule to work with inline images ([489f1c6](https://github.com/privateOmega/html-to-docx/commit/489f1c62fc093b108bc16aee33d74baad4ced7d8))
* changed namespaces to original ecma 376 spec ([51be86e](https://github.com/privateOmega/html-to-docx/commit/51be86ecf0f4a78457840bf2a31579d217568208))
* changed paragraph after spacing ([025523b](https://github.com/privateOmega/html-to-docx/commit/025523b0f07433456e3f19f3774f441e46c7a89b))
* created seperate abstract numbering for each lists ([c723c74](https://github.com/privateOmega/html-to-docx/commit/c723c746a3feb2612e73dddac14f1c40864e9ad9))
* fix table render issue due to grid width ([636d499](https://github.com/privateOmega/html-to-docx/commit/636d499bcee00195f7b5ca198c60bb3e0f7d2a69))
* fixed abstract numbering id ([9814cb8](https://github.com/privateOmega/html-to-docx/commit/9814cb89582bc7e87cec638be37ee1cd326c6117))
* fixed coloring and refactored other text formatting ([c288f80](https://github.com/privateOmega/html-to-docx/commit/c288f809ea6387c91356976a6dd81396cecafc46))
* fixed document rels and numbering bug ([d6e3152](https://github.com/privateOmega/html-to-docx/commit/d6e3152081da7d2ab379a67bfda345964fa15c40))
* fixed docx generation ([3d96acf](https://github.com/privateOmega/html-to-docx/commit/3d96acf511d82776510fac857af57d5cb9453f89))
* fixed incorrect table row generation ([742dd18](https://github.com/privateOmega/html-to-docx/commit/742dd1882ce4c1a33ab51e10ee2a628b817eca31))
* fixed internal mode and added extensions ([1266121](https://github.com/privateOmega/html-to-docx/commit/12661213e00c55f7068e93abb019ba80cd4f2d87))
* fixed margin issues ([f841b76](https://github.com/privateOmega/html-to-docx/commit/f841b76caa944ea5eec206a3b3fce3e5a5eaf3e7))
* fixed numbering and header issue due to wrong filename ([64a04bc](https://github.com/privateOmega/html-to-docx/commit/64a04bc192616162aa67c43f80734e7ebb9ff588))
* fixed table and image rendering ([c153092](https://github.com/privateOmega/html-to-docx/commit/c1530924f93351ce63882bf0e6050b6315aa6017))
* handled empty formatting tag ([d97521f](https://github.com/privateOmega/html-to-docx/commit/d97521f8004d2e7af9f324cdbdcbbe4fcc299e4b))
* handled figure wrapper for images and tables ([4182a95](https://github.com/privateOmega/html-to-docx/commit/4182a9543aeb71fd8b0d2c7a2e08978a782de3e6))
* handled horizontal alignment ([72478cb](https://github.com/privateOmega/html-to-docx/commit/72478cb2308ac029f9a8149c416012101d23c18c))
* handled image inside table cell ([339c18a](https://github.com/privateOmega/html-to-docx/commit/339c18a3de7e7e86e4133a72e54cb6ed5ec386c2))
* handled table width ([237ddfd](https://github.com/privateOmega/html-to-docx/commit/237ddfd6bff914e0379c6cbd940a7eac29d7aeaf))
* handled vertical alignment ([b2b3bcc](https://github.com/privateOmega/html-to-docx/commit/b2b3bcc382dc645a3cdebe18d99558538bad6282))
* handling multiple span children and multilevel formatting of text ([4c81f58](https://github.com/privateOmega/html-to-docx/commit/4c81f586400d1f227236a8b07d067331c0f02c5d))
* handling nested formatting ([04f0d7e](https://github.com/privateOmega/html-to-docx/commit/04f0d7e822a57fc3ba98d3990e17b9153c54afc7))
* handling non paragraph text elements ([b4cc062](https://github.com/privateOmega/html-to-docx/commit/b4cc06237862c07b900b7ce158cddf2b673f0e1c))
* modified example to use esm bundle ([491a83d](https://github.com/privateOmega/html-to-docx/commit/491a83d9b2c0deec13743817cdf32280d39bb9cd))
* moved namespaces into separate file ([75cdf30](https://github.com/privateOmega/html-to-docx/commit/75cdf3033e69934b189a74d6c77eef08d50492aa))
* namespace updated to 2016 standards ([6fc2ac2](https://github.com/privateOmega/html-to-docx/commit/6fc2ac2b6e904c4dd774b24e0ad119cccd873e0b))
* preserve spacing on text ([f2f12b1](https://github.com/privateOmega/html-to-docx/commit/f2f12b1f4903aa7caf6bae5cad3b88d9aed46d18))
* removed unwanted attribute ([f3caf44](https://github.com/privateOmega/html-to-docx/commit/f3caf44faf95ba8c6dee1f6f959300374e2b65ff))
* renamed document rels schema file ([10c3fda](https://github.com/privateOmega/html-to-docx/commit/10c3fda9878847257b902d4c13c2d8dd36edd3f6))
* renamed unit converters ([eee4487](https://github.com/privateOmega/html-to-docx/commit/eee44877cfee7228eb27b9efeb10b07a0e67ada9))
* rewrote formatting loop to avoid memory leaks and text loss ([e5fe27c](https://github.com/privateOmega/html-to-docx/commit/e5fe27c232ba1394b93735dcc701354bbc5244b3))
* scaled down images ([72d7c44](https://github.com/privateOmega/html-to-docx/commit/72d7c448730a46499a1a5cab50c443a525967a54))
* table cell border style support ([2c5a205](https://github.com/privateOmega/html-to-docx/commit/2c5a2055d33ee02f55a07e9c8ba985e2e07f2871))
* **template:** fixed document templating ([5f6a74f](https://github.com/privateOmega/html-to-docx/commit/5f6a74f9964348590fbb7f5baf88230c8c796766))
* table cell vertical align issue ([424d2c1](https://github.com/privateOmega/html-to-docx/commit/424d2c1177e1d335dbfa2b016d59cd50817e679a))
* table header bold ([aa62347](https://github.com/privateOmega/html-to-docx/commit/aa6234724f7b8f1ba91d724b9c6cd12ab2b725cb))
* updated document abstraction to track generation ids ([c34810f](https://github.com/privateOmega/html-to-docx/commit/c34810f1373f934b0b3ecbe9da2838f41a68dcc9))
* **template:** fixed numbering templating ([8b09691](https://github.com/privateOmega/html-to-docx/commit/8b096916284cbbe8452bb572d788caee23849084))
* updated documentrels xml generation ([433e4b4](https://github.com/privateOmega/html-to-docx/commit/433e4b4eb9d71beede8feb1754363163ba5d1933))
* updated numbering xml generation ([81b7a82](https://github.com/privateOmega/html-to-docx/commit/81b7a8296d1e3afa095f47007a66698852d29f95))
* updated xml builder to use namespace and child nodes ([2e28b5e](https://github.com/privateOmega/html-to-docx/commit/2e28b5ec07241c10c4288412a6ced8023e8c03ce))
* **template:** removed word xml schema ([ee0e1ed](https://github.com/privateOmega/html-to-docx/commit/ee0e1ed7b0b00cbaf3644ad887175abac0282dcc))
* used image dimensions for extent fragment ([aa17f74](https://github.com/privateOmega/html-to-docx/commit/aa17f74d3a2fab51cfa730ce62c09c2862bad532))
* using libtidy for cleaning up HTML string ([6b237a8](https://github.com/privateOmega/html-to-docx/commit/6b237a885008414c4625ca6b891bd7e48cee2111))
* wrapped drawing inside paragraph tag ([d0476b4](https://github.com/privateOmega/html-to-docx/commit/d0476b4211fe13f5918091a6a06e5021015a5db8))

### [1.1.21](https://github.com/privateOmega/html-to-docx/compare/v1.1.20...v1.1.21) (2020-07-02)


### Bug Fixes

* changed paragraph after spacing ([025523b](https://github.com/privateOmega/html-to-docx/commit/025523b0f07433456e3f19f3774f441e46c7a89b))

### [1.1.20](https://github.com/privateOmega/html-to-docx/compare/v1.1.19...v1.1.20) (2020-07-01)

### [1.1.19](https://github.com/privateOmega/html-to-docx/compare/v1.1.18...v1.1.19) (2020-07-01)


### Bug Fixes

* handled empty formatting tag ([d97521f](https://github.com/privateOmega/html-to-docx/commit/d97521f8004d2e7af9f324cdbdcbbe4fcc299e4b))

### [1.1.18](https://github.com/privateOmega/html-to-docx/compare/v1.1.17...v1.1.18) (2020-06-23)


### Bug Fixes

* added border for paragraph padding ([252ead6](https://github.com/privateOmega/html-to-docx/commit/252ead6dc9f09b84edc9f1b145bb76ad2cb4fc01))

### [1.1.17](https://github.com/privateOmega/html-to-docx/compare/v1.1.16...v1.1.17) (2020-06-15)


### Bug Fixes

* added support for decimal inch ([6027d2f](https://github.com/privateOmega/html-to-docx/commit/6027d2f36bbc9bb97ff4cbcaa59372df33528a54))
* added support for full width background color ([733a937](https://github.com/privateOmega/html-to-docx/commit/733a9373ba13ccb0b781f66fe87d91a3eed4aab9))

### [1.1.16](https://github.com/privateOmega/html-to-docx/compare/v1.1.15...v1.1.16) (2020-06-12)


### Bug Fixes

* handled image inside table cell ([339c18a](https://github.com/privateOmega/html-to-docx/commit/339c18a3de7e7e86e4133a72e54cb6ed5ec386c2))

### [1.1.15](https://github.com/privateOmega/html-to-docx/compare/v1.1.14...v1.1.15) (2020-06-12)

### 1.1.14 (2020-06-12)


### Features

* **packaging:** added jszip for packaging ([89619ec](https://github.com/privateOmega/html-to-docx/commit/89619ec702564fb9c5eccaee55e65d366fcbacad))
* **packaging:** added method to create container ([9808cf2](https://github.com/privateOmega/html-to-docx/commit/9808cf211bbb50cf3d7cbe122d01c82d4272e888))
* enabling header on flag ([516463c](https://github.com/privateOmega/html-to-docx/commit/516463cd532e58895faa8dd465b7e725f0de59e3))
* **template:** added base docx template ([abdb87b](https://github.com/privateOmega/html-to-docx/commit/abdb87bdfead91890f9d54e2cedd038e916b6dce))
* abstracted conversion using docxDocument class ([c625a01](https://github.com/privateOmega/html-to-docx/commit/c625a0181a6c328c0319b579fa1173192dff1187))
* added b tag support ([f867abd](https://github.com/privateOmega/html-to-docx/commit/f867abd41c6bc85bbba207a27c58d441f1a2b532))
* added builder methods for images ([9e2720f](https://github.com/privateOmega/html-to-docx/commit/9e2720f261a46701c8a2581aadafa9b60e6cee6b))
* added css color string ([cb0db2f](https://github.com/privateOmega/html-to-docx/commit/cb0db2ff2d3f2f66df823dbafbc5603030241bc3))
* added document file render helper ([6dd9c3a](https://github.com/privateOmega/html-to-docx/commit/6dd9c3a01f5fceab78404d8ebddb848fb91c933c))
* added em tag support ([6a06265](https://github.com/privateOmega/html-to-docx/commit/6a06265f724a611b50144cb988e576bc4e40b4d4))
* added escape-html ([1a231d5](https://github.com/privateOmega/html-to-docx/commit/1a231d5dde3e6f9b5a23f248e19063191c07e54f))
* added font size support ([0f27c60](https://github.com/privateOmega/html-to-docx/commit/0f27c609baa5b9488bc195dff1c060bcc04bbf2d))
* added font support in styles ([18b3281](https://github.com/privateOmega/html-to-docx/commit/18b3281ac3f91e5c1905efa0487354ff78badec2))
* added font table ([0903d6b](https://github.com/privateOmega/html-to-docx/commit/0903d6b98fae6dc378cdeafdadd80a86501c9959))
* added header generation ([25fb44f](https://github.com/privateOmega/html-to-docx/commit/25fb44f945df3fdc5f37d619b3de3ebe68b84cd6))
* added heading sizes ([bb18e72](https://github.com/privateOmega/html-to-docx/commit/bb18e724c42b0c4581722b2899d5ff808c1495c4))
* added headings support ([fd489ee](https://github.com/privateOmega/html-to-docx/commit/fd489eeebfeedc7d05991f9366aeae2adc49fd6f))
* added highlight support ([6159925](https://github.com/privateOmega/html-to-docx/commit/6159925495b74ab254cd7dc5628526d531595a92))
* added horizontal text alignment ([d29669f](https://github.com/privateOmega/html-to-docx/commit/d29669ffdb0d63b7bdbbe09c6bca990e4c28cfb8))
* added hsl conversion support ([153fa43](https://github.com/privateOmega/html-to-docx/commit/153fa43f84c640085f45823bc2054b24c28023d0))
* added hyperlinks support ([3560ce9](https://github.com/privateOmega/html-to-docx/commit/3560ce9f23fa8f590aa340302bf0059c8dfb6d5f))
* added ins tag support ([6d64908](https://github.com/privateOmega/html-to-docx/commit/6d64908858dac290aa34421c236bdaf2d8ef07a7))
* added line height support ([3d0ea2f](https://github.com/privateOmega/html-to-docx/commit/3d0ea2fe56d13893e3c5cd0e4a35e7b26b7c1d0a))
* added linebreak support ([57c054c](https://github.com/privateOmega/html-to-docx/commit/57c054cd65f49d7c4244272af0117f2c141a8bc7))
* added method to archive images with other files ([b6da74b](https://github.com/privateOmega/html-to-docx/commit/b6da74be10be03d689ca044f3f95dd724a3a29b6))
* added more unit converters ([8f78c52](https://github.com/privateOmega/html-to-docx/commit/8f78c5241cf33d471c8b08e3f941f401d6a50d7b))
* added more xml builder methods ([ffc584b](https://github.com/privateOmega/html-to-docx/commit/ffc584bed7ab434431999517a3308483ba99489a))
* added more xml statment builder methods ([337e530](https://github.com/privateOmega/html-to-docx/commit/337e5305aa8768b6507323bec2279d557a35b67b))
* added other measure units for margins and fonts ([1ae584a](https://github.com/privateOmega/html-to-docx/commit/1ae584a1b0a5350943e10c0d129402b843d7b9a2))
* added strike through support ([b73e8c7](https://github.com/privateOmega/html-to-docx/commit/b73e8c76d0051bc6449ed57861b4ce1c7ad4b408))
* added support for span font sizing ([98b4844](https://github.com/privateOmega/html-to-docx/commit/98b4844858f967bd5a3932262d0b535cd53d499d))
* added support for subscript and superscript ([f1ee4ed](https://github.com/privateOmega/html-to-docx/commit/f1ee4edf183a45731b48bba2b91154da591c203f))
* added table row height support ([031c3aa](https://github.com/privateOmega/html-to-docx/commit/031c3aa963e5a7b2ee985ae8ac6ff612c89ae974))
* added text formatting to paragraph ([bacd888](https://github.com/privateOmega/html-to-docx/commit/bacd888253a35a18ac7ea4e9141d4a4fb60e3cf7))
* added valign to table cell element ([20e94f1](https://github.com/privateOmega/html-to-docx/commit/20e94f18370e8a92034f6d35f5e744ceb57ed774))
* added vdom to xml method ([8b5a618](https://github.com/privateOmega/html-to-docx/commit/8b5a6185e6e211b0e07b9f1c1b7e23fb4b13dc9c))
* added virtual-dom and html-to-vdom ([feaa396](https://github.com/privateOmega/html-to-docx/commit/feaa396162465276d19b7d3d5c51a533987a1738))
* added xbuilder ([f13b5cc](https://github.com/privateOmega/html-to-docx/commit/f13b5cc06d29ae53493f1f4b8fdef6e8986e64e6))
* added xml builder methods for images ([f413ad8](https://github.com/privateOmega/html-to-docx/commit/f413ad89b263c63a8fb9890b44b1b219a7413c4b))
* added xml statement builder helper ([5e23c16](https://github.com/privateOmega/html-to-docx/commit/5e23c1636eb3c64f52589f1ac71a48dec3df65c2))
* handle line breaks ([164c0f5](https://github.com/privateOmega/html-to-docx/commit/164c0f5e17f62e3f30da25be6e181d3414ca4dde))
* styling table color ([2b44bff](https://github.com/privateOmega/html-to-docx/commit/2b44bff7dee0dad0de75f3c3b2403278c19e3a4b))
* **template:** added numbering schema ([d179d73](https://github.com/privateOmega/html-to-docx/commit/d179d736e6e63ed42104a231ca0489430faae00a))
* **template:** added styles schema ([d83d230](https://github.com/privateOmega/html-to-docx/commit/d83d230a66807f6ad08ebb4a6c0c5299c311aaf5))
* **template:** added XML schemas ([42232da](https://github.com/privateOmega/html-to-docx/commit/42232da9d63ed404367703e56b1c65cdb8a23782))


### Bug Fixes

* 3 digit hex color code support ([255fe82](https://github.com/privateOmega/html-to-docx/commit/255fe82fc47e2a447c795c346ae7c6634ae442d1))
* added attributes to anchor drawing ([62e4a29](https://github.com/privateOmega/html-to-docx/commit/62e4a29ef664257d8f0364d5d97f056a62f0fb61))
* added colspan support for table cells ([bdf92f8](https://github.com/privateOmega/html-to-docx/commit/bdf92f8dbb10b4b58188364f3bdc5ff91e9cc982))
* added default options ([4590800](https://github.com/privateOmega/html-to-docx/commit/459080010f92ce7464f4815585088a46ce8e759d))
* added effectextent and srcrect fragment ([5f5e975](https://github.com/privateOmega/html-to-docx/commit/5f5e975b135eb38c48e18a09da590b363166d74e))
* added empty paragraph for spacing after table ([6bae787](https://github.com/privateOmega/html-to-docx/commit/6bae787cbf3f376b8ec34389f444d8c7c5f3b340))
* added extent fragment ([7ce81f2](https://github.com/privateOmega/html-to-docx/commit/7ce81f27e4c493bb9bf7d368a415f34cb0678e4c))
* added header override in content-types xml ([5de681b](https://github.com/privateOmega/html-to-docx/commit/5de681be9295754eff648cea504e07bf9a6f6d09))
* added html string minifier ([8faa19c](https://github.com/privateOmega/html-to-docx/commit/8faa19c46ff85a31b16e89207cbc2120c6ed5805))
* added image conversion handler ([f726e71](https://github.com/privateOmega/html-to-docx/commit/f726e71ee2504bc254794ad09eaf5d67a8901b9a))
* added image in table cell support ([7d98a16](https://github.com/privateOmega/html-to-docx/commit/7d98a16b1509b57910e8294cfb3985a88b7154ae))
* added inline attributes ([0a4d2ce](https://github.com/privateOmega/html-to-docx/commit/0a4d2ce4b4c64952c3866928e6355b7c891ac044))
* added italics, underline and bold in runproperties ([34c2e18](https://github.com/privateOmega/html-to-docx/commit/34c2e18123c8a6a956209951afebc0dce2ab6cfc))
* added more namespaces ([68636b4](https://github.com/privateOmega/html-to-docx/commit/68636b4c7cc73bf9e0de75b7bf97ac9afb4fb6f9))
* added namespace aliases to header and numbering xmls ([d0b4101](https://github.com/privateOmega/html-to-docx/commit/d0b4101017a6dabd0fa18e23228bd4af338129eb))
* added numbering and styles relationship ([c7e29af](https://github.com/privateOmega/html-to-docx/commit/c7e29af7414ce71515c46861942342d4f397222b))
* added other namespaces to the xml root ([afbbca9](https://github.com/privateOmega/html-to-docx/commit/afbbca9dbf723afc857034ce7770bc8f0840c0e4))
* added override for relationship ([30acddc](https://github.com/privateOmega/html-to-docx/commit/30acddc84d40dc6c66ed9539618b94adeeb2fc85))
* added override for settings and websettings ([977af04](https://github.com/privateOmega/html-to-docx/commit/977af04f48c19f2b3162cf6e61782cf63e7162e8))
* added overrides for relationships ([22b9cac](https://github.com/privateOmega/html-to-docx/commit/22b9cac2fa788b9654262e450774c588180a18de))
* added padding between image and wrapping text ([e45fbf5](https://github.com/privateOmega/html-to-docx/commit/e45fbf553c19071023634b692e3c4b0fab04aedf))
* added positioning fragments ([e6f7e1c](https://github.com/privateOmega/html-to-docx/commit/e6f7e1c3679aa813a2818725548dfb5ebb0d9bd7))
* added required attributes to anchor fragment ([d01c9f9](https://github.com/privateOmega/html-to-docx/commit/d01c9f915a929de201218af127103da627aaa4a1))
* added settings and websettings relation ([34aeedc](https://github.com/privateOmega/html-to-docx/commit/34aeedce6d0dd02822062762f9b077bb146b09b9))
* added settings and websettings to ooxml package ([6c829b5](https://github.com/privateOmega/html-to-docx/commit/6c829b5ec4596ba0b5d41fae9ba2bfd68fdf7230))
* added simple positioning to anchor ([5006cc4](https://github.com/privateOmega/html-to-docx/commit/5006cc47d112360e51d8051f1ebff570e9f12779))
* added table and cell border support ([985f6a1](https://github.com/privateOmega/html-to-docx/commit/985f6a1e7a2e52f3b0a609a00da8a11bf113ef16))
* added table borders ([12864db](https://github.com/privateOmega/html-to-docx/commit/12864db468a08f4aca4d01cb8e8b6635aa09c57d))
* added table cell border support ([852c091](https://github.com/privateOmega/html-to-docx/commit/852c091e15a3b2add7b622472be8fc021bb05c06))
* added table header support ([592aa89](https://github.com/privateOmega/html-to-docx/commit/592aa893fa115a83bc1d056c98480dbe5cc872f9))
* added table width support ([73b172b](https://github.com/privateOmega/html-to-docx/commit/73b172b584aaeb7137d58e0eb2d8b73c4bb92561))
* added unit conversion utils ([d5b5a91](https://github.com/privateOmega/html-to-docx/commit/d5b5a915d215fb834cfe84996539ae663cc98914))
* added unit conversions ([5890b18](https://github.com/privateOmega/html-to-docx/commit/5890b18833cc11f10c8ffc1e57d1dd9ffd46395d))
* added unit conversions ([e6d546b](https://github.com/privateOmega/html-to-docx/commit/e6d546bca1a87182568d15bad99ac0af23ee55de))
* added wrap elements ([c951688](https://github.com/privateOmega/html-to-docx/commit/c95168864c4929e2ab95c5a6a53d0919c76f8a83))
* bold based on font-weight ([3f0376e](https://github.com/privateOmega/html-to-docx/commit/3f0376e0a1e267705117a2ec50c9f382286b2a60))
* changed attribute field for picture name ([aef241d](https://github.com/privateOmega/html-to-docx/commit/aef241dc3d3d9adb732c429df9f0c2771b319680))
* changed attribute used for name ([3885233](https://github.com/privateOmega/html-to-docx/commit/3885233bf14f9b7b16d48a2844d3e997e476a8ee))
* changed default namespace of relationship to solve render issue ([56a3554](https://github.com/privateOmega/html-to-docx/commit/56a3554e7b2e9d85cedeece8d20acfebf23666ad))
* changed file extension if octet stream is encountered ([32c5bf1](https://github.com/privateOmega/html-to-docx/commit/32c5bf1b5f7c5f8dc83a51fed142e932c7b008fd))
* changed line spacing rule to work with inline images ([489f1c6](https://github.com/privateOmega/html-to-docx/commit/489f1c62fc093b108bc16aee33d74baad4ced7d8))
* changed namespaces to original ecma 376 spec ([51be86e](https://github.com/privateOmega/html-to-docx/commit/51be86ecf0f4a78457840bf2a31579d217568208))
* created seperate abstract numbering for each lists ([c723c74](https://github.com/privateOmega/html-to-docx/commit/c723c746a3feb2612e73dddac14f1c40864e9ad9))
* fix table render issue due to grid width ([636d499](https://github.com/privateOmega/html-to-docx/commit/636d499bcee00195f7b5ca198c60bb3e0f7d2a69))
* fixed abstract numbering id ([9814cb8](https://github.com/privateOmega/html-to-docx/commit/9814cb89582bc7e87cec638be37ee1cd326c6117))
* fixed coloring and refactored other text formatting ([c288f80](https://github.com/privateOmega/html-to-docx/commit/c288f809ea6387c91356976a6dd81396cecafc46))
* fixed document rels and numbering bug ([d6e3152](https://github.com/privateOmega/html-to-docx/commit/d6e3152081da7d2ab379a67bfda345964fa15c40))
* fixed docx generation ([3d96acf](https://github.com/privateOmega/html-to-docx/commit/3d96acf511d82776510fac857af57d5cb9453f89))
* fixed incorrect table row generation ([742dd18](https://github.com/privateOmega/html-to-docx/commit/742dd1882ce4c1a33ab51e10ee2a628b817eca31))
* fixed internal mode and added extensions ([1266121](https://github.com/privateOmega/html-to-docx/commit/12661213e00c55f7068e93abb019ba80cd4f2d87))
* fixed margin issues ([f841b76](https://github.com/privateOmega/html-to-docx/commit/f841b76caa944ea5eec206a3b3fce3e5a5eaf3e7))
* fixed numbering and header issue due to wrong filename ([64a04bc](https://github.com/privateOmega/html-to-docx/commit/64a04bc192616162aa67c43f80734e7ebb9ff588))
* fixed table and image rendering ([c153092](https://github.com/privateOmega/html-to-docx/commit/c1530924f93351ce63882bf0e6050b6315aa6017))
* handled figure wrapper for images and tables ([4182a95](https://github.com/privateOmega/html-to-docx/commit/4182a9543aeb71fd8b0d2c7a2e08978a782de3e6))
* handled horizontal alignment ([72478cb](https://github.com/privateOmega/html-to-docx/commit/72478cb2308ac029f9a8149c416012101d23c18c))
* handled table width ([237ddfd](https://github.com/privateOmega/html-to-docx/commit/237ddfd6bff914e0379c6cbd940a7eac29d7aeaf))
* handled vertical alignment ([b2b3bcc](https://github.com/privateOmega/html-to-docx/commit/b2b3bcc382dc645a3cdebe18d99558538bad6282))
* handling multiple span children and multilevel formatting of text ([4c81f58](https://github.com/privateOmega/html-to-docx/commit/4c81f586400d1f227236a8b07d067331c0f02c5d))
* handling nested formatting ([04f0d7e](https://github.com/privateOmega/html-to-docx/commit/04f0d7e822a57fc3ba98d3990e17b9153c54afc7))
* modified example to use esm bundle ([491a83d](https://github.com/privateOmega/html-to-docx/commit/491a83d9b2c0deec13743817cdf32280d39bb9cd))
* moved namespaces into separate file ([75cdf30](https://github.com/privateOmega/html-to-docx/commit/75cdf3033e69934b189a74d6c77eef08d50492aa))
* namespace updated to 2016 standards ([6fc2ac2](https://github.com/privateOmega/html-to-docx/commit/6fc2ac2b6e904c4dd774b24e0ad119cccd873e0b))
* preserve spacing on text ([f2f12b1](https://github.com/privateOmega/html-to-docx/commit/f2f12b1f4903aa7caf6bae5cad3b88d9aed46d18))
* removed unwanted attribute ([f3caf44](https://github.com/privateOmega/html-to-docx/commit/f3caf44faf95ba8c6dee1f6f959300374e2b65ff))
* renamed document rels schema file ([10c3fda](https://github.com/privateOmega/html-to-docx/commit/10c3fda9878847257b902d4c13c2d8dd36edd3f6))
* renamed unit converters ([eee4487](https://github.com/privateOmega/html-to-docx/commit/eee44877cfee7228eb27b9efeb10b07a0e67ada9))
* scaled down images ([72d7c44](https://github.com/privateOmega/html-to-docx/commit/72d7c448730a46499a1a5cab50c443a525967a54))
* table cell border style support ([2c5a205](https://github.com/privateOmega/html-to-docx/commit/2c5a2055d33ee02f55a07e9c8ba985e2e07f2871))
* table cell vertical align issue ([424d2c1](https://github.com/privateOmega/html-to-docx/commit/424d2c1177e1d335dbfa2b016d59cd50817e679a))
* updated document abstraction to track generation ids ([c34810f](https://github.com/privateOmega/html-to-docx/commit/c34810f1373f934b0b3ecbe9da2838f41a68dcc9))
* updated documentrels xml generation ([433e4b4](https://github.com/privateOmega/html-to-docx/commit/433e4b4eb9d71beede8feb1754363163ba5d1933))
* updated numbering xml generation ([81b7a82](https://github.com/privateOmega/html-to-docx/commit/81b7a8296d1e3afa095f47007a66698852d29f95))
* updated xml builder to use namespace and child nodes ([2e28b5e](https://github.com/privateOmega/html-to-docx/commit/2e28b5ec07241c10c4288412a6ced8023e8c03ce))
* **template:** fixed document templating ([5f6a74f](https://github.com/privateOmega/html-to-docx/commit/5f6a74f9964348590fbb7f5baf88230c8c796766))
* **template:** fixed numbering templating ([8b09691](https://github.com/privateOmega/html-to-docx/commit/8b096916284cbbe8452bb572d788caee23849084))
* used image dimensions for extent fragment ([aa17f74](https://github.com/privateOmega/html-to-docx/commit/aa17f74d3a2fab51cfa730ce62c09c2862bad532))
* **template:** removed word xml schema ([ee0e1ed](https://github.com/privateOmega/html-to-docx/commit/ee0e1ed7b0b00cbaf3644ad887175abac0282dcc))
* wrapped drawing inside paragraph tag ([d0476b4](https://github.com/privateOmega/html-to-docx/commit/d0476b4211fe13f5918091a6a06e5021015a5db8))

### [1.1.13](https://github.com/privateOmega/html-to-docx/compare/v1.1.12...v1.1.13) (2020-06-12)

### [1.1.12](https://github.com/privateOmega/html-to-docx/compare/v1.1.11...v1.1.12) (2020-06-12)


### Bug Fixes

* handled horizontal alignment ([72478cb](https://github.com/privateOmega/html-to-docx/commit/72478cb2308ac029f9a8149c416012101d23c18c))
* handled vertical alignment ([b2b3bcc](https://github.com/privateOmega/html-to-docx/commit/b2b3bcc382dc645a3cdebe18d99558538bad6282))

### [1.1.11](https://github.com/privateOmega/html-to-docx/compare/v1.1.10...v1.1.11) (2020-06-10)


### Bug Fixes

* added table width support ([73b172b](https://github.com/privateOmega/html-to-docx/commit/73b172b584aaeb7137d58e0eb2d8b73c4bb92561))

### [1.1.10](https://github.com/privateOmega/html-to-docx/compare/v1.1.9...v1.1.10) (2020-06-10)


### Features

* added b tag support ([f867abd](https://github.com/privateOmega/html-to-docx/commit/f867abd41c6bc85bbba207a27c58d441f1a2b532))
* added em tag support ([6a06265](https://github.com/privateOmega/html-to-docx/commit/6a06265f724a611b50144cb988e576bc4e40b4d4))
* added heading sizes ([bb18e72](https://github.com/privateOmega/html-to-docx/commit/bb18e724c42b0c4581722b2899d5ff808c1495c4))
* added headings support ([fd489ee](https://github.com/privateOmega/html-to-docx/commit/fd489eeebfeedc7d05991f9366aeae2adc49fd6f))
* added highlight support ([6159925](https://github.com/privateOmega/html-to-docx/commit/6159925495b74ab254cd7dc5628526d531595a92))
* added ins tag support ([6d64908](https://github.com/privateOmega/html-to-docx/commit/6d64908858dac290aa34421c236bdaf2d8ef07a7))
* added linebreak support ([57c054c](https://github.com/privateOmega/html-to-docx/commit/57c054cd65f49d7c4244272af0117f2c141a8bc7))
* added strike through support ([b73e8c7](https://github.com/privateOmega/html-to-docx/commit/b73e8c76d0051bc6449ed57861b4ce1c7ad4b408))
* added support for subscript and superscript ([f1ee4ed](https://github.com/privateOmega/html-to-docx/commit/f1ee4edf183a45731b48bba2b91154da591c203f))


### Bug Fixes

* added empty paragraph for spacing after table ([6bae787](https://github.com/privateOmega/html-to-docx/commit/6bae787cbf3f376b8ec34389f444d8c7c5f3b340))
* added html string minifier ([8faa19c](https://github.com/privateOmega/html-to-docx/commit/8faa19c46ff85a31b16e89207cbc2120c6ed5805))
* added image in table cell support ([7d98a16](https://github.com/privateOmega/html-to-docx/commit/7d98a16b1509b57910e8294cfb3985a88b7154ae))
* added table and cell border support ([985f6a1](https://github.com/privateOmega/html-to-docx/commit/985f6a1e7a2e52f3b0a609a00da8a11bf113ef16))
* added table cell border support ([852c091](https://github.com/privateOmega/html-to-docx/commit/852c091e15a3b2add7b622472be8fc021bb05c06))
* changed line spacing rule to work with inline images ([489f1c6](https://github.com/privateOmega/html-to-docx/commit/489f1c62fc093b108bc16aee33d74baad4ced7d8))
* preserve spacing on text ([f2f12b1](https://github.com/privateOmega/html-to-docx/commit/f2f12b1f4903aa7caf6bae5cad3b88d9aed46d18))
* table cell border style support ([2c5a205](https://github.com/privateOmega/html-to-docx/commit/2c5a2055d33ee02f55a07e9c8ba985e2e07f2871))
* used image dimensions for extent fragment ([aa17f74](https://github.com/privateOmega/html-to-docx/commit/aa17f74d3a2fab51cfa730ce62c09c2862bad532))

### [1.1.9](https://github.com/privateOmega/html-to-docx/compare/v1.1.8...v1.1.9) (2020-06-08)


### Features

* added more unit converters ([8f78c52](https://github.com/privateOmega/html-to-docx/commit/8f78c5241cf33d471c8b08e3f941f401d6a50d7b))
* added other measure units for margins and fonts ([1ae584a](https://github.com/privateOmega/html-to-docx/commit/1ae584a1b0a5350943e10c0d129402b843d7b9a2))


### Bug Fixes

* added colspan support for table cells ([bdf92f8](https://github.com/privateOmega/html-to-docx/commit/bdf92f8dbb10b4b58188364f3bdc5ff91e9cc982))
* created seperate abstract numbering for each lists ([c723c74](https://github.com/privateOmega/html-to-docx/commit/c723c746a3feb2612e73dddac14f1c40864e9ad9))
* renamed unit converters ([eee4487](https://github.com/privateOmega/html-to-docx/commit/eee44877cfee7228eb27b9efeb10b07a0e67ada9))
* table cell vertical align issue ([424d2c1](https://github.com/privateOmega/html-to-docx/commit/424d2c1177e1d335dbfa2b016d59cd50817e679a))

### [1.1.8](https://github.com/privateOmega/html-to-docx/compare/v1.1.7...v1.1.8) (2020-06-05)


### Features

* added font support in styles ([18b3281](https://github.com/privateOmega/html-to-docx/commit/18b3281ac3f91e5c1905efa0487354ff78badec2))
* added font table ([0903d6b](https://github.com/privateOmega/html-to-docx/commit/0903d6b98fae6dc378cdeafdadd80a86501c9959))


### Bug Fixes

* 3 digit hex color code support ([255fe82](https://github.com/privateOmega/html-to-docx/commit/255fe82fc47e2a447c795c346ae7c6634ae442d1))

### [1.1.7](https://github.com/privateOmega/html-to-docx/compare/v1.1.6...v1.1.7) (2020-06-04)


### Features

* added table row height support ([031c3aa](https://github.com/privateOmega/html-to-docx/commit/031c3aa963e5a7b2ee985ae8ac6ff612c89ae974))


### Bug Fixes

* added table header support ([592aa89](https://github.com/privateOmega/html-to-docx/commit/592aa893fa115a83bc1d056c98480dbe5cc872f9))

### 1.1.6 (2020-06-04)


### Features

* **packaging:** added jszip for packaging ([89619ec](https://github.com/privateOmega/html-to-docx/commit/89619ec702564fb9c5eccaee55e65d366fcbacad))
* **packaging:** added method to create container ([9808cf2](https://github.com/privateOmega/html-to-docx/commit/9808cf211bbb50cf3d7cbe122d01c82d4272e888))
* added xml builder methods for images ([f413ad8](https://github.com/privateOmega/html-to-docx/commit/f413ad89b263c63a8fb9890b44b1b219a7413c4b))
* **template:** added base docx template ([abdb87b](https://github.com/privateOmega/html-to-docx/commit/abdb87bdfead91890f9d54e2cedd038e916b6dce))
* abstracted conversion using docxDocument class ([c625a01](https://github.com/privateOmega/html-to-docx/commit/c625a0181a6c328c0319b579fa1173192dff1187))
* added builder methods for images ([9e2720f](https://github.com/privateOmega/html-to-docx/commit/9e2720f261a46701c8a2581aadafa9b60e6cee6b))
* added css color string ([cb0db2f](https://github.com/privateOmega/html-to-docx/commit/cb0db2ff2d3f2f66df823dbafbc5603030241bc3))
* added document file render helper ([6dd9c3a](https://github.com/privateOmega/html-to-docx/commit/6dd9c3a01f5fceab78404d8ebddb848fb91c933c))
* added escape-html ([1a231d5](https://github.com/privateOmega/html-to-docx/commit/1a231d5dde3e6f9b5a23f248e19063191c07e54f))
* added font size support ([0f27c60](https://github.com/privateOmega/html-to-docx/commit/0f27c609baa5b9488bc195dff1c060bcc04bbf2d))
* added header generation ([25fb44f](https://github.com/privateOmega/html-to-docx/commit/25fb44f945df3fdc5f37d619b3de3ebe68b84cd6))
* added horizontal text alignment ([d29669f](https://github.com/privateOmega/html-to-docx/commit/d29669ffdb0d63b7bdbbe09c6bca990e4c28cfb8))
* added hsl conversion support ([153fa43](https://github.com/privateOmega/html-to-docx/commit/153fa43f84c640085f45823bc2054b24c28023d0))
* added hyperlinks support ([3560ce9](https://github.com/privateOmega/html-to-docx/commit/3560ce9f23fa8f590aa340302bf0059c8dfb6d5f))
* added line height support ([3d0ea2f](https://github.com/privateOmega/html-to-docx/commit/3d0ea2fe56d13893e3c5cd0e4a35e7b26b7c1d0a))
* added method to archive images with other files ([b6da74b](https://github.com/privateOmega/html-to-docx/commit/b6da74be10be03d689ca044f3f95dd724a3a29b6))
* added more xml builder methods ([ffc584b](https://github.com/privateOmega/html-to-docx/commit/ffc584bed7ab434431999517a3308483ba99489a))
* added more xml statment builder methods ([337e530](https://github.com/privateOmega/html-to-docx/commit/337e5305aa8768b6507323bec2279d557a35b67b))
* added support for span font sizing ([98b4844](https://github.com/privateOmega/html-to-docx/commit/98b4844858f967bd5a3932262d0b535cd53d499d))
* added text formatting to paragraph ([bacd888](https://github.com/privateOmega/html-to-docx/commit/bacd888253a35a18ac7ea4e9141d4a4fb60e3cf7))
* added valign to table cell element ([20e94f1](https://github.com/privateOmega/html-to-docx/commit/20e94f18370e8a92034f6d35f5e744ceb57ed774))
* added vdom to xml method ([8b5a618](https://github.com/privateOmega/html-to-docx/commit/8b5a6185e6e211b0e07b9f1c1b7e23fb4b13dc9c))
* added virtual-dom and html-to-vdom ([feaa396](https://github.com/privateOmega/html-to-docx/commit/feaa396162465276d19b7d3d5c51a533987a1738))
* added xbuilder ([f13b5cc](https://github.com/privateOmega/html-to-docx/commit/f13b5cc06d29ae53493f1f4b8fdef6e8986e64e6))
* added xml statement builder helper ([5e23c16](https://github.com/privateOmega/html-to-docx/commit/5e23c1636eb3c64f52589f1ac71a48dec3df65c2))
* enabling header on flag ([516463c](https://github.com/privateOmega/html-to-docx/commit/516463cd532e58895faa8dd465b7e725f0de59e3))
* handle line breaks ([164c0f5](https://github.com/privateOmega/html-to-docx/commit/164c0f5e17f62e3f30da25be6e181d3414ca4dde))
* styling table color ([2b44bff](https://github.com/privateOmega/html-to-docx/commit/2b44bff7dee0dad0de75f3c3b2403278c19e3a4b))
* **template:** added numbering schema ([d179d73](https://github.com/privateOmega/html-to-docx/commit/d179d736e6e63ed42104a231ca0489430faae00a))
* **template:** added styles schema ([d83d230](https://github.com/privateOmega/html-to-docx/commit/d83d230a66807f6ad08ebb4a6c0c5299c311aaf5))
* **template:** added XML schemas ([42232da](https://github.com/privateOmega/html-to-docx/commit/42232da9d63ed404367703e56b1c65cdb8a23782))


### Bug Fixes

* added attributes to anchor drawing ([62e4a29](https://github.com/privateOmega/html-to-docx/commit/62e4a29ef664257d8f0364d5d97f056a62f0fb61))
* added default options ([4590800](https://github.com/privateOmega/html-to-docx/commit/459080010f92ce7464f4815585088a46ce8e759d))
* added effectextent and srcrect fragment ([5f5e975](https://github.com/privateOmega/html-to-docx/commit/5f5e975b135eb38c48e18a09da590b363166d74e))
* added extent fragment ([7ce81f2](https://github.com/privateOmega/html-to-docx/commit/7ce81f27e4c493bb9bf7d368a415f34cb0678e4c))
* added header override in content-types xml ([5de681b](https://github.com/privateOmega/html-to-docx/commit/5de681be9295754eff648cea504e07bf9a6f6d09))
* added image conversion handler ([f726e71](https://github.com/privateOmega/html-to-docx/commit/f726e71ee2504bc254794ad09eaf5d67a8901b9a))
* added inline attributes ([0a4d2ce](https://github.com/privateOmega/html-to-docx/commit/0a4d2ce4b4c64952c3866928e6355b7c891ac044))
* added italics, underline and bold in runproperties ([34c2e18](https://github.com/privateOmega/html-to-docx/commit/34c2e18123c8a6a956209951afebc0dce2ab6cfc))
* added more namespaces ([68636b4](https://github.com/privateOmega/html-to-docx/commit/68636b4c7cc73bf9e0de75b7bf97ac9afb4fb6f9))
* added namespace aliases to header and numbering xmls ([d0b4101](https://github.com/privateOmega/html-to-docx/commit/d0b4101017a6dabd0fa18e23228bd4af338129eb))
* added numbering and styles relationship ([c7e29af](https://github.com/privateOmega/html-to-docx/commit/c7e29af7414ce71515c46861942342d4f397222b))
* added other namespaces to the xml root ([afbbca9](https://github.com/privateOmega/html-to-docx/commit/afbbca9dbf723afc857034ce7770bc8f0840c0e4))
* added override for relationship ([30acddc](https://github.com/privateOmega/html-to-docx/commit/30acddc84d40dc6c66ed9539618b94adeeb2fc85))
* added override for settings and websettings ([977af04](https://github.com/privateOmega/html-to-docx/commit/977af04f48c19f2b3162cf6e61782cf63e7162e8))
* added overrides for relationships ([22b9cac](https://github.com/privateOmega/html-to-docx/commit/22b9cac2fa788b9654262e450774c588180a18de))
* added padding between image and wrapping text ([e45fbf5](https://github.com/privateOmega/html-to-docx/commit/e45fbf553c19071023634b692e3c4b0fab04aedf))
* added positioning fragments ([e6f7e1c](https://github.com/privateOmega/html-to-docx/commit/e6f7e1c3679aa813a2818725548dfb5ebb0d9bd7))
* added required attributes to anchor fragment ([d01c9f9](https://github.com/privateOmega/html-to-docx/commit/d01c9f915a929de201218af127103da627aaa4a1))
* added settings and websettings relation ([34aeedc](https://github.com/privateOmega/html-to-docx/commit/34aeedce6d0dd02822062762f9b077bb146b09b9))
* added settings and websettings to ooxml package ([6c829b5](https://github.com/privateOmega/html-to-docx/commit/6c829b5ec4596ba0b5d41fae9ba2bfd68fdf7230))
* added simple positioning to anchor ([5006cc4](https://github.com/privateOmega/html-to-docx/commit/5006cc47d112360e51d8051f1ebff570e9f12779))
* added table borders ([12864db](https://github.com/privateOmega/html-to-docx/commit/12864db468a08f4aca4d01cb8e8b6635aa09c57d))
* added unit conversion utils ([d5b5a91](https://github.com/privateOmega/html-to-docx/commit/d5b5a915d215fb834cfe84996539ae663cc98914))
* added unit conversions ([5890b18](https://github.com/privateOmega/html-to-docx/commit/5890b18833cc11f10c8ffc1e57d1dd9ffd46395d))
* added unit conversions ([e6d546b](https://github.com/privateOmega/html-to-docx/commit/e6d546bca1a87182568d15bad99ac0af23ee55de))
* added wrap elements ([c951688](https://github.com/privateOmega/html-to-docx/commit/c95168864c4929e2ab95c5a6a53d0919c76f8a83))
* bold based on font-weight ([3f0376e](https://github.com/privateOmega/html-to-docx/commit/3f0376e0a1e267705117a2ec50c9f382286b2a60))
* changed attribute field for picture name ([aef241d](https://github.com/privateOmega/html-to-docx/commit/aef241dc3d3d9adb732c429df9f0c2771b319680))
* changed attribute used for name ([3885233](https://github.com/privateOmega/html-to-docx/commit/3885233bf14f9b7b16d48a2844d3e997e476a8ee))
* changed default namespace of relationship to solve render issue ([56a3554](https://github.com/privateOmega/html-to-docx/commit/56a3554e7b2e9d85cedeece8d20acfebf23666ad))
* changed file extension if octet stream is encountered ([32c5bf1](https://github.com/privateOmega/html-to-docx/commit/32c5bf1b5f7c5f8dc83a51fed142e932c7b008fd))
* changed namespaces to original ecma 376 spec ([51be86e](https://github.com/privateOmega/html-to-docx/commit/51be86ecf0f4a78457840bf2a31579d217568208))
* fix table render issue due to grid width ([636d499](https://github.com/privateOmega/html-to-docx/commit/636d499bcee00195f7b5ca198c60bb3e0f7d2a69))
* fixed abstract numbering id ([9814cb8](https://github.com/privateOmega/html-to-docx/commit/9814cb89582bc7e87cec638be37ee1cd326c6117))
* fixed coloring and refactored other text formatting ([c288f80](https://github.com/privateOmega/html-to-docx/commit/c288f809ea6387c91356976a6dd81396cecafc46))
* fixed document rels and numbering bug ([d6e3152](https://github.com/privateOmega/html-to-docx/commit/d6e3152081da7d2ab379a67bfda345964fa15c40))
* fixed docx generation ([3d96acf](https://github.com/privateOmega/html-to-docx/commit/3d96acf511d82776510fac857af57d5cb9453f89))
* fixed incorrect table row generation ([742dd18](https://github.com/privateOmega/html-to-docx/commit/742dd1882ce4c1a33ab51e10ee2a628b817eca31))
* fixed internal mode and added extensions ([1266121](https://github.com/privateOmega/html-to-docx/commit/12661213e00c55f7068e93abb019ba80cd4f2d87))
* fixed margin issues ([f841b76](https://github.com/privateOmega/html-to-docx/commit/f841b76caa944ea5eec206a3b3fce3e5a5eaf3e7))
* fixed numbering and header issue due to wrong filename ([64a04bc](https://github.com/privateOmega/html-to-docx/commit/64a04bc192616162aa67c43f80734e7ebb9ff588))
* fixed table and image rendering ([c153092](https://github.com/privateOmega/html-to-docx/commit/c1530924f93351ce63882bf0e6050b6315aa6017))
* handled figure wrapper for images and tables ([4182a95](https://github.com/privateOmega/html-to-docx/commit/4182a9543aeb71fd8b0d2c7a2e08978a782de3e6))
* handled table width ([237ddfd](https://github.com/privateOmega/html-to-docx/commit/237ddfd6bff914e0379c6cbd940a7eac29d7aeaf))
* handling multiple span children and multilevel formatting of text ([4c81f58](https://github.com/privateOmega/html-to-docx/commit/4c81f586400d1f227236a8b07d067331c0f02c5d))
* handling nested formatting ([04f0d7e](https://github.com/privateOmega/html-to-docx/commit/04f0d7e822a57fc3ba98d3990e17b9153c54afc7))
* modified example to use esm bundle ([491a83d](https://github.com/privateOmega/html-to-docx/commit/491a83d9b2c0deec13743817cdf32280d39bb9cd))
* moved namespaces into separate file ([75cdf30](https://github.com/privateOmega/html-to-docx/commit/75cdf3033e69934b189a74d6c77eef08d50492aa))
* namespace updated to 2016 standards ([6fc2ac2](https://github.com/privateOmega/html-to-docx/commit/6fc2ac2b6e904c4dd774b24e0ad119cccd873e0b))
* removed unwanted attribute ([f3caf44](https://github.com/privateOmega/html-to-docx/commit/f3caf44faf95ba8c6dee1f6f959300374e2b65ff))
* renamed document rels schema file ([10c3fda](https://github.com/privateOmega/html-to-docx/commit/10c3fda9878847257b902d4c13c2d8dd36edd3f6))
* scaled down images ([72d7c44](https://github.com/privateOmega/html-to-docx/commit/72d7c448730a46499a1a5cab50c443a525967a54))
* updated document abstraction to track generation ids ([c34810f](https://github.com/privateOmega/html-to-docx/commit/c34810f1373f934b0b3ecbe9da2838f41a68dcc9))
* updated documentrels xml generation ([433e4b4](https://github.com/privateOmega/html-to-docx/commit/433e4b4eb9d71beede8feb1754363163ba5d1933))
* updated numbering xml generation ([81b7a82](https://github.com/privateOmega/html-to-docx/commit/81b7a8296d1e3afa095f47007a66698852d29f95))
* updated xml builder to use namespace and child nodes ([2e28b5e](https://github.com/privateOmega/html-to-docx/commit/2e28b5ec07241c10c4288412a6ced8023e8c03ce))
* **template:** fixed document templating ([5f6a74f](https://github.com/privateOmega/html-to-docx/commit/5f6a74f9964348590fbb7f5baf88230c8c796766))
* **template:** fixed numbering templating ([8b09691](https://github.com/privateOmega/html-to-docx/commit/8b096916284cbbe8452bb572d788caee23849084))
* wrapped drawing inside paragraph tag ([d0476b4](https://github.com/privateOmega/html-to-docx/commit/d0476b4211fe13f5918091a6a06e5021015a5db8))
* **template:** removed word xml schema ([ee0e1ed](https://github.com/privateOmega/html-to-docx/commit/ee0e1ed7b0b00cbaf3644ad887175abac0282dcc))

### [1.1.5](https://github.com/privateOmega/html-to-docx/compare/v1.1.4...v1.1.5) (2020-06-03)

### [1.1.4](https://github.com/privateOmega/html-to-docx/compare/v1.1.3...v1.1.4) (2020-06-03)


### Features

* added css color string ([cb0db2f](https://github.com/privateOmega/html-to-docx/commit/cb0db2ff2d3f2f66df823dbafbc5603030241bc3))
* added horizontal text alignment ([d29669f](https://github.com/privateOmega/html-to-docx/commit/d29669ffdb0d63b7bdbbe09c6bca990e4c28cfb8))


### Bug Fixes

* bold based on font-weight ([3f0376e](https://github.com/privateOmega/html-to-docx/commit/3f0376e0a1e267705117a2ec50c9f382286b2a60))
* handling nested formatting ([04f0d7e](https://github.com/privateOmega/html-to-docx/commit/04f0d7e822a57fc3ba98d3990e17b9153c54afc7))

### 1.1.3 (2020-06-03)


### Features

* **packaging:** added jszip for packaging ([89619ec](https://github.com/privateOmega/html-to-docx/commit/89619ec702564fb9c5eccaee55e65d366fcbacad))
* **packaging:** added method to create container ([9808cf2](https://github.com/privateOmega/html-to-docx/commit/9808cf211bbb50cf3d7cbe122d01c82d4272e888))
* added escape-html ([1a231d5](https://github.com/privateOmega/html-to-docx/commit/1a231d5dde3e6f9b5a23f248e19063191c07e54f))
* **template:** added base docx template ([abdb87b](https://github.com/privateOmega/html-to-docx/commit/abdb87bdfead91890f9d54e2cedd038e916b6dce))
* abstracted conversion using docxDocument class ([c625a01](https://github.com/privateOmega/html-to-docx/commit/c625a0181a6c328c0319b579fa1173192dff1187))
* added builder methods for images ([9e2720f](https://github.com/privateOmega/html-to-docx/commit/9e2720f261a46701c8a2581aadafa9b60e6cee6b))
* added document file render helper ([6dd9c3a](https://github.com/privateOmega/html-to-docx/commit/6dd9c3a01f5fceab78404d8ebddb848fb91c933c))
* added header generation ([25fb44f](https://github.com/privateOmega/html-to-docx/commit/25fb44f945df3fdc5f37d619b3de3ebe68b84cd6))
* added hsl conversion support ([153fa43](https://github.com/privateOmega/html-to-docx/commit/153fa43f84c640085f45823bc2054b24c28023d0))
* **template:** added styles schema ([d83d230](https://github.com/privateOmega/html-to-docx/commit/d83d230a66807f6ad08ebb4a6c0c5299c311aaf5))
* added hyperlinks support ([3560ce9](https://github.com/privateOmega/html-to-docx/commit/3560ce9f23fa8f590aa340302bf0059c8dfb6d5f))
* added method to archive images with other files ([b6da74b](https://github.com/privateOmega/html-to-docx/commit/b6da74be10be03d689ca044f3f95dd724a3a29b6))
* added more xml builder methods ([ffc584b](https://github.com/privateOmega/html-to-docx/commit/ffc584bed7ab434431999517a3308483ba99489a))
* added more xml statment builder methods ([337e530](https://github.com/privateOmega/html-to-docx/commit/337e5305aa8768b6507323bec2279d557a35b67b))
* added text formatting to paragraph ([bacd888](https://github.com/privateOmega/html-to-docx/commit/bacd888253a35a18ac7ea4e9141d4a4fb60e3cf7))
* added valign to table cell element ([20e94f1](https://github.com/privateOmega/html-to-docx/commit/20e94f18370e8a92034f6d35f5e744ceb57ed774))
* added vdom to xml method ([8b5a618](https://github.com/privateOmega/html-to-docx/commit/8b5a6185e6e211b0e07b9f1c1b7e23fb4b13dc9c))
* added virtual-dom and html-to-vdom ([feaa396](https://github.com/privateOmega/html-to-docx/commit/feaa396162465276d19b7d3d5c51a533987a1738))
* added xbuilder ([f13b5cc](https://github.com/privateOmega/html-to-docx/commit/f13b5cc06d29ae53493f1f4b8fdef6e8986e64e6))
* added xml builder methods for images ([f413ad8](https://github.com/privateOmega/html-to-docx/commit/f413ad89b263c63a8fb9890b44b1b219a7413c4b))
* added xml statement builder helper ([5e23c16](https://github.com/privateOmega/html-to-docx/commit/5e23c1636eb3c64f52589f1ac71a48dec3df65c2))
* enabling header on flag ([516463c](https://github.com/privateOmega/html-to-docx/commit/516463cd532e58895faa8dd465b7e725f0de59e3))
* handle line breaks ([164c0f5](https://github.com/privateOmega/html-to-docx/commit/164c0f5e17f62e3f30da25be6e181d3414ca4dde))
* styling table color ([2b44bff](https://github.com/privateOmega/html-to-docx/commit/2b44bff7dee0dad0de75f3c3b2403278c19e3a4b))
* **template:** added numbering schema ([d179d73](https://github.com/privateOmega/html-to-docx/commit/d179d736e6e63ed42104a231ca0489430faae00a))
* **template:** added XML schemas ([42232da](https://github.com/privateOmega/html-to-docx/commit/42232da9d63ed404367703e56b1c65cdb8a23782))


### Bug Fixes

* added attributes to anchor drawing ([62e4a29](https://github.com/privateOmega/html-to-docx/commit/62e4a29ef664257d8f0364d5d97f056a62f0fb61))
* added default options ([4590800](https://github.com/privateOmega/html-to-docx/commit/459080010f92ce7464f4815585088a46ce8e759d))
* added effectextent and srcrect fragment ([5f5e975](https://github.com/privateOmega/html-to-docx/commit/5f5e975b135eb38c48e18a09da590b363166d74e))
* added extent fragment ([7ce81f2](https://github.com/privateOmega/html-to-docx/commit/7ce81f27e4c493bb9bf7d368a415f34cb0678e4c))
* added header override in content-types xml ([5de681b](https://github.com/privateOmega/html-to-docx/commit/5de681be9295754eff648cea504e07bf9a6f6d09))
* added image conversion handler ([f726e71](https://github.com/privateOmega/html-to-docx/commit/f726e71ee2504bc254794ad09eaf5d67a8901b9a))
* added inline attributes ([0a4d2ce](https://github.com/privateOmega/html-to-docx/commit/0a4d2ce4b4c64952c3866928e6355b7c891ac044))
* added italics, underline and bold in runproperties ([34c2e18](https://github.com/privateOmega/html-to-docx/commit/34c2e18123c8a6a956209951afebc0dce2ab6cfc))
* added more namespaces ([68636b4](https://github.com/privateOmega/html-to-docx/commit/68636b4c7cc73bf9e0de75b7bf97ac9afb4fb6f9))
* added namespace aliases to header and numbering xmls ([d0b4101](https://github.com/privateOmega/html-to-docx/commit/d0b4101017a6dabd0fa18e23228bd4af338129eb))
* added numbering and styles relationship ([c7e29af](https://github.com/privateOmega/html-to-docx/commit/c7e29af7414ce71515c46861942342d4f397222b))
* added other namespaces to the xml root ([afbbca9](https://github.com/privateOmega/html-to-docx/commit/afbbca9dbf723afc857034ce7770bc8f0840c0e4))
* added override for relationship ([30acddc](https://github.com/privateOmega/html-to-docx/commit/30acddc84d40dc6c66ed9539618b94adeeb2fc85))
* added override for settings and websettings ([977af04](https://github.com/privateOmega/html-to-docx/commit/977af04f48c19f2b3162cf6e61782cf63e7162e8))
* added overrides for relationships ([22b9cac](https://github.com/privateOmega/html-to-docx/commit/22b9cac2fa788b9654262e450774c588180a18de))
* added padding between image and wrapping text ([e45fbf5](https://github.com/privateOmega/html-to-docx/commit/e45fbf553c19071023634b692e3c4b0fab04aedf))
* added positioning fragments ([e6f7e1c](https://github.com/privateOmega/html-to-docx/commit/e6f7e1c3679aa813a2818725548dfb5ebb0d9bd7))
* added required attributes to anchor fragment ([d01c9f9](https://github.com/privateOmega/html-to-docx/commit/d01c9f915a929de201218af127103da627aaa4a1))
* changed namespaces to original ecma 376 spec ([51be86e](https://github.com/privateOmega/html-to-docx/commit/51be86ecf0f4a78457840bf2a31579d217568208))
* **template:** removed word xml schema ([ee0e1ed](https://github.com/privateOmega/html-to-docx/commit/ee0e1ed7b0b00cbaf3644ad887175abac0282dcc))
* added settings and websettings relation ([34aeedc](https://github.com/privateOmega/html-to-docx/commit/34aeedce6d0dd02822062762f9b077bb146b09b9))
* added settings and websettings to ooxml package ([6c829b5](https://github.com/privateOmega/html-to-docx/commit/6c829b5ec4596ba0b5d41fae9ba2bfd68fdf7230))
* added simple positioning to anchor ([5006cc4](https://github.com/privateOmega/html-to-docx/commit/5006cc47d112360e51d8051f1ebff570e9f12779))
* added table borders ([12864db](https://github.com/privateOmega/html-to-docx/commit/12864db468a08f4aca4d01cb8e8b6635aa09c57d))
* added unit conversion utils ([d5b5a91](https://github.com/privateOmega/html-to-docx/commit/d5b5a915d215fb834cfe84996539ae663cc98914))
* added wrap elements ([c951688](https://github.com/privateOmega/html-to-docx/commit/c95168864c4929e2ab95c5a6a53d0919c76f8a83))
* changed attribute field for picture name ([aef241d](https://github.com/privateOmega/html-to-docx/commit/aef241dc3d3d9adb732c429df9f0c2771b319680))
* changed attribute used for name ([3885233](https://github.com/privateOmega/html-to-docx/commit/3885233bf14f9b7b16d48a2844d3e997e476a8ee))
* changed default namespace of relationship to solve render issue ([56a3554](https://github.com/privateOmega/html-to-docx/commit/56a3554e7b2e9d85cedeece8d20acfebf23666ad))
* changed file extension if octet stream is encountered ([32c5bf1](https://github.com/privateOmega/html-to-docx/commit/32c5bf1b5f7c5f8dc83a51fed142e932c7b008fd))
* fix table render issue due to grid width ([636d499](https://github.com/privateOmega/html-to-docx/commit/636d499bcee00195f7b5ca198c60bb3e0f7d2a69))
* fixed abstract numbering id ([9814cb8](https://github.com/privateOmega/html-to-docx/commit/9814cb89582bc7e87cec638be37ee1cd326c6117))
* fixed coloring and refactored other text formatting ([c288f80](https://github.com/privateOmega/html-to-docx/commit/c288f809ea6387c91356976a6dd81396cecafc46))
* fixed document rels and numbering bug ([d6e3152](https://github.com/privateOmega/html-to-docx/commit/d6e3152081da7d2ab379a67bfda345964fa15c40))
* fixed docx generation ([3d96acf](https://github.com/privateOmega/html-to-docx/commit/3d96acf511d82776510fac857af57d5cb9453f89))
* fixed incorrect table row generation ([742dd18](https://github.com/privateOmega/html-to-docx/commit/742dd1882ce4c1a33ab51e10ee2a628b817eca31))
* fixed internal mode and added extensions ([1266121](https://github.com/privateOmega/html-to-docx/commit/12661213e00c55f7068e93abb019ba80cd4f2d87))
* fixed margin issues ([f841b76](https://github.com/privateOmega/html-to-docx/commit/f841b76caa944ea5eec206a3b3fce3e5a5eaf3e7))
* fixed numbering and header issue due to wrong filename ([64a04bc](https://github.com/privateOmega/html-to-docx/commit/64a04bc192616162aa67c43f80734e7ebb9ff588))
* fixed table and image rendering ([c153092](https://github.com/privateOmega/html-to-docx/commit/c1530924f93351ce63882bf0e6050b6315aa6017))
* handled figure wrapper for images and tables ([4182a95](https://github.com/privateOmega/html-to-docx/commit/4182a9543aeb71fd8b0d2c7a2e08978a782de3e6))
* handled table width ([237ddfd](https://github.com/privateOmega/html-to-docx/commit/237ddfd6bff914e0379c6cbd940a7eac29d7aeaf))
* handling multiple span children and multilevel formatting of text ([4c81f58](https://github.com/privateOmega/html-to-docx/commit/4c81f586400d1f227236a8b07d067331c0f02c5d))
* modified example to use esm bundle ([491a83d](https://github.com/privateOmega/html-to-docx/commit/491a83d9b2c0deec13743817cdf32280d39bb9cd))
* moved namespaces into separate file ([75cdf30](https://github.com/privateOmega/html-to-docx/commit/75cdf3033e69934b189a74d6c77eef08d50492aa))
* namespace updated to 2016 standards ([6fc2ac2](https://github.com/privateOmega/html-to-docx/commit/6fc2ac2b6e904c4dd774b24e0ad119cccd873e0b))
* removed unwanted attribute ([f3caf44](https://github.com/privateOmega/html-to-docx/commit/f3caf44faf95ba8c6dee1f6f959300374e2b65ff))
* renamed document rels schema file ([10c3fda](https://github.com/privateOmega/html-to-docx/commit/10c3fda9878847257b902d4c13c2d8dd36edd3f6))
* scaled down images ([72d7c44](https://github.com/privateOmega/html-to-docx/commit/72d7c448730a46499a1a5cab50c443a525967a54))
* updated document abstraction to track generation ids ([c34810f](https://github.com/privateOmega/html-to-docx/commit/c34810f1373f934b0b3ecbe9da2838f41a68dcc9))
* updated documentrels xml generation ([433e4b4](https://github.com/privateOmega/html-to-docx/commit/433e4b4eb9d71beede8feb1754363163ba5d1933))
* updated numbering xml generation ([81b7a82](https://github.com/privateOmega/html-to-docx/commit/81b7a8296d1e3afa095f47007a66698852d29f95))
* updated xml builder to use namespace and child nodes ([2e28b5e](https://github.com/privateOmega/html-to-docx/commit/2e28b5ec07241c10c4288412a6ced8023e8c03ce))
* **template:** fixed document templating ([5f6a74f](https://github.com/privateOmega/html-to-docx/commit/5f6a74f9964348590fbb7f5baf88230c8c796766))
* **template:** fixed numbering templating ([8b09691](https://github.com/privateOmega/html-to-docx/commit/8b096916284cbbe8452bb572d788caee23849084))
* wrapped drawing inside paragraph tag ([d0476b4](https://github.com/privateOmega/html-to-docx/commit/d0476b4211fe13f5918091a6a06e5021015a5db8))

### 1.1.2 (2020-05-29)


### Features

* **packaging:** added jszip for packaging ([89619ec](https://github.com/privateOmega/html-to-docx/commit/89619ec702564fb9c5eccaee55e65d366fcbacad))
* **packaging:** added method to create container ([9808cf2](https://github.com/privateOmega/html-to-docx/commit/9808cf211bbb50cf3d7cbe122d01c82d4272e888))
* abstracted conversion using docxDocument class ([c625a01](https://github.com/privateOmega/html-to-docx/commit/c625a0181a6c328c0319b579fa1173192dff1187))
* **template:** added base docx template ([abdb87b](https://github.com/privateOmega/html-to-docx/commit/abdb87bdfead91890f9d54e2cedd038e916b6dce))
* added builder methods for images ([9e2720f](https://github.com/privateOmega/html-to-docx/commit/9e2720f261a46701c8a2581aadafa9b60e6cee6b))
* added document file render helper ([6dd9c3a](https://github.com/privateOmega/html-to-docx/commit/6dd9c3a01f5fceab78404d8ebddb848fb91c933c))
* added escape-html ([1a231d5](https://github.com/privateOmega/html-to-docx/commit/1a231d5dde3e6f9b5a23f248e19063191c07e54f))
* added header generation ([25fb44f](https://github.com/privateOmega/html-to-docx/commit/25fb44f945df3fdc5f37d619b3de3ebe68b84cd6))
* added hyperlinks support ([3560ce9](https://github.com/privateOmega/html-to-docx/commit/3560ce9f23fa8f590aa340302bf0059c8dfb6d5f))
* added method to archive images with other files ([b6da74b](https://github.com/privateOmega/html-to-docx/commit/b6da74be10be03d689ca044f3f95dd724a3a29b6))
* added more xml builder methods ([ffc584b](https://github.com/privateOmega/html-to-docx/commit/ffc584bed7ab434431999517a3308483ba99489a))
* added more xml statment builder methods ([337e530](https://github.com/privateOmega/html-to-docx/commit/337e5305aa8768b6507323bec2279d557a35b67b))
* added text formatting to paragraph ([bacd888](https://github.com/privateOmega/html-to-docx/commit/bacd888253a35a18ac7ea4e9141d4a4fb60e3cf7))
* added vdom to xml method ([8b5a618](https://github.com/privateOmega/html-to-docx/commit/8b5a6185e6e211b0e07b9f1c1b7e23fb4b13dc9c))
* added virtual-dom and html-to-vdom ([feaa396](https://github.com/privateOmega/html-to-docx/commit/feaa396162465276d19b7d3d5c51a533987a1738))
* added xbuilder ([f13b5cc](https://github.com/privateOmega/html-to-docx/commit/f13b5cc06d29ae53493f1f4b8fdef6e8986e64e6))
* added xml builder methods for images ([f413ad8](https://github.com/privateOmega/html-to-docx/commit/f413ad89b263c63a8fb9890b44b1b219a7413c4b))
* added xml statement builder helper ([5e23c16](https://github.com/privateOmega/html-to-docx/commit/5e23c1636eb3c64f52589f1ac71a48dec3df65c2))
* enabling header on flag ([516463c](https://github.com/privateOmega/html-to-docx/commit/516463cd532e58895faa8dd465b7e725f0de59e3))
* handle line breaks ([164c0f5](https://github.com/privateOmega/html-to-docx/commit/164c0f5e17f62e3f30da25be6e181d3414ca4dde))
* **template:** added numbering schema ([d179d73](https://github.com/privateOmega/html-to-docx/commit/d179d736e6e63ed42104a231ca0489430faae00a))
* **template:** added styles schema ([d83d230](https://github.com/privateOmega/html-to-docx/commit/d83d230a66807f6ad08ebb4a6c0c5299c311aaf5))
* **template:** added XML schemas ([42232da](https://github.com/privateOmega/html-to-docx/commit/42232da9d63ed404367703e56b1c65cdb8a23782))


### Bug Fixes

* added attributes to anchor drawing ([62e4a29](https://github.com/privateOmega/html-to-docx/commit/62e4a29ef664257d8f0364d5d97f056a62f0fb61))
* added default options ([4590800](https://github.com/privateOmega/html-to-docx/commit/459080010f92ce7464f4815585088a46ce8e759d))
* added effectextent and srcrect fragment ([5f5e975](https://github.com/privateOmega/html-to-docx/commit/5f5e975b135eb38c48e18a09da590b363166d74e))
* added extent fragment ([7ce81f2](https://github.com/privateOmega/html-to-docx/commit/7ce81f27e4c493bb9bf7d368a415f34cb0678e4c))
* added header override in content-types xml ([5de681b](https://github.com/privateOmega/html-to-docx/commit/5de681be9295754eff648cea504e07bf9a6f6d09))
* added image conversion handler ([f726e71](https://github.com/privateOmega/html-to-docx/commit/f726e71ee2504bc254794ad09eaf5d67a8901b9a))
* added inline attributes ([0a4d2ce](https://github.com/privateOmega/html-to-docx/commit/0a4d2ce4b4c64952c3866928e6355b7c891ac044))
* added italics, underline and bold in runproperties ([34c2e18](https://github.com/privateOmega/html-to-docx/commit/34c2e18123c8a6a956209951afebc0dce2ab6cfc))
* added more namespaces ([68636b4](https://github.com/privateOmega/html-to-docx/commit/68636b4c7cc73bf9e0de75b7bf97ac9afb4fb6f9))
* added namespace aliases to header and numbering xmls ([d0b4101](https://github.com/privateOmega/html-to-docx/commit/d0b4101017a6dabd0fa18e23228bd4af338129eb))
* added numbering and styles relationship ([c7e29af](https://github.com/privateOmega/html-to-docx/commit/c7e29af7414ce71515c46861942342d4f397222b))
* added other namespaces to the xml root ([afbbca9](https://github.com/privateOmega/html-to-docx/commit/afbbca9dbf723afc857034ce7770bc8f0840c0e4))
* added override for relationship ([30acddc](https://github.com/privateOmega/html-to-docx/commit/30acddc84d40dc6c66ed9539618b94adeeb2fc85))
* added override for settings and websettings ([977af04](https://github.com/privateOmega/html-to-docx/commit/977af04f48c19f2b3162cf6e61782cf63e7162e8))
* added overrides for relationships ([22b9cac](https://github.com/privateOmega/html-to-docx/commit/22b9cac2fa788b9654262e450774c588180a18de))
* added padding between image and wrapping text ([e45fbf5](https://github.com/privateOmega/html-to-docx/commit/e45fbf553c19071023634b692e3c4b0fab04aedf))
* added positioning fragments ([e6f7e1c](https://github.com/privateOmega/html-to-docx/commit/e6f7e1c3679aa813a2818725548dfb5ebb0d9bd7))
* added required attributes to anchor fragment ([d01c9f9](https://github.com/privateOmega/html-to-docx/commit/d01c9f915a929de201218af127103da627aaa4a1))
* added settings and websettings relation ([34aeedc](https://github.com/privateOmega/html-to-docx/commit/34aeedce6d0dd02822062762f9b077bb146b09b9))
* added settings and websettings to ooxml package ([6c829b5](https://github.com/privateOmega/html-to-docx/commit/6c829b5ec4596ba0b5d41fae9ba2bfd68fdf7230))
* added simple positioning to anchor ([5006cc4](https://github.com/privateOmega/html-to-docx/commit/5006cc47d112360e51d8051f1ebff570e9f12779))
* added table borders ([12864db](https://github.com/privateOmega/html-to-docx/commit/12864db468a08f4aca4d01cb8e8b6635aa09c57d))
* added wrap elements ([c951688](https://github.com/privateOmega/html-to-docx/commit/c95168864c4929e2ab95c5a6a53d0919c76f8a83))
* changed attribute field for picture name ([aef241d](https://github.com/privateOmega/html-to-docx/commit/aef241dc3d3d9adb732c429df9f0c2771b319680))
* changed attribute used for name ([3885233](https://github.com/privateOmega/html-to-docx/commit/3885233bf14f9b7b16d48a2844d3e997e476a8ee))
* changed default namespace of relationship to solve render issue ([56a3554](https://github.com/privateOmega/html-to-docx/commit/56a3554e7b2e9d85cedeece8d20acfebf23666ad))
* changed file extension if octet stream is encountered ([32c5bf1](https://github.com/privateOmega/html-to-docx/commit/32c5bf1b5f7c5f8dc83a51fed142e932c7b008fd))
* changed namespaces to original ecma 376 spec ([51be86e](https://github.com/privateOmega/html-to-docx/commit/51be86ecf0f4a78457840bf2a31579d217568208))
* fix table render issue due to grid width ([636d499](https://github.com/privateOmega/html-to-docx/commit/636d499bcee00195f7b5ca198c60bb3e0f7d2a69))
* fixed abstract numbering id ([9814cb8](https://github.com/privateOmega/html-to-docx/commit/9814cb89582bc7e87cec638be37ee1cd326c6117))
* fixed coloring and refactored other text formatting ([c288f80](https://github.com/privateOmega/html-to-docx/commit/c288f809ea6387c91356976a6dd81396cecafc46))
* fixed document rels and numbering bug ([d6e3152](https://github.com/privateOmega/html-to-docx/commit/d6e3152081da7d2ab379a67bfda345964fa15c40))
* fixed docx generation ([3d96acf](https://github.com/privateOmega/html-to-docx/commit/3d96acf511d82776510fac857af57d5cb9453f89))
* fixed incorrect table row generation ([742dd18](https://github.com/privateOmega/html-to-docx/commit/742dd1882ce4c1a33ab51e10ee2a628b817eca31))
* fixed internal mode and added extensions ([1266121](https://github.com/privateOmega/html-to-docx/commit/12661213e00c55f7068e93abb019ba80cd4f2d87))
* fixed margin issues ([f841b76](https://github.com/privateOmega/html-to-docx/commit/f841b76caa944ea5eec206a3b3fce3e5a5eaf3e7))
* fixed numbering and header issue due to wrong filename ([64a04bc](https://github.com/privateOmega/html-to-docx/commit/64a04bc192616162aa67c43f80734e7ebb9ff588))
* fixed table and image rendering ([c153092](https://github.com/privateOmega/html-to-docx/commit/c1530924f93351ce63882bf0e6050b6315aa6017))
* handled figure wrapper for images and tables ([4182a95](https://github.com/privateOmega/html-to-docx/commit/4182a9543aeb71fd8b0d2c7a2e08978a782de3e6))
* handled table width ([237ddfd](https://github.com/privateOmega/html-to-docx/commit/237ddfd6bff914e0379c6cbd940a7eac29d7aeaf))
* handling multiple span children and multilevel formatting of text ([4c81f58](https://github.com/privateOmega/html-to-docx/commit/4c81f586400d1f227236a8b07d067331c0f02c5d))
* modified example to use esm bundle ([491a83d](https://github.com/privateOmega/html-to-docx/commit/491a83d9b2c0deec13743817cdf32280d39bb9cd))
* moved namespaces into separate file ([75cdf30](https://github.com/privateOmega/html-to-docx/commit/75cdf3033e69934b189a74d6c77eef08d50492aa))
* namespace updated to 2016 standards ([6fc2ac2](https://github.com/privateOmega/html-to-docx/commit/6fc2ac2b6e904c4dd774b24e0ad119cccd873e0b))
* **template:** fixed document templating ([5f6a74f](https://github.com/privateOmega/html-to-docx/commit/5f6a74f9964348590fbb7f5baf88230c8c796766))
* **template:** fixed numbering templating ([8b09691](https://github.com/privateOmega/html-to-docx/commit/8b096916284cbbe8452bb572d788caee23849084))
* **template:** removed word xml schema ([ee0e1ed](https://github.com/privateOmega/html-to-docx/commit/ee0e1ed7b0b00cbaf3644ad887175abac0282dcc))
* removed unwanted attribute ([f3caf44](https://github.com/privateOmega/html-to-docx/commit/f3caf44faf95ba8c6dee1f6f959300374e2b65ff))
* renamed document rels schema file ([10c3fda](https://github.com/privateOmega/html-to-docx/commit/10c3fda9878847257b902d4c13c2d8dd36edd3f6))
* updated document abstraction to track generation ids ([c34810f](https://github.com/privateOmega/html-to-docx/commit/c34810f1373f934b0b3ecbe9da2838f41a68dcc9))
* updated documentrels xml generation ([433e4b4](https://github.com/privateOmega/html-to-docx/commit/433e4b4eb9d71beede8feb1754363163ba5d1933))
* updated numbering xml generation ([81b7a82](https://github.com/privateOmega/html-to-docx/commit/81b7a8296d1e3afa095f47007a66698852d29f95))
* updated xml builder to use namespace and child nodes ([2e28b5e](https://github.com/privateOmega/html-to-docx/commit/2e28b5ec07241c10c4288412a6ced8023e8c03ce))
* wrapped drawing inside paragraph tag ([d0476b4](https://github.com/privateOmega/html-to-docx/commit/d0476b4211fe13f5918091a6a06e5021015a5db8))

### [1.1.1](https://github.com/privateOmega/html-to-docx/compare/v1.1.0...v1.1.1) (2020-05-28)


### Bug Fixes

* modified example to use esm bundle ([dcd7f4b](https://github.com/privateOmega/html-to-docx/commit/dcd7f4b7705b806697dfe92f060641030ee42cfa))

## 1.1.0 (2020-05-28)


### Features

* **packaging:** added jszip for packaging ([89619ec](https://github.com/privateOmega/html-to-docx/commit/89619ec702564fb9c5eccaee55e65d366fcbacad))
* **packaging:** added method to create container ([9808cf2](https://github.com/privateOmega/html-to-docx/commit/9808cf211bbb50cf3d7cbe122d01c82d4272e888))
* **template:** added base docx template ([abdb87b](https://github.com/privateOmega/html-to-docx/commit/abdb87bdfead91890f9d54e2cedd038e916b6dce))
* **template:** added numbering schema ([d179d73](https://github.com/privateOmega/html-to-docx/commit/d179d736e6e63ed42104a231ca0489430faae00a))
* **template:** added styles schema ([d83d230](https://github.com/privateOmega/html-to-docx/commit/d83d230a66807f6ad08ebb4a6c0c5299c311aaf5))
* abstracted conversion using docxDocument class ([c625a01](https://github.com/privateOmega/html-to-docx/commit/c625a0181a6c328c0319b579fa1173192dff1187))
* added builder methods for images ([9e2720f](https://github.com/privateOmega/html-to-docx/commit/9e2720f261a46701c8a2581aadafa9b60e6cee6b))
* added document file render helper ([6dd9c3a](https://github.com/privateOmega/html-to-docx/commit/6dd9c3a01f5fceab78404d8ebddb848fb91c933c))
* added escape-html ([1a231d5](https://github.com/privateOmega/html-to-docx/commit/1a231d5dde3e6f9b5a23f248e19063191c07e54f))
* added header generation ([25fb44f](https://github.com/privateOmega/html-to-docx/commit/25fb44f945df3fdc5f37d619b3de3ebe68b84cd6))
* added hyperlinks support ([3560ce9](https://github.com/privateOmega/html-to-docx/commit/3560ce9f23fa8f590aa340302bf0059c8dfb6d5f))
* added method to archive images with other files ([b6da74b](https://github.com/privateOmega/html-to-docx/commit/b6da74be10be03d689ca044f3f95dd724a3a29b6))
* added more xml builder methods ([ffc584b](https://github.com/privateOmega/html-to-docx/commit/ffc584bed7ab434431999517a3308483ba99489a))
* added more xml statment builder methods ([337e530](https://github.com/privateOmega/html-to-docx/commit/337e5305aa8768b6507323bec2279d557a35b67b))
* added text formatting to paragraph ([bacd888](https://github.com/privateOmega/html-to-docx/commit/bacd888253a35a18ac7ea4e9141d4a4fb60e3cf7))
* added vdom to xml method ([8b5a618](https://github.com/privateOmega/html-to-docx/commit/8b5a6185e6e211b0e07b9f1c1b7e23fb4b13dc9c))
* added virtual-dom and html-to-vdom ([feaa396](https://github.com/privateOmega/html-to-docx/commit/feaa396162465276d19b7d3d5c51a533987a1738))
* added xbuilder ([f13b5cc](https://github.com/privateOmega/html-to-docx/commit/f13b5cc06d29ae53493f1f4b8fdef6e8986e64e6))
* added xml builder methods for images ([f413ad8](https://github.com/privateOmega/html-to-docx/commit/f413ad89b263c63a8fb9890b44b1b219a7413c4b))
* added xml statement builder helper ([5e23c16](https://github.com/privateOmega/html-to-docx/commit/5e23c1636eb3c64f52589f1ac71a48dec3df65c2))
* handle line breaks ([164c0f5](https://github.com/privateOmega/html-to-docx/commit/164c0f5e17f62e3f30da25be6e181d3414ca4dde))
* **template:** added XML schemas ([42232da](https://github.com/privateOmega/html-to-docx/commit/42232da9d63ed404367703e56b1c65cdb8a23782))


### Bug Fixes

* added attributes to anchor drawing ([62e4a29](https://github.com/privateOmega/html-to-docx/commit/62e4a29ef664257d8f0364d5d97f056a62f0fb61))
* added effectextent and srcrect fragment ([5f5e975](https://github.com/privateOmega/html-to-docx/commit/5f5e975b135eb38c48e18a09da590b363166d74e))
* added extent fragment ([7ce81f2](https://github.com/privateOmega/html-to-docx/commit/7ce81f27e4c493bb9bf7d368a415f34cb0678e4c))
* added header override in content-types xml ([5de681b](https://github.com/privateOmega/html-to-docx/commit/5de681be9295754eff648cea504e07bf9a6f6d09))
* added image conversion handler ([f726e71](https://github.com/privateOmega/html-to-docx/commit/f726e71ee2504bc254794ad09eaf5d67a8901b9a))
* added inline attributes ([0a4d2ce](https://github.com/privateOmega/html-to-docx/commit/0a4d2ce4b4c64952c3866928e6355b7c891ac044))
* added italics, underline and bold in runproperties ([34c2e18](https://github.com/privateOmega/html-to-docx/commit/34c2e18123c8a6a956209951afebc0dce2ab6cfc))
* added more namespaces ([68636b4](https://github.com/privateOmega/html-to-docx/commit/68636b4c7cc73bf9e0de75b7bf97ac9afb4fb6f9))
* added namespace aliases to header and numbering xmls ([d0b4101](https://github.com/privateOmega/html-to-docx/commit/d0b4101017a6dabd0fa18e23228bd4af338129eb))
* added numbering and styles relationship ([c7e29af](https://github.com/privateOmega/html-to-docx/commit/c7e29af7414ce71515c46861942342d4f397222b))
* added other namespaces to the xml root ([afbbca9](https://github.com/privateOmega/html-to-docx/commit/afbbca9dbf723afc857034ce7770bc8f0840c0e4))
* added override for relationship ([30acddc](https://github.com/privateOmega/html-to-docx/commit/30acddc84d40dc6c66ed9539618b94adeeb2fc85))
* added override for settings and websettings ([977af04](https://github.com/privateOmega/html-to-docx/commit/977af04f48c19f2b3162cf6e61782cf63e7162e8))
* added overrides for relationships ([22b9cac](https://github.com/privateOmega/html-to-docx/commit/22b9cac2fa788b9654262e450774c588180a18de))
* added padding between image and wrapping text ([e45fbf5](https://github.com/privateOmega/html-to-docx/commit/e45fbf553c19071023634b692e3c4b0fab04aedf))
* added positioning fragments ([e6f7e1c](https://github.com/privateOmega/html-to-docx/commit/e6f7e1c3679aa813a2818725548dfb5ebb0d9bd7))
* added required attributes to anchor fragment ([d01c9f9](https://github.com/privateOmega/html-to-docx/commit/d01c9f915a929de201218af127103da627aaa4a1))
* added settings and websettings relation ([34aeedc](https://github.com/privateOmega/html-to-docx/commit/34aeedce6d0dd02822062762f9b077bb146b09b9))
* added settings and websettings to ooxml package ([6c829b5](https://github.com/privateOmega/html-to-docx/commit/6c829b5ec4596ba0b5d41fae9ba2bfd68fdf7230))
* added simple positioning to anchor ([5006cc4](https://github.com/privateOmega/html-to-docx/commit/5006cc47d112360e51d8051f1ebff570e9f12779))
* added table borders ([12864db](https://github.com/privateOmega/html-to-docx/commit/12864db468a08f4aca4d01cb8e8b6635aa09c57d))
* added wrap elements ([c951688](https://github.com/privateOmega/html-to-docx/commit/c95168864c4929e2ab95c5a6a53d0919c76f8a83))
* changed attribute field for picture name ([aef241d](https://github.com/privateOmega/html-to-docx/commit/aef241dc3d3d9adb732c429df9f0c2771b319680))
* changed attribute used for name ([3885233](https://github.com/privateOmega/html-to-docx/commit/3885233bf14f9b7b16d48a2844d3e997e476a8ee))
* changed default namespace of relationship to solve render issue ([56a3554](https://github.com/privateOmega/html-to-docx/commit/56a3554e7b2e9d85cedeece8d20acfebf23666ad))
* changed file extension if octet stream is encountered ([32c5bf1](https://github.com/privateOmega/html-to-docx/commit/32c5bf1b5f7c5f8dc83a51fed142e932c7b008fd))
* changed namespaces to original ecma 376 spec ([51be86e](https://github.com/privateOmega/html-to-docx/commit/51be86ecf0f4a78457840bf2a31579d217568208))
* fix table render issue due to grid width ([636d499](https://github.com/privateOmega/html-to-docx/commit/636d499bcee00195f7b5ca198c60bb3e0f7d2a69))
* fixed abstract numbering id ([9814cb8](https://github.com/privateOmega/html-to-docx/commit/9814cb89582bc7e87cec638be37ee1cd326c6117))
* fixed coloring and refactored other text formatting ([c288f80](https://github.com/privateOmega/html-to-docx/commit/c288f809ea6387c91356976a6dd81396cecafc46))
* fixed document rels and numbering bug ([d6e3152](https://github.com/privateOmega/html-to-docx/commit/d6e3152081da7d2ab379a67bfda345964fa15c40))
* fixed docx generation ([3d96acf](https://github.com/privateOmega/html-to-docx/commit/3d96acf511d82776510fac857af57d5cb9453f89))
* fixed incorrect table row generation ([742dd18](https://github.com/privateOmega/html-to-docx/commit/742dd1882ce4c1a33ab51e10ee2a628b817eca31))
* fixed internal mode and added extensions ([1266121](https://github.com/privateOmega/html-to-docx/commit/12661213e00c55f7068e93abb019ba80cd4f2d87))
* fixed margin issues ([f841b76](https://github.com/privateOmega/html-to-docx/commit/f841b76caa944ea5eec206a3b3fce3e5a5eaf3e7))
* fixed numbering and header issue due to wrong filename ([64a04bc](https://github.com/privateOmega/html-to-docx/commit/64a04bc192616162aa67c43f80734e7ebb9ff588))
* fixed table and image rendering ([c153092](https://github.com/privateOmega/html-to-docx/commit/c1530924f93351ce63882bf0e6050b6315aa6017))
* handled figure wrapper for images and tables ([4182a95](https://github.com/privateOmega/html-to-docx/commit/4182a9543aeb71fd8b0d2c7a2e08978a782de3e6))
* handled table width ([237ddfd](https://github.com/privateOmega/html-to-docx/commit/237ddfd6bff914e0379c6cbd940a7eac29d7aeaf))
* handling multiple span children and multilevel formatting of text ([4c81f58](https://github.com/privateOmega/html-to-docx/commit/4c81f586400d1f227236a8b07d067331c0f02c5d))
* moved namespaces into separate file ([75cdf30](https://github.com/privateOmega/html-to-docx/commit/75cdf3033e69934b189a74d6c77eef08d50492aa))
* namespace updated to 2016 standards ([6fc2ac2](https://github.com/privateOmega/html-to-docx/commit/6fc2ac2b6e904c4dd774b24e0ad119cccd873e0b))
* removed unwanted attribute ([f3caf44](https://github.com/privateOmega/html-to-docx/commit/f3caf44faf95ba8c6dee1f6f959300374e2b65ff))
* renamed document rels schema file ([10c3fda](https://github.com/privateOmega/html-to-docx/commit/10c3fda9878847257b902d4c13c2d8dd36edd3f6))
* updated document abstraction to track generation ids ([c34810f](https://github.com/privateOmega/html-to-docx/commit/c34810f1373f934b0b3ecbe9da2838f41a68dcc9))
* **template:** fixed document templating ([5f6a74f](https://github.com/privateOmega/html-to-docx/commit/5f6a74f9964348590fbb7f5baf88230c8c796766))
* **template:** fixed numbering templating ([8b09691](https://github.com/privateOmega/html-to-docx/commit/8b096916284cbbe8452bb572d788caee23849084))
* updated documentrels xml generation ([433e4b4](https://github.com/privateOmega/html-to-docx/commit/433e4b4eb9d71beede8feb1754363163ba5d1933))
* updated numbering xml generation ([81b7a82](https://github.com/privateOmega/html-to-docx/commit/81b7a8296d1e3afa095f47007a66698852d29f95))
* updated xml builder to use namespace and child nodes ([2e28b5e](https://github.com/privateOmega/html-to-docx/commit/2e28b5ec07241c10c4288412a6ced8023e8c03ce))
* wrapped drawing inside paragraph tag ([d0476b4](https://github.com/privateOmega/html-to-docx/commit/d0476b4211fe13f5918091a6a06e5021015a5db8))
* **template:** removed word xml schema ([ee0e1ed](https://github.com/privateOmega/html-to-docx/commit/ee0e1ed7b0b00cbaf3644ad887175abac0282dcc))
