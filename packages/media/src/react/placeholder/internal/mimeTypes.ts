const mimes = {
  'application/andrew-inset': {
    extensions: ['ez'],
    source: 'iana',
  },
  'application/applixware': {
    extensions: ['aw'],
    source: 'apache',
  },
  'application/atom+xml': {
    extensions: ['atom'],
    source: 'iana',
  },
  'application/atomcat+xml': {
    extensions: ['atomcat'],
    source: 'iana',
  },
  'application/atomdeleted+xml': {
    extensions: ['atomdeleted'],
    source: 'iana',
  },
  'application/atomsvc+xml': {
    extensions: ['atomsvc'],
    source: 'iana',
  },
  'application/atsc-dwd+xml': {
    extensions: ['dwd'],
    source: 'iana',
  },
  'application/atsc-held+xml': {
    extensions: ['held'],
    source: 'iana',
  },
  'application/atsc-rsat+xml': {
    extensions: ['rsat'],
    source: 'iana',
  },
  'application/calendar+xml': {
    extensions: ['xcs'],
    source: 'iana',
  },
  'application/ccxml+xml': {
    extensions: ['ccxml'],
    source: 'iana',
  },
  'application/cdfx+xml': {
    extensions: ['cdfx'],
    source: 'iana',
  },
  'application/cdmi-capability': {
    extensions: ['cdmia'],
    source: 'iana',
  },
  'application/cdmi-container': {
    extensions: ['cdmic'],
    source: 'iana',
  },
  'application/cdmi-domain': {
    extensions: ['cdmid'],
    source: 'iana',
  },
  'application/cdmi-object': {
    extensions: ['cdmio'],
    source: 'iana',
  },
  'application/cdmi-queue': {
    extensions: ['cdmiq'],
    source: 'iana',
  },
  'application/cpl+xml': {
    extensions: ['cpl'],
    source: 'iana',
  },
  'application/cu-seeme': {
    extensions: ['cu'],
    source: 'apache',
  },
  'application/dash+xml': {
    extensions: ['mpd'],
    source: 'iana',
  },
  'application/dash-patch+xml': {
    extensions: ['mpp'],
    source: 'iana',
  },
  'application/davmount+xml': {
    extensions: ['davmount'],
    source: 'iana',
  },
  'application/dicom': {
    extensions: ['dcm'],
    source: 'iana',
  },
  'application/docbook+xml': {
    extensions: ['dbk'],
    source: 'apache',
  },
  'application/dssc+der': {
    extensions: ['dssc'],
    source: 'iana',
  },
  'application/dssc+xml': {
    extensions: ['xdssc'],
    source: 'iana',
  },
  'application/ecmascript': {
    extensions: ['es', 'ecma'],
    source: 'iana',
  },
  'application/emma+xml': {
    extensions: ['emma'],
    source: 'iana',
  },
  'application/emotionml+xml': {
    extensions: ['emotionml'],
    source: 'iana',
  },
  'application/epub+zip': {
    extensions: ['epub'],
    source: 'iana',
  },
  'application/exi': {
    extensions: ['exi'],
    source: 'iana',
  },
  'application/express': {
    extensions: ['exp'],
    source: 'iana',
  },
  'application/fdt+xml': {
    extensions: ['fdt'],
    source: 'iana',
  },
  'application/font-tdpfr': {
    extensions: ['pfr'],
    source: 'iana',
  },
  'application/geo+json': {
    extensions: ['geojson'],
    source: 'iana',
  },
  'application/gml+xml': {
    extensions: ['gml'],
    source: 'iana',
  },
  'application/gpx+xml': {
    extensions: ['gpx'],
    source: 'apache',
  },
  'application/gxf': {
    extensions: ['gxf'],
    source: 'apache',
  },
  'application/gzip': {
    extensions: ['gz'],
    source: 'iana',
  },
  'application/hyperstudio': {
    extensions: ['stk'],
    source: 'iana',
  },
  'application/inkml+xml': {
    extensions: ['ink', 'inkml'],
    source: 'iana',
  },
  'application/ipfix': {
    extensions: ['ipfix'],
    source: 'iana',
  },
  'application/its+xml': {
    extensions: ['its'],
    source: 'iana',
  },
  'application/java-archive': {
    extensions: ['jar', 'war', 'ear'],
    source: 'apache',
  },
  'application/java-serialized-object': {
    extensions: ['ser'],
    source: 'apache',
  },
  'application/java-vm': {
    extensions: ['class'],
    source: 'apache',
  },
  'application/javascript': {
    charset: 'UTF-8',
    extensions: ['js', 'mjs'],
    source: 'iana',
  },
  'application/json': {
    charset: 'UTF-8',
    extensions: ['json', 'map'],
    source: 'iana',
  },
  'application/jsonml+json': {
    extensions: ['jsonml'],
    source: 'apache',
  },
  'application/ld+json': {
    extensions: ['jsonld'],
    source: 'iana',
  },
  'application/lgr+xml': {
    extensions: ['lgr'],
    source: 'iana',
  },
  'application/lost+xml': {
    extensions: ['lostxml'],
    source: 'iana',
  },
  'application/mac-binhex40': {
    extensions: ['hqx'],
    source: 'iana',
  },
  'application/mac-compactpro': {
    extensions: ['cpt'],
    source: 'apache',
  },
  'application/mads+xml': {
    extensions: ['mads'],
    source: 'iana',
  },
  'application/manifest+json': {
    charset: 'UTF-8',
    extensions: ['webmanifest'],
    source: 'iana',
  },
  'application/marc': {
    extensions: ['mrc'],
    source: 'iana',
  },
  'application/marcxml+xml': {
    extensions: ['mrcx'],
    source: 'iana',
  },
  'application/mathematica': {
    extensions: ['ma', 'nb', 'mb'],
    source: 'iana',
  },
  'application/mathml+xml': {
    extensions: ['mathml'],
    source: 'iana',
  },
  'application/mbox': {
    extensions: ['mbox'],
    source: 'iana',
  },
  'application/media-policy-dataset+xml': {
    extensions: ['mpf'],
    source: 'iana',
  },
  'application/mediaservercontrol+xml': {
    extensions: ['mscml'],
    source: 'iana',
  },
  'application/metalink4+xml': {
    extensions: ['meta4'],
    source: 'iana',
  },
  'application/metalink+xml': {
    extensions: ['metalink'],
    source: 'apache',
  },
  'application/mets+xml': {
    extensions: ['mets'],
    source: 'iana',
  },
  'application/mmt-aei+xml': {
    extensions: ['maei'],
    source: 'iana',
  },
  'application/mmt-usd+xml': {
    extensions: ['musd'],
    source: 'iana',
  },
  'application/mods+xml': {
    extensions: ['mods'],
    source: 'iana',
  },
  'application/mp4': {
    extensions: ['mp4s', 'm4p'],
    source: 'iana',
  },
  'application/mp21': {
    extensions: ['m21', 'mp21'],
    source: 'iana',
  },
  'application/msword': {
    extensions: ['doc', 'dot'],
    source: 'iana',
  },
  'application/mxf': {
    extensions: ['mxf'],
    source: 'iana',
  },
  'application/n-quads': {
    extensions: ['nq'],
    source: 'iana',
  },
  'application/n-triples': {
    extensions: ['nt'],
    source: 'iana',
  },
  'application/node': {
    extensions: ['cjs'],
    source: 'iana',
  },
  'application/octet-stream': {
    extensions: [
      'bin',
      'dms',
      'lrf',
      'mar',
      'so',
      'dist',
      'distz',
      'pkg',
      'bpk',
      'dump',
      'elc',
      'deploy',
      'exe',
      'dll',
      'deb',
      'dmg',
      'iso',
      'img',
      'msi',
      'msp',
      'msm',
      'buffer',
    ],
    source: 'iana',
  },
  'application/oda': {
    extensions: ['oda'],
    source: 'iana',
  },
  'application/oebps-package+xml': {
    extensions: ['opf'],
    source: 'iana',
  },
  'application/ogg': {
    extensions: ['ogx'],
    source: 'iana',
  },
  'application/omdoc+xml': {
    extensions: ['omdoc'],
    source: 'apache',
  },
  'application/onenote': {
    extensions: ['onetoc', 'onetoc2', 'onetmp', 'onepkg'],
    source: 'apache',
  },
  'application/oxps': {
    extensions: ['oxps'],
    source: 'iana',
  },
  'application/p2p-overlay+xml': {
    extensions: ['relo'],
    source: 'iana',
  },
  'application/patch-ops-error+xml': {
    extensions: ['xer'],
    source: 'iana',
  },
  'application/pdf': {
    extensions: ['pdf'],
    source: 'iana',
  },
  'application/pgp-encrypted': {
    extensions: ['pgp'],
    source: 'iana',
  },
  'application/pgp-keys': {
    extensions: ['asc'],
    source: 'iana',
  },
  'application/pgp-signature': {
    extensions: ['asc', 'sig'],
    source: 'iana',
  },
  'application/pics-rules': {
    extensions: ['prf'],
    source: 'apache',
  },
  'application/pkcs7-mime': {
    extensions: ['p7m', 'p7c'],
    source: 'iana',
  },
  'application/pkcs7-signature': {
    extensions: ['p7s'],
    source: 'iana',
  },
  'application/pkcs8': {
    extensions: ['p8'],
    source: 'iana',
  },
  'application/pkcs10': {
    extensions: ['p10'],
    source: 'iana',
  },
  'application/pkix-attr-cert': {
    extensions: ['ac'],
    source: 'iana',
  },
  'application/pkix-cert': {
    extensions: ['cer'],
    source: 'iana',
  },
  'application/pkix-crl': {
    extensions: ['crl'],
    source: 'iana',
  },
  'application/pkix-pkipath': {
    extensions: ['pkipath'],
    source: 'iana',
  },
  'application/pkixcmp': {
    extensions: ['pki'],
    source: 'iana',
  },
  'application/pls+xml': {
    extensions: ['pls'],
    source: 'iana',
  },
  'application/postscript': {
    extensions: ['ai', 'eps', 'ps'],
    source: 'iana',
  },
  'application/provenance+xml': {
    extensions: ['provx'],
    source: 'iana',
  },
  'application/prs.cww': {
    extensions: ['cww'],
    source: 'iana',
  },
  'application/pskc+xml': {
    extensions: ['pskcxml'],
    source: 'iana',
  },
  'application/rdf+xml': {
    extensions: ['rdf', 'owl'],
    source: 'iana',
  },
  'application/reginfo+xml': {
    extensions: ['rif'],
    source: 'iana',
  },
  'application/relax-ng-compact-syntax': {
    extensions: ['rnc'],
    source: 'iana',
  },
  'application/resource-lists+xml': {
    extensions: ['rl'],
    source: 'iana',
  },
  'application/resource-lists-diff+xml': {
    extensions: ['rld'],
    source: 'iana',
  },
  'application/rls-services+xml': {
    extensions: ['rs'],
    source: 'iana',
  },
  'application/route-apd+xml': {
    extensions: ['rapd'],
    source: 'iana',
  },
  'application/route-s-tsid+xml': {
    extensions: ['sls'],
    source: 'iana',
  },
  'application/route-usd+xml': {
    extensions: ['rusd'],
    source: 'iana',
  },
  'application/rpki-ghostbusters': {
    extensions: ['gbr'],
    source: 'iana',
  },
  'application/rpki-manifest': {
    extensions: ['mft'],
    source: 'iana',
  },
  'application/rpki-roa': {
    extensions: ['roa'],
    source: 'iana',
  },
  'application/rsd+xml': {
    extensions: ['rsd'],
    source: 'apache',
  },
  'application/rss+xml': {
    extensions: ['rss'],
    source: 'apache',
  },
  'application/rtf': {
    extensions: ['rtf'],
    source: 'iana',
  },
  'application/sbml+xml': {
    extensions: ['sbml'],
    source: 'iana',
  },
  'application/scvp-cv-request': {
    extensions: ['scq'],
    source: 'iana',
  },
  'application/scvp-cv-response': {
    extensions: ['scs'],
    source: 'iana',
  },
  'application/scvp-vp-request': {
    extensions: ['spq'],
    source: 'iana',
  },
  'application/scvp-vp-response': {
    extensions: ['spp'],
    source: 'iana',
  },
  'application/sdp': {
    extensions: ['sdp'],
    source: 'iana',
  },
  'application/senml+xml': {
    extensions: ['senmlx'],
    source: 'iana',
  },
  'application/sensml+xml': {
    extensions: ['sensmlx'],
    source: 'iana',
  },
  'application/set-payment-initiation': {
    extensions: ['setpay'],
    source: 'iana',
  },
  'application/set-registration-initiation': {
    extensions: ['setreg'],
    source: 'iana',
  },
  'application/shf+xml': {
    extensions: ['shf'],
    source: 'iana',
  },
  'application/sieve': {
    extensions: ['siv', 'sieve'],
    source: 'iana',
  },
  'application/smil+xml': {
    extensions: ['smi', 'smil'],
    source: 'iana',
  },
  'application/sparql-query': {
    extensions: ['rq'],
    source: 'iana',
  },
  'application/sparql-results+xml': {
    extensions: ['srx'],
    source: 'iana',
  },
  'application/srgs': {
    extensions: ['gram'],
    source: 'iana',
  },
  'application/srgs+xml': {
    extensions: ['grxml'],
    source: 'iana',
  },
  'application/sru+xml': {
    extensions: ['sru'],
    source: 'iana',
  },
  'application/ssdl+xml': {
    extensions: ['ssdl'],
    source: 'apache',
  },
  'application/ssml+xml': {
    extensions: ['ssml'],
    source: 'iana',
  },
  'application/swid+xml': {
    extensions: ['swidtag'],
    source: 'iana',
  },
  'application/tei+xml': {
    extensions: ['tei', 'teicorpus'],
    source: 'iana',
  },
  'application/thraud+xml': {
    extensions: ['tfi'],
    source: 'iana',
  },
  'application/timestamped-data': {
    extensions: ['tsd'],
    source: 'iana',
  },
  'application/trig': {
    extensions: ['trig'],
    source: 'iana',
  },
  'application/ttml+xml': {
    extensions: ['ttml'],
    source: 'iana',
  },
  'application/urc-ressheet+xml': {
    extensions: ['rsheet'],
    source: 'iana',
  },
  'application/urc-targetdesc+xml': {
    extensions: ['td'],
    source: 'iana',
  },
  'application/vnd.3gpp2.tcap': {
    extensions: ['tcap'],
    source: 'iana',
  },
  'application/vnd.3gpp.pic-bw-large': {
    extensions: ['plb'],
    source: 'iana',
  },
  'application/vnd.3gpp.pic-bw-small': {
    extensions: ['psb'],
    source: 'iana',
  },
  'application/vnd.3gpp.pic-bw-var': {
    extensions: ['pvb'],
    source: 'iana',
  },
  'application/vnd.3m.post-it-notes': {
    extensions: ['pwn'],
    source: 'iana',
  },
  'application/vnd.1000minds.decision-model+xml': {
    extensions: ['1km'],
    source: 'iana',
  },
  'application/vnd.accpac.simply.aso': {
    extensions: ['aso'],
    source: 'iana',
  },
  'application/vnd.accpac.simply.imp': {
    extensions: ['imp'],
    source: 'iana',
  },
  'application/vnd.acucobol': {
    extensions: ['acu'],
    source: 'iana',
  },
  'application/vnd.acucorp': {
    extensions: ['atc', 'acutc'],
    source: 'iana',
  },
  'application/vnd.adobe.air-application-installer-package+zip': {
    extensions: ['air'],
    source: 'apache',
  },
  'application/vnd.adobe.formscentral.fcdt': {
    extensions: ['fcdt'],
    source: 'iana',
  },
  'application/vnd.adobe.fxp': {
    extensions: ['fxp', 'fxpl'],
    source: 'iana',
  },
  'application/vnd.adobe.xdp+xml': {
    extensions: ['xdp'],
    source: 'iana',
  },
  'application/vnd.adobe.xfdf': {
    extensions: ['xfdf'],
    source: 'iana',
  },
  'application/vnd.age': {
    extensions: ['age'],
    source: 'iana',
  },
  'application/vnd.ahead.space': {
    extensions: ['ahead'],
    source: 'iana',
  },
  'application/vnd.airzip.filesecure.azf': {
    extensions: ['azf'],
    source: 'iana',
  },
  'application/vnd.airzip.filesecure.azs': {
    extensions: ['azs'],
    source: 'iana',
  },
  'application/vnd.amazon.ebook': {
    extensions: ['azw'],
    source: 'apache',
  },
  'application/vnd.americandynamics.acc': {
    extensions: ['acc'],
    source: 'iana',
  },
  'application/vnd.amiga.ami': {
    extensions: ['ami'],
    source: 'iana',
  },
  'application/vnd.android.package-archive': {
    extensions: ['apk'],
    source: 'apache',
  },
  'application/vnd.anser-web-certificate-issue-initiation': {
    extensions: ['cii'],
    source: 'iana',
  },
  'application/vnd.anser-web-funds-transfer-initiation': {
    extensions: ['fti'],
    source: 'apache',
  },
  'application/vnd.antix.game-component': {
    extensions: ['atx'],
    source: 'iana',
  },
  'application/vnd.apple.installer+xml': {
    extensions: ['mpkg'],
    source: 'iana',
  },
  'application/vnd.apple.keynote': {
    extensions: ['key'],
    source: 'iana',
  },
  'application/vnd.apple.mpegurl': {
    extensions: ['m3u8'],
    source: 'iana',
  },
  'application/vnd.apple.numbers': {
    extensions: ['numbers'],
    source: 'iana',
  },
  'application/vnd.apple.pages': {
    extensions: ['pages'],
    source: 'iana',
  },
  'application/vnd.aristanetworks.swi': {
    extensions: ['swi'],
    source: 'iana',
  },
  'application/vnd.astraea-software.iota': {
    extensions: ['iota'],
    source: 'iana',
  },
  'application/vnd.audiograph': {
    extensions: ['aep'],
    source: 'iana',
  },
  'application/vnd.balsamiq.bmml+xml': {
    extensions: ['bmml'],
    source: 'iana',
  },
  'application/vnd.blueice.multipass': {
    extensions: ['mpm'],
    source: 'iana',
  },
  'application/vnd.bmi': {
    extensions: ['bmi'],
    source: 'iana',
  },
  'application/vnd.businessobjects': {
    extensions: ['rep'],
    source: 'iana',
  },
  'application/vnd.chemdraw+xml': {
    extensions: ['cdxml'],
    source: 'iana',
  },
  'application/vnd.chipnuts.karaoke-mmd': {
    extensions: ['mmd'],
    source: 'iana',
  },
  'application/vnd.cinderella': {
    extensions: ['cdy'],
    source: 'iana',
  },
  'application/vnd.citationstyles.style+xml': {
    extensions: ['csl'],
    source: 'iana',
  },
  'application/vnd.claymore': {
    extensions: ['cla'],
    source: 'iana',
  },
  'application/vnd.cloanto.rp9': {
    extensions: ['rp9'],
    source: 'iana',
  },
  'application/vnd.clonk.c4group': {
    extensions: ['c4g', 'c4d', 'c4f', 'c4p', 'c4u'],
    source: 'iana',
  },
  'application/vnd.cluetrust.cartomobile-config': {
    extensions: ['c11amc'],
    source: 'iana',
  },
  'application/vnd.cluetrust.cartomobile-config-pkg': {
    extensions: ['c11amz'],
    source: 'iana',
  },
  'application/vnd.commonspace': {
    extensions: ['csp'],
    source: 'iana',
  },
  'application/vnd.contact.cmsg': {
    extensions: ['cdbcmsg'],
    source: 'iana',
  },
  'application/vnd.cosmocaller': {
    extensions: ['cmc'],
    source: 'iana',
  },
  'application/vnd.crick.clicker': {
    extensions: ['clkx'],
    source: 'iana',
  },
  'application/vnd.crick.clicker.keyboard': {
    extensions: ['clkk'],
    source: 'iana',
  },
  'application/vnd.crick.clicker.palette': {
    extensions: ['clkp'],
    source: 'iana',
  },
  'application/vnd.crick.clicker.template': {
    extensions: ['clkt'],
    source: 'iana',
  },
  'application/vnd.crick.clicker.wordbank': {
    extensions: ['clkw'],
    source: 'iana',
  },
  'application/vnd.criticaltools.wbs+xml': {
    extensions: ['wbs'],
    source: 'iana',
  },
  'application/vnd.ctc-posml': {
    extensions: ['pml'],
    source: 'iana',
  },
  'application/vnd.cups-ppd': {
    extensions: ['ppd'],
    source: 'iana',
  },
  'application/vnd.curl.car': {
    extensions: ['car'],
    source: 'apache',
  },
  'application/vnd.curl.pcurl': {
    extensions: ['pcurl'],
    source: 'apache',
  },
  'application/vnd.dart': {
    extensions: ['dart'],
    source: 'iana',
  },
  'application/vnd.data-vision.rdz': {
    extensions: ['rdz'],
    source: 'iana',
  },
  'application/vnd.dbf': {
    extensions: ['dbf'],
    source: 'iana',
  },
  'application/vnd.dece.data': {
    extensions: ['uvf', 'uvvf', 'uvd', 'uvvd'],
    source: 'iana',
  },
  'application/vnd.dece.ttml+xml': {
    extensions: ['uvt', 'uvvt'],
    source: 'iana',
  },
  'application/vnd.dece.unspecified': {
    extensions: ['uvx', 'uvvx'],
    source: 'iana',
  },
  'application/vnd.dece.zip': {
    extensions: ['uvz', 'uvvz'],
    source: 'iana',
  },
  'application/vnd.denovo.fcselayout-link': {
    extensions: ['fe_launch'],
    source: 'iana',
  },
  'application/vnd.dna': {
    extensions: ['dna'],
    source: 'iana',
  },
  'application/vnd.dolby.mlp': {
    extensions: ['mlp'],
    source: 'apache',
  },
  'application/vnd.dpgraph': {
    extensions: ['dpg'],
    source: 'iana',
  },
  'application/vnd.dreamfactory': {
    extensions: ['dfac'],
    source: 'iana',
  },
  'application/vnd.ds-keypoint': {
    extensions: ['kpxx'],
    source: 'apache',
  },
  'application/vnd.dvb.ait': {
    extensions: ['ait'],
    source: 'iana',
  },
  'application/vnd.dvb.service': {
    extensions: ['svc'],
    source: 'iana',
  },
  'application/vnd.dynageo': {
    extensions: ['geo'],
    source: 'iana',
  },
  'application/vnd.ecowin.chart': {
    extensions: ['mag'],
    source: 'iana',
  },
  'application/vnd.enliven': {
    extensions: ['nml'],
    source: 'iana',
  },
  'application/vnd.epson.esf': {
    extensions: ['esf'],
    source: 'iana',
  },
  'application/vnd.epson.msf': {
    extensions: ['msf'],
    source: 'iana',
  },
  'application/vnd.epson.quickanime': {
    extensions: ['qam'],
    source: 'iana',
  },
  'application/vnd.epson.salt': {
    extensions: ['slt'],
    source: 'iana',
  },
  'application/vnd.epson.ssf': {
    extensions: ['ssf'],
    source: 'iana',
  },
  'application/vnd.eszigno3+xml': {
    extensions: ['es3', 'et3'],
    source: 'iana',
  },
  'application/vnd.ezpix-album': {
    extensions: ['ez2'],
    source: 'iana',
  },
  'application/vnd.ezpix-package': {
    extensions: ['ez3'],
    source: 'iana',
  },
  'application/vnd.fdf': {
    extensions: ['fdf'],
    source: 'iana',
  },
  'application/vnd.fdsn.mseed': {
    extensions: ['mseed'],
    source: 'iana',
  },
  'application/vnd.fdsn.seed': {
    extensions: ['seed', 'dataless'],
    source: 'iana',
  },
  'application/vnd.flographit': {
    extensions: ['gph'],
    source: 'iana',
  },
  'application/vnd.fluxtime.clip': {
    extensions: ['ftc'],
    source: 'iana',
  },
  'application/vnd.framemaker': {
    extensions: ['fm', 'frame', 'maker', 'book'],
    source: 'iana',
  },
  'application/vnd.frogans.fnc': {
    extensions: ['fnc'],
    source: 'iana',
  },
  'application/vnd.frogans.ltf': {
    extensions: ['ltf'],
    source: 'iana',
  },
  'application/vnd.fsc.weblaunch': {
    extensions: ['fsc'],
    source: 'iana',
  },
  'application/vnd.fujitsu.oasys': {
    extensions: ['oas'],
    source: 'iana',
  },
  'application/vnd.fujitsu.oasys2': {
    extensions: ['oa2'],
    source: 'iana',
  },
  'application/vnd.fujitsu.oasys3': {
    extensions: ['oa3'],
    source: 'iana',
  },
  'application/vnd.fujitsu.oasysgp': {
    extensions: ['fg5'],
    source: 'iana',
  },
  'application/vnd.fujitsu.oasysprs': {
    extensions: ['bh2'],
    source: 'iana',
  },
  'application/vnd.fujixerox.ddd': {
    extensions: ['ddd'],
    source: 'iana',
  },
  'application/vnd.fujixerox.docuworks': {
    extensions: ['xdw'],
    source: 'iana',
  },
  'application/vnd.fujixerox.docuworks.binder': {
    extensions: ['xbd'],
    source: 'iana',
  },
  'application/vnd.fuzzysheet': {
    extensions: ['fzs'],
    source: 'iana',
  },
  'application/vnd.genomatix.tuxedo': {
    extensions: ['txd'],
    source: 'iana',
  },
  'application/vnd.geogebra.file': {
    extensions: ['ggb'],
    source: 'iana',
  },
  'application/vnd.geogebra.tool': {
    extensions: ['ggt'],
    source: 'iana',
  },
  'application/vnd.geometry-explorer': {
    extensions: ['gex', 'gre'],
    source: 'iana',
  },
  'application/vnd.geonext': {
    extensions: ['gxt'],
    source: 'iana',
  },
  'application/vnd.geoplan': {
    extensions: ['g2w'],
    source: 'iana',
  },
  'application/vnd.geospace': {
    extensions: ['g3w'],
    source: 'iana',
  },
  'application/vnd.gmx': {
    extensions: ['gmx'],
    source: 'iana',
  },
  'application/vnd.google-earth.kml+xml': {
    extensions: ['kml'],
    source: 'iana',
  },
  'application/vnd.google-earth.kmz': {
    extensions: ['kmz'],
    source: 'iana',
  },
  'application/vnd.grafeq': {
    extensions: ['gqf', 'gqs'],
    source: 'iana',
  },
  'application/vnd.groove-account': {
    extensions: ['gac'],
    source: 'iana',
  },
  'application/vnd.groove-help': {
    extensions: ['ghf'],
    source: 'iana',
  },
  'application/vnd.groove-identity-message': {
    extensions: ['gim'],
    source: 'iana',
  },
  'application/vnd.groove-injector': {
    extensions: ['grv'],
    source: 'iana',
  },
  'application/vnd.groove-tool-message': {
    extensions: ['gtm'],
    source: 'iana',
  },
  'application/vnd.groove-tool-template': {
    extensions: ['tpl'],
    source: 'iana',
  },
  'application/vnd.groove-vcard': {
    extensions: ['vcg'],
    source: 'iana',
  },
  'application/vnd.hal+xml': {
    extensions: ['hal'],
    source: 'iana',
  },
  'application/vnd.handheld-entertainment+xml': {
    extensions: ['zmm'],
    source: 'iana',
  },
  'application/vnd.hbci': {
    extensions: ['hbci'],
    source: 'iana',
  },
  'application/vnd.hhe.lesson-player': {
    extensions: ['les'],
    source: 'iana',
  },
  'application/vnd.hp-hpgl': {
    extensions: ['hpgl'],
    source: 'iana',
  },
  'application/vnd.hp-hpid': {
    extensions: ['hpid'],
    source: 'iana',
  },
  'application/vnd.hp-hps': {
    extensions: ['hps'],
    source: 'iana',
  },
  'application/vnd.hp-jlyt': {
    extensions: ['jlt'],
    source: 'iana',
  },
  'application/vnd.hp-pcl': {
    extensions: ['pcl'],
    source: 'iana',
  },
  'application/vnd.hp-pclxl': {
    extensions: ['pclxl'],
    source: 'iana',
  },
  'application/vnd.hydrostatix.sof-data': {
    extensions: ['sfd-hdstx'],
    source: 'iana',
  },
  'application/vnd.ibm.minipay': {
    extensions: ['mpy'],
    source: 'iana',
  },
  'application/vnd.ibm.modcap': {
    extensions: ['afp', 'listafp', 'list3820'],
    source: 'iana',
  },
  'application/vnd.ibm.rights-management': {
    extensions: ['irm'],
    source: 'iana',
  },
  'application/vnd.ibm.secure-container': {
    extensions: ['sc'],
    source: 'iana',
  },
  'application/vnd.iccprofile': {
    extensions: ['icc', 'icm'],
    source: 'iana',
  },
  'application/vnd.igloader': {
    extensions: ['igl'],
    source: 'iana',
  },
  'application/vnd.immervision-ivp': {
    extensions: ['ivp'],
    source: 'iana',
  },
  'application/vnd.immervision-ivu': {
    extensions: ['ivu'],
    source: 'iana',
  },
  'application/vnd.insors.igm': {
    extensions: ['igm'],
    source: 'iana',
  },
  'application/vnd.intercon.formnet': {
    extensions: ['xpw', 'xpx'],
    source: 'iana',
  },
  'application/vnd.intergeo': {
    extensions: ['i2g'],
    source: 'iana',
  },
  'application/vnd.intu.qbo': {
    extensions: ['qbo'],
    source: 'iana',
  },
  'application/vnd.intu.qfx': {
    extensions: ['qfx'],
    source: 'iana',
  },
  'application/vnd.ipunplugged.rcprofile': {
    extensions: ['rcprofile'],
    source: 'iana',
  },
  'application/vnd.irepository.package+xml': {
    extensions: ['irp'],
    source: 'iana',
  },
  'application/vnd.is-xpr': {
    extensions: ['xpr'],
    source: 'iana',
  },
  'application/vnd.isac.fcs': {
    extensions: ['fcs'],
    source: 'iana',
  },
  'application/vnd.jam': {
    extensions: ['jam'],
    source: 'iana',
  },
  'application/vnd.jcp.javame.midlet-rms': {
    extensions: ['rms'],
    source: 'iana',
  },
  'application/vnd.jisp': {
    extensions: ['jisp'],
    source: 'iana',
  },
  'application/vnd.joost.joda-archive': {
    extensions: ['joda'],
    source: 'iana',
  },
  'application/vnd.kahootz': {
    extensions: ['ktz', 'ktr'],
    source: 'iana',
  },
  'application/vnd.kde.karbon': {
    extensions: ['karbon'],
    source: 'iana',
  },
  'application/vnd.kde.kchart': {
    extensions: ['chrt'],
    source: 'iana',
  },
  'application/vnd.kde.kformula': {
    extensions: ['kfo'],
    source: 'iana',
  },
  'application/vnd.kde.kivio': {
    extensions: ['flw'],
    source: 'iana',
  },
  'application/vnd.kde.kontour': {
    extensions: ['kon'],
    source: 'iana',
  },
  'application/vnd.kde.kpresenter': {
    extensions: ['kpr', 'kpt'],
    source: 'iana',
  },
  'application/vnd.kde.kspread': {
    extensions: ['ksp'],
    source: 'iana',
  },
  'application/vnd.kde.kword': {
    extensions: ['kwd', 'kwt'],
    source: 'iana',
  },
  'application/vnd.kenameaapp': {
    extensions: ['htke'],
    source: 'iana',
  },
  'application/vnd.kidspiration': {
    extensions: ['kia'],
    source: 'iana',
  },
  'application/vnd.kinar': {
    extensions: ['kne', 'knp'],
    source: 'iana',
  },
  'application/vnd.koan': {
    extensions: ['skp', 'skd', 'skt', 'skm'],
    source: 'iana',
  },
  'application/vnd.kodak-descriptor': {
    extensions: ['sse'],
    source: 'iana',
  },
  'application/vnd.las.las+xml': {
    extensions: ['lasxml'],
    source: 'iana',
  },
  'application/vnd.llamagraphics.life-balance.desktop': {
    extensions: ['lbd'],
    source: 'iana',
  },
  'application/vnd.llamagraphics.life-balance.exchange+xml': {
    extensions: ['lbe'],
    source: 'iana',
  },
  'application/vnd.lotus-1-2-3': {
    extensions: ['123'],
    source: 'iana',
  },
  'application/vnd.lotus-approach': {
    extensions: ['apr'],
    source: 'iana',
  },
  'application/vnd.lotus-freelance': {
    extensions: ['pre'],
    source: 'iana',
  },
  'application/vnd.lotus-notes': {
    extensions: ['nsf'],
    source: 'iana',
  },
  'application/vnd.lotus-organizer': {
    extensions: ['org'],
    source: 'iana',
  },
  'application/vnd.lotus-screencam': {
    extensions: ['scm'],
    source: 'iana',
  },
  'application/vnd.lotus-wordpro': {
    extensions: ['lwp'],
    source: 'iana',
  },
  'application/vnd.macports.portpkg': {
    extensions: ['portpkg'],
    source: 'iana',
  },
  'application/vnd.mapbox-vector-tile': {
    extensions: ['mvt'],
    source: 'iana',
  },
  'application/vnd.mcd': {
    extensions: ['mcd'],
    source: 'iana',
  },
  'application/vnd.medcalcdata': {
    extensions: ['mc1'],
    source: 'iana',
  },
  'application/vnd.mediastation.cdkey': {
    extensions: ['cdkey'],
    source: 'iana',
  },
  'application/vnd.mfer': {
    extensions: ['mwf'],
    source: 'iana',
  },
  'application/vnd.mfmp': {
    extensions: ['mfm'],
    source: 'iana',
  },
  'application/vnd.micrografx.flo': {
    extensions: ['flo'],
    source: 'iana',
  },
  'application/vnd.micrografx.igx': {
    extensions: ['igx'],
    source: 'iana',
  },
  'application/vnd.mif': {
    extensions: ['mif'],
    source: 'iana',
  },
  'application/vnd.mobius.daf': {
    extensions: ['daf'],
    source: 'iana',
  },
  'application/vnd.mobius.dis': {
    extensions: ['dis'],
    source: 'iana',
  },
  'application/vnd.mobius.mbk': {
    extensions: ['mbk'],
    source: 'iana',
  },
  'application/vnd.mobius.mqy': {
    extensions: ['mqy'],
    source: 'iana',
  },
  'application/vnd.mobius.msl': {
    extensions: ['msl'],
    source: 'iana',
  },
  'application/vnd.mobius.plc': {
    extensions: ['plc'],
    source: 'iana',
  },
  'application/vnd.mobius.txf': {
    extensions: ['txf'],
    source: 'iana',
  },
  'application/vnd.mophun.application': {
    extensions: ['mpn'],
    source: 'iana',
  },
  'application/vnd.mophun.certificate': {
    extensions: ['mpc'],
    source: 'iana',
  },
  'application/vnd.mozilla.xul+xml': {
    extensions: ['xul'],
    source: 'iana',
  },
  'application/vnd.ms-artgalry': {
    extensions: ['cil'],
    source: 'iana',
  },
  'application/vnd.ms-cab-compressed': {
    extensions: ['cab'],
    source: 'iana',
  },
  'application/vnd.ms-excel': {
    extensions: ['xls', 'xlm', 'xla', 'xlc', 'xlt', 'xlw'],
    source: 'iana',
  },
  'application/vnd.ms-excel.addin.macroenabled.12': {
    extensions: ['xlam'],
    source: 'iana',
  },
  'application/vnd.ms-excel.sheet.binary.macroenabled.12': {
    extensions: ['xlsb'],
    source: 'iana',
  },
  'application/vnd.ms-excel.sheet.macroenabled.12': {
    extensions: ['xlsm'],
    source: 'iana',
  },
  'application/vnd.ms-excel.template.macroenabled.12': {
    extensions: ['xltm'],
    source: 'iana',
  },
  'application/vnd.ms-fontobject': {
    extensions: ['eot'],
    source: 'iana',
  },
  'application/vnd.ms-htmlhelp': {
    extensions: ['chm'],
    source: 'iana',
  },
  'application/vnd.ms-ims': {
    extensions: ['ims'],
    source: 'iana',
  },
  'application/vnd.ms-lrm': {
    extensions: ['lrm'],
    source: 'iana',
  },
  'application/vnd.ms-officetheme': {
    extensions: ['thmx'],
    source: 'iana',
  },
  'application/vnd.ms-pki.seccat': {
    extensions: ['cat'],
    source: 'apache',
  },
  'application/vnd.ms-pki.stl': {
    extensions: ['stl'],
    source: 'apache',
  },
  'application/vnd.ms-powerpoint': {
    extensions: ['ppt', 'pps', 'pot'],
    source: 'iana',
  },
  'application/vnd.ms-powerpoint.addin.macroenabled.12': {
    extensions: ['ppam'],
    source: 'iana',
  },
  'application/vnd.ms-powerpoint.presentation.macroenabled.12': {
    extensions: ['pptm'],
    source: 'iana',
  },
  'application/vnd.ms-powerpoint.slide.macroenabled.12': {
    extensions: ['sldm'],
    source: 'iana',
  },
  'application/vnd.ms-powerpoint.slideshow.macroenabled.12': {
    extensions: ['ppsm'],
    source: 'iana',
  },
  'application/vnd.ms-powerpoint.template.macroenabled.12': {
    extensions: ['potm'],
    source: 'iana',
  },
  'application/vnd.ms-project': {
    extensions: ['mpp', 'mpt'],
    source: 'iana',
  },
  'application/vnd.ms-word.document.macroenabled.12': {
    extensions: ['docm'],
    source: 'iana',
  },
  'application/vnd.ms-word.template.macroenabled.12': {
    extensions: ['dotm'],
    source: 'iana',
  },
  'application/vnd.ms-works': {
    extensions: ['wps', 'wks', 'wcm', 'wdb'],
    source: 'iana',
  },
  'application/vnd.ms-wpl': {
    extensions: ['wpl'],
    source: 'iana',
  },
  'application/vnd.ms-xpsdocument': {
    extensions: ['xps'],
    source: 'iana',
  },
  'application/vnd.mseq': {
    extensions: ['mseq'],
    source: 'iana',
  },
  'application/vnd.musician': {
    extensions: ['mus'],
    source: 'iana',
  },
  'application/vnd.muvee.style': {
    extensions: ['msty'],
    source: 'iana',
  },
  'application/vnd.mynfc': {
    extensions: ['taglet'],
    source: 'iana',
  },
  'application/vnd.neurolanguage.nlu': {
    extensions: ['nlu'],
    source: 'iana',
  },
  'application/vnd.nitf': {
    extensions: ['ntf', 'nitf'],
    source: 'iana',
  },
  'application/vnd.noblenet-directory': {
    extensions: ['nnd'],
    source: 'iana',
  },
  'application/vnd.noblenet-sealer': {
    extensions: ['nns'],
    source: 'iana',
  },
  'application/vnd.noblenet-web': {
    extensions: ['nnw'],
    source: 'iana',
  },
  'application/vnd.nokia.n-gage.ac+xml': {
    extensions: ['ac'],
    source: 'iana',
  },
  'application/vnd.nokia.n-gage.data': {
    extensions: ['ngdat'],
    source: 'iana',
  },
  'application/vnd.nokia.n-gage.symbian.install': {
    extensions: ['n-gage'],
    source: 'iana',
  },
  'application/vnd.nokia.radio-preset': {
    extensions: ['rpst'],
    source: 'iana',
  },
  'application/vnd.nokia.radio-presets': {
    extensions: ['rpss'],
    source: 'iana',
  },
  'application/vnd.novadigm.edm': {
    extensions: ['edm'],
    source: 'iana',
  },
  'application/vnd.novadigm.edx': {
    extensions: ['edx'],
    source: 'iana',
  },
  'application/vnd.novadigm.ext': {
    extensions: ['ext'],
    source: 'iana',
  },
  'application/vnd.oasis.opendocument.chart': {
    extensions: ['odc'],
    source: 'iana',
  },
  'application/vnd.oasis.opendocument.chart-template': {
    extensions: ['otc'],
    source: 'iana',
  },
  'application/vnd.oasis.opendocument.database': {
    extensions: ['odb'],
    source: 'iana',
  },
  'application/vnd.oasis.opendocument.formula': {
    extensions: ['odf'],
    source: 'iana',
  },
  'application/vnd.oasis.opendocument.formula-template': {
    extensions: ['odft'],
    source: 'iana',
  },
  'application/vnd.oasis.opendocument.graphics': {
    extensions: ['odg'],
    source: 'iana',
  },
  'application/vnd.oasis.opendocument.graphics-template': {
    extensions: ['otg'],
    source: 'iana',
  },
  'application/vnd.oasis.opendocument.image': {
    extensions: ['odi'],
    source: 'iana',
  },
  'application/vnd.oasis.opendocument.image-template': {
    extensions: ['oti'],
    source: 'iana',
  },
  'application/vnd.oasis.opendocument.presentation': {
    extensions: ['odp'],
    source: 'iana',
  },
  'application/vnd.oasis.opendocument.presentation-template': {
    extensions: ['otp'],
    source: 'iana',
  },
  'application/vnd.oasis.opendocument.spreadsheet': {
    extensions: ['ods'],
    source: 'iana',
  },
  'application/vnd.oasis.opendocument.spreadsheet-template': {
    extensions: ['ots'],
    source: 'iana',
  },
  'application/vnd.oasis.opendocument.text': {
    extensions: ['odt'],
    source: 'iana',
  },
  'application/vnd.oasis.opendocument.text-master': {
    extensions: ['odm'],
    source: 'iana',
  },
  'application/vnd.oasis.opendocument.text-template': {
    extensions: ['ott'],
    source: 'iana',
  },
  'application/vnd.oasis.opendocument.text-web': {
    extensions: ['oth'],
    source: 'iana',
  },
  'application/vnd.olpc-sugar': {
    extensions: ['xo'],
    source: 'iana',
  },
  'application/vnd.oma.dd2+xml': {
    extensions: ['dd2'],
    source: 'iana',
  },
  'application/vnd.openblox.game+xml': {
    extensions: ['obgx'],
    source: 'iana',
  },
  'application/vnd.openofficeorg.extension': {
    extensions: ['oxt'],
    source: 'apache',
  },
  'application/vnd.openstreetmap.data+xml': {
    extensions: ['osm'],
    source: 'iana',
  },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': {
    extensions: ['pptx'],
    source: 'iana',
  },
  'application/vnd.openxmlformats-officedocument.presentationml.slide': {
    extensions: ['sldx'],
    source: 'iana',
  },
  'application/vnd.openxmlformats-officedocument.presentationml.slideshow': {
    extensions: ['ppsx'],
    source: 'iana',
  },
  'application/vnd.openxmlformats-officedocument.presentationml.template': {
    extensions: ['potx'],
    source: 'iana',
  },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
    extensions: ['xlsx'],
    source: 'iana',
  },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.template': {
    extensions: ['xltx'],
    source: 'iana',
  },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
    extensions: ['docx'],
    source: 'iana',
  },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.template': {
    extensions: ['dotx'],
    source: 'iana',
  },
  'application/vnd.osgeo.mapguide.package': {
    extensions: ['mgp'],
    source: 'iana',
  },
  'application/vnd.osgi.dp': {
    extensions: ['dp'],
    source: 'iana',
  },
  'application/vnd.osgi.subsystem': {
    extensions: ['esa'],
    source: 'iana',
  },
  'application/vnd.palm': {
    extensions: ['pdb', 'pqa', 'oprc'],
    source: 'iana',
  },
  'application/vnd.pawaafile': {
    extensions: ['paw'],
    source: 'iana',
  },
  'application/vnd.pg.format': {
    extensions: ['str'],
    source: 'iana',
  },
  'application/vnd.pg.osasli': {
    extensions: ['ei6'],
    source: 'iana',
  },
  'application/vnd.picsel': {
    extensions: ['efif'],
    source: 'iana',
  },
  'application/vnd.pmi.widget': {
    extensions: ['wg'],
    source: 'iana',
  },
  'application/vnd.pocketlearn': {
    extensions: ['plf'],
    source: 'iana',
  },
  'application/vnd.powerbuilder6': {
    extensions: ['pbd'],
    source: 'iana',
  },
  'application/vnd.previewsystems.box': {
    extensions: ['box'],
    source: 'iana',
  },
  'application/vnd.proteus.magazine': {
    extensions: ['mgz'],
    source: 'iana',
  },
  'application/vnd.publishare-delta-tree': {
    extensions: ['qps'],
    source: 'iana',
  },
  'application/vnd.pvi.ptid1': {
    extensions: ['ptid'],
    source: 'iana',
  },
  'application/vnd.quark.quarkxpress': {
    extensions: ['qxd', 'qxt', 'qwd', 'qwt', 'qxl', 'qxb'],
    source: 'iana',
  },
  'application/vnd.rar': {
    extensions: ['rar'],
    source: 'iana',
  },
  'application/vnd.realvnc.bed': {
    extensions: ['bed'],
    source: 'iana',
  },
  'application/vnd.recordare.musicxml': {
    extensions: ['mxl'],
    source: 'iana',
  },
  'application/vnd.recordare.musicxml+xml': {
    extensions: ['musicxml'],
    source: 'iana',
  },
  'application/vnd.rig.cryptonote': {
    extensions: ['cryptonote'],
    source: 'iana',
  },
  'application/vnd.rim.cod': {
    extensions: ['cod'],
    source: 'apache',
  },
  'application/vnd.rn-realmedia': {
    extensions: ['rm'],
    source: 'apache',
  },
  'application/vnd.rn-realmedia-vbr': {
    extensions: ['rmvb'],
    source: 'apache',
  },
  'application/vnd.route66.link66+xml': {
    extensions: ['link66'],
    source: 'iana',
  },
  'application/vnd.sailingtracker.track': {
    extensions: ['st'],
    source: 'iana',
  },
  'application/vnd.seemail': {
    extensions: ['see'],
    source: 'iana',
  },
  'application/vnd.sema': {
    extensions: ['sema'],
    source: 'iana',
  },
  'application/vnd.semd': {
    extensions: ['semd'],
    source: 'iana',
  },
  'application/vnd.semf': {
    extensions: ['semf'],
    source: 'iana',
  },
  'application/vnd.shana.informed.formdata': {
    extensions: ['ifm'],
    source: 'iana',
  },
  'application/vnd.shana.informed.formtemplate': {
    extensions: ['itp'],
    source: 'iana',
  },
  'application/vnd.shana.informed.interchange': {
    extensions: ['iif'],
    source: 'iana',
  },
  'application/vnd.shana.informed.package': {
    extensions: ['ipk'],
    source: 'iana',
  },
  'application/vnd.simtech-mindmapper': {
    extensions: ['twd', 'twds'],
    source: 'iana',
  },
  'application/vnd.smaf': {
    extensions: ['mmf'],
    source: 'iana',
  },
  'application/vnd.smart.teacher': {
    extensions: ['teacher'],
    source: 'iana',
  },
  'application/vnd.software602.filler.form+xml': {
    extensions: ['fo'],
    source: 'iana',
  },
  'application/vnd.solent.sdkm+xml': {
    extensions: ['sdkm', 'sdkd'],
    source: 'iana',
  },
  'application/vnd.spotfire.dxp': {
    extensions: ['dxp'],
    source: 'iana',
  },
  'application/vnd.spotfire.sfs': {
    extensions: ['sfs'],
    source: 'iana',
  },
  'application/vnd.stardivision.calc': {
    extensions: ['sdc'],
    source: 'apache',
  },
  'application/vnd.stardivision.draw': {
    extensions: ['sda'],
    source: 'apache',
  },
  'application/vnd.stardivision.impress': {
    extensions: ['sdd'],
    source: 'apache',
  },
  'application/vnd.stardivision.math': {
    extensions: ['smf'],
    source: 'apache',
  },
  'application/vnd.stardivision.writer': {
    extensions: ['sdw', 'vor'],
    source: 'apache',
  },
  'application/vnd.stardivision.writer-global': {
    extensions: ['sgl'],
    source: 'apache',
  },
  'application/vnd.stepmania.package': {
    extensions: ['smzip'],
    source: 'iana',
  },
  'application/vnd.stepmania.stepchart': {
    extensions: ['sm'],
    source: 'iana',
  },
  'application/vnd.sun.wadl+xml': {
    extensions: ['wadl'],
    source: 'iana',
  },
  'application/vnd.sun.xml.calc': {
    extensions: ['sxc'],
    source: 'apache',
  },
  'application/vnd.sun.xml.calc.template': {
    extensions: ['stc'],
    source: 'apache',
  },
  'application/vnd.sun.xml.draw': {
    extensions: ['sxd'],
    source: 'apache',
  },
  'application/vnd.sun.xml.draw.template': {
    extensions: ['std'],
    source: 'apache',
  },
  'application/vnd.sun.xml.impress': {
    extensions: ['sxi'],
    source: 'apache',
  },
  'application/vnd.sun.xml.impress.template': {
    extensions: ['sti'],
    source: 'apache',
  },
  'application/vnd.sun.xml.math': {
    extensions: ['sxm'],
    source: 'apache',
  },
  'application/vnd.sun.xml.writer': {
    extensions: ['sxw'],
    source: 'apache',
  },
  'application/vnd.sun.xml.writer.global': {
    extensions: ['sxg'],
    source: 'apache',
  },
  'application/vnd.sun.xml.writer.template': {
    extensions: ['stw'],
    source: 'apache',
  },
  'application/vnd.sus-calendar': {
    extensions: ['sus', 'susp'],
    source: 'iana',
  },
  'application/vnd.svd': {
    extensions: ['svd'],
    source: 'iana',
  },
  'application/vnd.symbian.install': {
    extensions: ['sis', 'sisx'],
    source: 'apache',
  },
  'application/vnd.syncml+xml': {
    charset: 'UTF-8',
    extensions: ['xsm'],
    source: 'iana',
  },
  'application/vnd.syncml.dm+wbxml': {
    charset: 'UTF-8',
    extensions: ['bdm'],
    source: 'iana',
  },
  'application/vnd.syncml.dm+xml': {
    charset: 'UTF-8',
    extensions: ['xdm'],
    source: 'iana',
  },
  'application/vnd.syncml.dmddf+xml': {
    charset: 'UTF-8',
    extensions: ['ddf'],
    source: 'iana',
  },
  'application/vnd.tao.intent-module-archive': {
    extensions: ['tao'],
    source: 'iana',
  },
  'application/vnd.tcpdump.pcap': {
    extensions: ['pcap', 'cap', 'dmp'],
    source: 'iana',
  },
  'application/vnd.tmobile-livetv': {
    extensions: ['tmo'],
    source: 'iana',
  },
  'application/vnd.trid.tpt': {
    extensions: ['tpt'],
    source: 'iana',
  },
  'application/vnd.triscape.mxs': {
    extensions: ['mxs'],
    source: 'iana',
  },
  'application/vnd.trueapp': {
    extensions: ['tra'],
    source: 'iana',
  },
  'application/vnd.ufdl': {
    extensions: ['ufd', 'ufdl'],
    source: 'iana',
  },
  'application/vnd.uiq.theme': {
    extensions: ['utz'],
    source: 'iana',
  },
  'application/vnd.umajin': {
    extensions: ['umj'],
    source: 'iana',
  },
  'application/vnd.unity': {
    extensions: ['unityweb'],
    source: 'iana',
  },
  'application/vnd.uoml+xml': {
    extensions: ['uoml'],
    source: 'iana',
  },
  'application/vnd.vcx': {
    extensions: ['vcx'],
    source: 'iana',
  },
  'application/vnd.visio': {
    extensions: ['vsd', 'vst', 'vss', 'vsw'],
    source: 'iana',
  },
  'application/vnd.visionary': {
    extensions: ['vis'],
    source: 'iana',
  },
  'application/vnd.vsf': {
    extensions: ['vsf'],
    source: 'iana',
  },
  'application/vnd.wap.wbxml': {
    charset: 'UTF-8',
    extensions: ['wbxml'],
    source: 'iana',
  },
  'application/vnd.wap.wmlc': {
    extensions: ['wmlc'],
    source: 'iana',
  },
  'application/vnd.wap.wmlscriptc': {
    extensions: ['wmlsc'],
    source: 'iana',
  },
  'application/vnd.webturbo': {
    extensions: ['wtb'],
    source: 'iana',
  },
  'application/vnd.wolfram.player': {
    extensions: ['nbp'],
    source: 'iana',
  },
  'application/vnd.wordperfect': {
    extensions: ['wpd'],
    source: 'iana',
  },
  'application/vnd.wqd': {
    extensions: ['wqd'],
    source: 'iana',
  },
  'application/vnd.wt.stf': {
    extensions: ['stf'],
    source: 'iana',
  },
  'application/vnd.xara': {
    extensions: ['xar'],
    source: 'iana',
  },
  'application/vnd.xfdl': {
    extensions: ['xfdl'],
    source: 'iana',
  },
  'application/vnd.yamaha.hv-dic': {
    extensions: ['hvd'],
    source: 'iana',
  },
  'application/vnd.yamaha.hv-script': {
    extensions: ['hvs'],
    source: 'iana',
  },
  'application/vnd.yamaha.hv-voice': {
    extensions: ['hvp'],
    source: 'iana',
  },
  'application/vnd.yamaha.openscoreformat': {
    extensions: ['osf'],
    source: 'iana',
  },
  'application/vnd.yamaha.openscoreformat.osfpvg+xml': {
    extensions: ['osfpvg'],
    source: 'iana',
  },
  'application/vnd.yamaha.smaf-audio': {
    extensions: ['saf'],
    source: 'iana',
  },
  'application/vnd.yamaha.smaf-phrase': {
    extensions: ['spf'],
    source: 'iana',
  },
  'application/vnd.yellowriver-custom-menu': {
    extensions: ['cmp'],
    source: 'iana',
  },
  'application/vnd.zul': {
    extensions: ['zir', 'zirz'],
    source: 'iana',
  },
  'application/vnd.zzazz.deck+xml': {
    extensions: ['zaz'],
    source: 'iana',
  },
  'application/voicexml+xml': {
    extensions: ['vxml'],
    source: 'iana',
  },
  'application/wasm': {
    extensions: ['wasm'],
    source: 'iana',
  },
  'application/watcherinfo+xml': {
    extensions: ['wif'],
    source: 'iana',
  },
  'application/widget': {
    extensions: ['wgt'],
    source: 'iana',
  },
  'application/winhlp': {
    extensions: ['hlp'],
    source: 'apache',
  },
  'application/wsdl+xml': {
    extensions: ['wsdl'],
    source: 'iana',
  },
  'application/wspolicy+xml': {
    extensions: ['wspolicy'],
    source: 'iana',
  },
  'application/x-7z-compressed': {
    extensions: ['7z'],
    source: 'apache',
  },
  'application/x-abiword': {
    extensions: ['abw'],
    source: 'apache',
  },
  'application/x-ace-compressed': {
    extensions: ['ace'],
    source: 'apache',
  },
  'application/x-apple-diskimage': {
    extensions: ['dmg'],
    source: 'apache',
  },
  'application/x-authorware-bin': {
    extensions: ['aab', 'x32', 'u32', 'vox'],
    source: 'apache',
  },
  'application/x-authorware-map': {
    extensions: ['aam'],
    source: 'apache',
  },
  'application/x-authorware-seg': {
    extensions: ['aas'],
    source: 'apache',
  },
  'application/x-bcpio': {
    extensions: ['bcpio'],
    source: 'apache',
  },
  'application/x-bittorrent': {
    extensions: ['torrent'],
    source: 'apache',
  },
  'application/x-blorb': {
    extensions: ['blb', 'blorb'],
    source: 'apache',
  },
  'application/x-bzip': {
    extensions: ['bz'],
    source: 'apache',
  },
  'application/x-bzip2': {
    extensions: ['bz2', 'boz'],
    source: 'apache',
  },
  'application/x-cbr': {
    extensions: ['cbr', 'cba', 'cbt', 'cbz', 'cb7'],
    source: 'apache',
  },
  'application/x-cdlink': {
    extensions: ['vcd'],
    source: 'apache',
  },
  'application/x-cfs-compressed': {
    extensions: ['cfs'],
    source: 'apache',
  },
  'application/x-chat': {
    extensions: ['chat'],
    source: 'apache',
  },
  'application/x-chess-pgn': {
    extensions: ['pgn'],
    source: 'apache',
  },
  'application/x-cocoa': {
    extensions: ['cco'],
    source: 'nginx',
  },
  'application/x-conference': {
    extensions: ['nsc'],
    source: 'apache',
  },
  'application/x-cpio': {
    extensions: ['cpio'],
    source: 'apache',
  },
  'application/x-csh': {
    extensions: ['csh'],
    source: 'apache',
  },
  'application/x-debian-package': {
    extensions: ['deb', 'udeb'],
    source: 'apache',
  },
  'application/x-dgc-compressed': {
    extensions: ['dgc'],
    source: 'apache',
  },
  'application/x-director': {
    extensions: ['dir', 'dcr', 'dxr', 'cst', 'cct', 'cxt', 'w3d', 'fgd', 'swa'],
    source: 'apache',
  },
  'application/x-doom': {
    extensions: ['wad'],
    source: 'apache',
  },
  'application/x-dtbncx+xml': {
    extensions: ['ncx'],
    source: 'apache',
  },
  'application/x-dtbook+xml': {
    extensions: ['dtb'],
    source: 'apache',
  },
  'application/x-dtbresource+xml': {
    extensions: ['res'],
    source: 'apache',
  },
  'application/x-dvi': {
    extensions: ['dvi'],
    source: 'apache',
  },
  'application/x-envoy': {
    extensions: ['evy'],
    source: 'apache',
  },
  'application/x-eva': {
    extensions: ['eva'],
    source: 'apache',
  },
  'application/x-font-bdf': {
    extensions: ['bdf'],
    source: 'apache',
  },
  'application/x-font-ghostscript': {
    extensions: ['gsf'],
    source: 'apache',
  },
  'application/x-font-linux-psf': {
    extensions: ['psf'],
    source: 'apache',
  },
  'application/x-font-pcf': {
    extensions: ['pcf'],
    source: 'apache',
  },
  'application/x-font-snf': {
    extensions: ['snf'],
    source: 'apache',
  },
  'application/x-font-type1': {
    extensions: ['pfa', 'pfb', 'pfm', 'afm'],
    source: 'apache',
  },
  'application/x-freearc': {
    extensions: ['arc'],
    source: 'apache',
  },
  'application/x-futuresplash': {
    extensions: ['spl'],
    source: 'apache',
  },
  'application/x-gca-compressed': {
    extensions: ['gca'],
    source: 'apache',
  },
  'application/x-glulx': {
    extensions: ['ulx'],
    source: 'apache',
  },
  'application/x-gnumeric': {
    extensions: ['gnumeric'],
    source: 'apache',
  },
  'application/x-gramps-xml': {
    extensions: ['gramps'],
    source: 'apache',
  },
  'application/x-gtar': {
    extensions: ['gtar'],
    source: 'apache',
  },
  'application/x-hdf': {
    extensions: ['hdf'],
    source: 'apache',
  },
  'application/x-install-instructions': {
    extensions: ['install'],
    source: 'apache',
  },
  'application/x-iso9660-image': {
    extensions: ['iso'],
    source: 'apache',
  },
  'application/x-java-archive-diff': {
    extensions: ['jardiff'],
    source: 'nginx',
  },
  'application/x-java-jnlp-file': {
    extensions: ['jnlp'],
    source: 'apache',
  },
  'application/x-latex': {
    extensions: ['latex'],
    source: 'apache',
  },
  'application/x-lzh-compressed': {
    extensions: ['lzh', 'lha'],
    source: 'apache',
  },
  'application/x-makeself': {
    extensions: ['run'],
    source: 'nginx',
  },
  'application/x-mie': {
    extensions: ['mie'],
    source: 'apache',
  },
  'application/x-mobipocket-ebook': {
    extensions: ['prc', 'mobi'],
    source: 'apache',
  },
  'application/x-ms-application': {
    extensions: ['application'],
    source: 'apache',
  },
  'application/x-ms-shortcut': {
    extensions: ['lnk'],
    source: 'apache',
  },
  'application/x-ms-wmd': {
    extensions: ['wmd'],
    source: 'apache',
  },
  'application/x-ms-wmz': {
    extensions: ['wmz'],
    source: 'apache',
  },
  'application/x-ms-xbap': {
    extensions: ['xbap'],
    source: 'apache',
  },
  'application/x-msaccess': {
    extensions: ['mdb'],
    source: 'apache',
  },
  'application/x-msbinder': {
    extensions: ['obd'],
    source: 'apache',
  },
  'application/x-mscardfile': {
    extensions: ['crd'],
    source: 'apache',
  },
  'application/x-msclip': {
    extensions: ['clp'],
    source: 'apache',
  },
  'application/x-msdownload': {
    extensions: ['exe', 'dll', 'com', 'bat', 'msi'],
    source: 'apache',
  },
  'application/x-msmediaview': {
    extensions: ['mvb', 'm13', 'm14'],
    source: 'apache',
  },
  'application/x-msmetafile': {
    extensions: ['wmf', 'wmz', 'emf', 'emz'],
    source: 'apache',
  },
  'application/x-msmoney': {
    extensions: ['mny'],
    source: 'apache',
  },
  'application/x-mspublisher': {
    extensions: ['pub'],
    source: 'apache',
  },
  'application/x-msschedule': {
    extensions: ['scd'],
    source: 'apache',
  },
  'application/x-msterminal': {
    extensions: ['trm'],
    source: 'apache',
  },
  'application/x-mswrite': {
    extensions: ['wri'],
    source: 'apache',
  },
  'application/x-netcdf': {
    extensions: ['nc', 'cdf'],
    source: 'apache',
  },
  'application/x-nzb': {
    extensions: ['nzb'],
    source: 'apache',
  },
  'application/x-perl': {
    extensions: ['pl', 'pm'],
    source: 'nginx',
  },
  'application/x-pilot': {
    extensions: ['prc', 'pdb'],
    source: 'nginx',
  },
  'application/x-pkcs7-certificates': {
    extensions: ['p7b', 'spc'],
    source: 'apache',
  },
  'application/x-pkcs7-certreqresp': {
    extensions: ['p7r'],
    source: 'apache',
  },
  'application/x-pkcs12': {
    extensions: ['p12', 'pfx'],
    source: 'apache',
  },
  'application/x-rar-compressed': {
    extensions: ['rar'],
    source: 'apache',
  },
  'application/x-redhat-package-manager': {
    extensions: ['rpm'],
    source: 'nginx',
  },
  'application/x-research-info-systems': {
    extensions: ['ris'],
    source: 'apache',
  },
  'application/x-sea': {
    extensions: ['sea'],
    source: 'nginx',
  },
  'application/x-sh': {
    extensions: ['sh'],
    source: 'apache',
  },
  'application/x-shar': {
    extensions: ['shar'],
    source: 'apache',
  },
  'application/x-shockwave-flash': {
    extensions: ['swf'],
    source: 'apache',
  },
  'application/x-silverlight-app': {
    extensions: ['xap'],
    source: 'apache',
  },
  'application/x-sql': {
    extensions: ['sql'],
    source: 'apache',
  },
  'application/x-stuffit': {
    extensions: ['sit'],
    source: 'apache',
  },
  'application/x-stuffitx': {
    extensions: ['sitx'],
    source: 'apache',
  },
  'application/x-subrip': {
    extensions: ['srt'],
    source: 'apache',
  },
  'application/x-sv4cpio': {
    extensions: ['sv4cpio'],
    source: 'apache',
  },
  'application/x-sv4crc': {
    extensions: ['sv4crc'],
    source: 'apache',
  },
  'application/x-t3vm-image': {
    extensions: ['t3'],
    source: 'apache',
  },
  'application/x-tads': {
    extensions: ['gam'],
    source: 'apache',
  },
  'application/x-tar': {
    extensions: ['tar'],
    source: 'apache',
  },
  'application/x-tcl': {
    extensions: ['tcl', 'tk'],
    source: 'apache',
  },
  'application/x-tex': {
    extensions: ['tex'],
    source: 'apache',
  },
  'application/x-tex-tfm': {
    extensions: ['tfm'],
    source: 'apache',
  },
  'application/x-texinfo': {
    extensions: ['texinfo', 'texi'],
    source: 'apache',
  },
  'application/x-tgif': {
    extensions: ['obj'],
    source: 'apache',
  },
  'application/x-ustar': {
    extensions: ['ustar'],
    source: 'apache',
  },
  'application/x-wais-source': {
    extensions: ['src'],
    source: 'apache',
  },
  'application/x-x509-ca-cert': {
    extensions: ['der', 'crt', 'pem'],
    source: 'iana',
  },
  'application/x-xfig': {
    extensions: ['fig'],
    source: 'apache',
  },
  'application/x-xliff+xml': {
    extensions: ['xlf'],
    source: 'apache',
  },
  'application/x-xpinstall': {
    extensions: ['xpi'],
    source: 'apache',
  },
  'application/x-xz': {
    extensions: ['xz'],
    source: 'apache',
  },
  'application/x-zmachine': {
    extensions: ['z1', 'z2', 'z3', 'z4', 'z5', 'z6', 'z7', 'z8'],
    source: 'apache',
  },
  'application/xaml+xml': {
    extensions: ['xaml'],
    source: 'apache',
  },
  'application/xcap-att+xml': {
    extensions: ['xav'],
    source: 'iana',
  },
  'application/xcap-caps+xml': {
    extensions: ['xca'],
    source: 'iana',
  },
  'application/xcap-diff+xml': {
    extensions: ['xdf'],
    source: 'iana',
  },
  'application/xcap-el+xml': {
    extensions: ['xel'],
    source: 'iana',
  },
  'application/xcap-ns+xml': {
    extensions: ['xns'],
    source: 'iana',
  },
  'application/xenc+xml': {
    extensions: ['xenc'],
    source: 'iana',
  },
  'application/xhtml+xml': {
    extensions: ['xhtml', 'xht'],
    source: 'iana',
  },
  'application/xliff+xml': {
    extensions: ['xlf'],
    source: 'iana',
  },
  'application/xml': {
    extensions: ['xml', 'xsl', 'xsd', 'rng'],
    source: 'iana',
  },
  'application/xml-dtd': {
    extensions: ['dtd'],
    source: 'iana',
  },
  'application/xop+xml': {
    extensions: ['xop'],
    source: 'iana',
  },
  'application/xproc+xml': {
    extensions: ['xpl'],
    source: 'apache',
  },
  'application/xslt+xml': {
    extensions: ['xsl', 'xslt'],
    source: 'iana',
  },
  'application/xspf+xml': {
    extensions: ['xspf'],
    source: 'apache',
  },
  'application/xv+xml': {
    extensions: ['mxml', 'xhvml', 'xvml', 'xvm'],
    source: 'iana',
  },
  'application/yaml': {
    extensions: ['yaml', 'yml'],
    source: 'iana',
  },
  'application/yang': {
    extensions: ['yang'],
    source: 'iana',
  },
  'application/yin+xml': {
    extensions: ['yin'],
    source: 'iana',
  },
  'application/zip': {
    extensions: ['zip'],
    source: 'iana',
  },
  'audio/3gpp': {
    extensions: ['3gpp'],
    source: 'iana',
  },
  'audio/adpcm': {
    extensions: ['adp'],
    source: 'apache',
  },
  'audio/amr': {
    extensions: ['amr'],
    source: 'iana',
  },
  'audio/basic': {
    extensions: ['au', 'snd'],
    source: 'iana',
  },
  'audio/midi': {
    extensions: ['mid', 'midi', 'kar', 'rmi'],
    source: 'apache',
  },
  'audio/mobile-xmf': {
    extensions: ['mxmf'],
    source: 'iana',
  },
  'audio/mp4': {
    extensions: ['m4a', 'mp4a'],
    source: 'iana',
  },
  'audio/mpeg': {
    extensions: ['mpga', 'mp2', 'mp2a', 'mp3', 'm2a', 'm3a'],
    source: 'iana',
  },
  'audio/ogg': {
    extensions: ['oga', 'ogg', 'spx', 'opus'],
    source: 'iana',
  },
  'audio/s3m': {
    extensions: ['s3m'],
    source: 'apache',
  },
  'audio/silk': {
    extensions: ['sil'],
    source: 'apache',
  },
  'audio/vnd.dece.audio': {
    extensions: ['uva', 'uvva'],
    source: 'iana',
  },
  'audio/vnd.digital-winds': {
    extensions: ['eol'],
    source: 'iana',
  },
  'audio/vnd.dra': {
    extensions: ['dra'],
    source: 'iana',
  },
  'audio/vnd.dts': {
    extensions: ['dts'],
    source: 'iana',
  },
  'audio/vnd.dts.hd': {
    extensions: ['dtshd'],
    source: 'iana',
  },
  'audio/vnd.lucent.voice': {
    extensions: ['lvp'],
    source: 'iana',
  },
  'audio/vnd.ms-playready.media.pya': {
    extensions: ['pya'],
    source: 'iana',
  },
  'audio/vnd.nuera.ecelp4800': {
    extensions: ['ecelp4800'],
    source: 'iana',
  },
  'audio/vnd.nuera.ecelp7470': {
    extensions: ['ecelp7470'],
    source: 'iana',
  },
  'audio/vnd.nuera.ecelp9600': {
    extensions: ['ecelp9600'],
    source: 'iana',
  },
  'audio/vnd.rip': {
    extensions: ['rip'],
    source: 'iana',
  },
  'audio/webm': {
    extensions: ['weba'],
    source: 'apache',
  },
  'audio/x-aac': {
    extensions: ['aac'],
    source: 'apache',
  },
  'audio/x-aiff': {
    extensions: ['aif', 'aiff', 'aifc'],
    source: 'apache',
  },
  'audio/x-caf': {
    extensions: ['caf'],
    source: 'apache',
  },
  'audio/x-flac': {
    extensions: ['flac'],
    source: 'apache',
  },
  'audio/x-gsm': {
    extensions: ['gsm'],
    source: 'apache',
  },
  'audio/x-m4a': {
    extensions: ['m4a'],
    source: 'nginx',
  },
  'audio/x-matroska': {
    extensions: ['mka'],
    source: 'apache',
  },
  'audio/x-mpegurl': {
    extensions: ['m3u'],
    source: 'apache',
  },
  'audio/x-ms-wax': {
    extensions: ['wax'],
    source: 'apache',
  },
  'audio/x-ms-wma': {
    extensions: ['wma'],
    source: 'apache',
  },
  'audio/x-pn-realaudio': {
    extensions: ['ram', 'ra'],
    source: 'apache',
  },
  'audio/x-pn-realaudio-plugin': {
    extensions: ['rmp'],
    source: 'apache',
  },
  'audio/x-realaudio': {
    extensions: ['ra'],
    source: 'nginx',
  },
  'audio/x-wav': {
    extensions: ['wav'],
    source: 'apache',
  },
  'audio/xm': {
    extensions: ['xm'],
    source: 'apache',
  },
  'image/aces': {
    extensions: ['exr'],
    source: 'iana',
  },
  'image/avci': {
    extensions: ['avci'],
    source: 'iana',
  },
  'image/avcs': {
    extensions: ['avcs'],
    source: 'iana',
  },
  'image/avif': {
    extensions: ['avif'],
    source: 'iana',
  },
  'image/bmp': {
    extensions: ['bmp'],
    source: 'iana',
  },
  'image/cgm': {
    extensions: ['cgm'],
    source: 'iana',
  },
  'image/dicom-rle': {
    extensions: ['drle'],
    source: 'iana',
  },
  'image/emf': {
    extensions: ['emf'],
    source: 'iana',
  },
  'image/fits': {
    extensions: ['fits'],
    source: 'iana',
  },
  'image/g3fax': {
    extensions: ['g3'],
    source: 'iana',
  },
  'image/gif': {
    extensions: ['gif'],
    source: 'iana',
  },
  'image/heic': {
    extensions: ['heic'],
    source: 'iana',
  },
  'image/heic-sequence': {
    extensions: ['heics'],
    source: 'iana',
  },
  'image/heif': {
    extensions: ['heif'],
    source: 'iana',
  },
  'image/heif-sequence': {
    extensions: ['heifs'],
    source: 'iana',
  },
  'image/hej2k': {
    extensions: ['hej2'],
    source: 'iana',
  },
  'image/hsj2': {
    extensions: ['hsj2'],
    source: 'iana',
  },
  'image/ief': {
    extensions: ['ief'],
    source: 'iana',
  },
  'image/jls': {
    extensions: ['jls'],
    source: 'iana',
  },
  'image/jp2': {
    extensions: ['jp2', 'jpg2'],
    source: 'iana',
  },
  'image/jpeg': {
    extensions: ['jpeg', 'jpg', 'jpe', 'jfif', 'pjpeg', 'pjp'],
    source: 'iana',
  },
  'image/jph': {
    extensions: ['jph'],
    source: 'iana',
  },
  'image/jphc': {
    extensions: ['jhc'],
    source: 'iana',
  },
  'image/jpm': {
    extensions: ['jpm'],
    source: 'iana',
  },
  'image/jpx': {
    extensions: ['jpx', 'jpf'],
    source: 'iana',
  },
  'image/jxr': {
    extensions: ['jxr'],
    source: 'iana',
  },
  'image/jxra': {
    extensions: ['jxra'],
    source: 'iana',
  },
  'image/jxrs': {
    extensions: ['jxrs'],
    source: 'iana',
  },
  'image/jxs': {
    extensions: ['jxs'],
    source: 'iana',
  },
  'image/jxsc': {
    extensions: ['jxsc'],
    source: 'iana',
  },
  'image/jxsi': {
    extensions: ['jxsi'],
    source: 'iana',
  },
  'image/jxss': {
    extensions: ['jxss'],
    source: 'iana',
  },
  'image/ktx': {
    extensions: ['ktx'],
    source: 'iana',
  },
  'image/ktx2': {
    extensions: ['ktx2'],
    source: 'iana',
  },
  'image/png': {
    extensions: ['png'],
    source: 'iana',
  },
  'image/prs.btif': {
    extensions: ['btif'],
    source: 'iana',
  },
  'image/prs.pti': {
    extensions: ['pti'],
    source: 'iana',
  },
  'image/sgi': {
    extensions: ['sgi'],
    source: 'apache',
  },
  'image/svg+xml': {
    extensions: ['svg', 'svgz'],
    source: 'iana',
  },
  'image/t38': {
    extensions: ['t38'],
    source: 'iana',
  },
  'image/tiff': {
    extensions: ['tif', 'tiff'],
    source: 'iana',
  },
  'image/tiff-fx': {
    extensions: ['tfx'],
    source: 'iana',
  },
  'image/vnd.adobe.photoshop': {
    extensions: ['psd'],
    source: 'iana',
  },
  'image/vnd.airzip.accelerator.azv': {
    extensions: ['azv'],
    source: 'iana',
  },
  'image/vnd.dece.graphic': {
    extensions: ['uvi', 'uvvi', 'uvg', 'uvvg'],
    source: 'iana',
  },
  'image/vnd.djvu': {
    extensions: ['djvu', 'djv'],
    source: 'iana',
  },
  'image/vnd.dvb.subtitle': {
    extensions: ['sub'],
    source: 'iana',
  },
  'image/vnd.dwg': {
    extensions: ['dwg'],
    source: 'iana',
  },
  'image/vnd.dxf': {
    extensions: ['dxf'],
    source: 'iana',
  },
  'image/vnd.fastbidsheet': {
    extensions: ['fbs'],
    source: 'iana',
  },
  'image/vnd.fpx': {
    extensions: ['fpx'],
    source: 'iana',
  },
  'image/vnd.fst': {
    extensions: ['fst'],
    source: 'iana',
  },
  'image/vnd.fujixerox.edmics-mmr': {
    extensions: ['mmr'],
    source: 'iana',
  },
  'image/vnd.fujixerox.edmics-rlc': {
    extensions: ['rlc'],
    source: 'iana',
  },
  'image/vnd.microsoft.icon': {
    extensions: ['ico'],
    source: 'iana',
  },
  'image/vnd.ms-modi': {
    extensions: ['mdi'],
    source: 'iana',
  },
  'image/vnd.ms-photo': {
    extensions: ['wdp'],
    source: 'apache',
  },
  'image/vnd.net-fpx': {
    extensions: ['npx'],
    source: 'iana',
  },
  'image/vnd.pco.b16': {
    extensions: ['b16'],
    source: 'iana',
  },
  'image/vnd.tencent.tap': {
    extensions: ['tap'],
    source: 'iana',
  },
  'image/vnd.valve.source.texture': {
    extensions: ['vtf'],
    source: 'iana',
  },
  'image/vnd.wap.wbmp': {
    extensions: ['wbmp'],
    source: 'iana',
  },
  'image/vnd.xiff': {
    extensions: ['xif'],
    source: 'iana',
  },
  'image/vnd.zbrush.pcx': {
    extensions: ['pcx'],
    source: 'iana',
  },
  'image/webp': {
    extensions: ['webp'],
    source: 'apache',
  },
  'image/wmf': {
    extensions: ['wmf'],
    source: 'iana',
  },
  'image/x-3ds': {
    extensions: ['3ds'],
    source: 'apache',
  },
  'image/x-cmu-raster': {
    extensions: ['ras'],
    source: 'apache',
  },
  'image/x-cmx': {
    extensions: ['cmx'],
    source: 'apache',
  },
  'image/x-freehand': {
    extensions: ['fh', 'fhc', 'fh4', 'fh5', 'fh7'],
    source: 'apache',
  },
  'image/x-icon': {
    extensions: ['ico'],
    source: 'apache',
  },
  'image/x-jng': {
    extensions: ['jng'],
    source: 'nginx',
  },
  'image/x-mrsid-image': {
    extensions: ['sid'],
    source: 'apache',
  },
  'image/x-ms-bmp': {
    extensions: ['bmp'],
    source: 'nginx',
  },
  'image/x-pcx': {
    extensions: ['pcx'],
    source: 'apache',
  },
  'image/x-pict': {
    extensions: ['pic', 'pct'],
    source: 'apache',
  },
  'image/x-portable-anymap': {
    extensions: ['pnm'],
    source: 'apache',
  },
  'image/x-portable-bitmap': {
    extensions: ['pbm'],
    source: 'apache',
  },
  'image/x-portable-graymap': {
    extensions: ['pgm'],
    source: 'apache',
  },
  'image/x-portable-pixmap': {
    extensions: ['ppm'],
    source: 'apache',
  },
  'image/x-rgb': {
    extensions: ['rgb'],
    source: 'apache',
  },
  'image/x-tga': {
    extensions: ['tga'],
    source: 'apache',
  },
  'image/x-xbitmap': {
    extensions: ['xbm'],
    source: 'apache',
  },
  'image/x-xpixmap': {
    extensions: ['xpm'],
    source: 'apache',
  },
  'image/x-xwindowdump': {
    extensions: ['xwd'],
    source: 'apache',
  },
  'text/cache-manifest': {
    extensions: ['appcache', 'manifest'],
    source: 'iana',
  },
  'text/calendar': {
    extensions: ['ics', 'ifb'],
    source: 'iana',
  },
  'text/css': {
    charset: 'UTF-8',
    extensions: ['css'],
    source: 'iana',
  },
  'text/csv': {
    extensions: ['csv'],
    source: 'iana',
  },
  'text/html': {
    extensions: ['html', 'htm', 'shtml'],
    source: 'iana',
  },
  'text/markdown': {
    extensions: ['markdown', 'md'],
    source: 'iana',
  },
  'text/mathml': {
    extensions: ['mml'],
    source: 'nginx',
  },
  'text/n3': {
    charset: 'UTF-8',
    extensions: ['n3'],
    source: 'iana',
  },
  'text/plain': {
    extensions: ['txt', 'text', 'conf', 'def', 'list', 'log', 'in', 'ini'],
    source: 'iana',
  },
  'text/prs.lines.tag': {
    extensions: ['dsc'],
    source: 'iana',
  },
  'text/richtext': {
    extensions: ['rtx'],
    source: 'iana',
  },
  'text/rtf': {
    extensions: ['rtf'],
    source: 'iana',
  },
  'text/sgml': {
    extensions: ['sgml', 'sgm'],
    source: 'iana',
  },
  'text/shex': {
    extensions: ['shex'],
    source: 'iana',
  },
  'text/spdx': {
    extensions: ['spdx'],
    source: 'iana',
  },
  'text/tab-separated-values': {
    extensions: ['tsv'],
    source: 'iana',
  },
  'text/troff': {
    extensions: ['t', 'tr', 'roff', 'man', 'me', 'ms'],
    source: 'iana',
  },
  'text/turtle': {
    charset: 'UTF-8',
    extensions: ['ttl'],
    source: 'iana',
  },
  'text/uri-list': {
    extensions: ['uri', 'uris', 'urls'],
    source: 'iana',
  },
  'text/vcard': {
    extensions: ['vcard'],
    source: 'iana',
  },
  'text/vnd.curl': {
    extensions: ['curl'],
    source: 'iana',
  },
  'text/vnd.curl.dcurl': {
    extensions: ['dcurl'],
    source: 'apache',
  },
  'text/vnd.curl.mcurl': {
    extensions: ['mcurl'],
    source: 'apache',
  },
  'text/vnd.curl.scurl': {
    extensions: ['scurl'],
    source: 'apache',
  },
  'text/vnd.dvb.subtitle': {
    extensions: ['sub'],
    source: 'iana',
  },
  'text/vnd.familysearch.gedcom': {
    extensions: ['ged'],
    source: 'iana',
  },
  'text/vnd.fly': {
    extensions: ['fly'],
    source: 'iana',
  },
  'text/vnd.fmi.flexstor': {
    extensions: ['flx'],
    source: 'iana',
  },
  'text/vnd.graphviz': {
    extensions: ['gv'],
    source: 'iana',
  },
  'text/vnd.in3d.3dml': {
    extensions: ['3dml'],
    source: 'iana',
  },
  'text/vnd.in3d.spot': {
    extensions: ['spot'],
    source: 'iana',
  },
  'text/vnd.sun.j2me.app-descriptor': {
    charset: 'UTF-8',
    extensions: ['jad'],
    source: 'iana',
  },
  'text/vnd.wap.wml': {
    extensions: ['wml'],
    source: 'iana',
  },
  'text/vnd.wap.wmlscript': {
    extensions: ['wmls'],
    source: 'iana',
  },
  'text/vtt': {
    charset: 'UTF-8',
    extensions: ['vtt'],
    source: 'iana',
  },
  'text/x-asm': {
    extensions: ['s', 'asm'],
    source: 'apache',
  },
  'text/x-c': {
    extensions: ['c', 'cc', 'cxx', 'cpp', 'h', 'hh', 'dic'],
    source: 'apache',
  },
  'text/x-component': {
    extensions: ['htc'],
    source: 'nginx',
  },
  'text/x-fortran': {
    extensions: ['f', 'for', 'f77', 'f90'],
    source: 'apache',
  },
  'text/x-java-source': {
    extensions: ['java'],
    source: 'apache',
  },
  'text/x-nfo': {
    extensions: ['nfo'],
    source: 'apache',
  },
  'text/x-opml': {
    extensions: ['opml'],
    source: 'apache',
  },
  'text/x-pascal': {
    extensions: ['p', 'pas'],
    source: 'apache',
  },
  'text/x-setext': {
    extensions: ['etx'],
    source: 'apache',
  },
  'text/x-sfv': {
    extensions: ['sfv'],
    source: 'apache',
  },
  'text/x-uuencode': {
    extensions: ['uu'],
    source: 'apache',
  },
  'text/x-vcalendar': {
    extensions: ['vcs'],
    source: 'apache',
  },
  'text/x-vcard': {
    extensions: ['vcf'],
    source: 'apache',
  },
  'text/xml': {
    extensions: ['xml'],
    source: 'iana',
  },
  'video/3gpp': {
    extensions: ['3gp', '3gpp'],
    source: 'iana',
  },
  'video/3gpp2': {
    extensions: ['3g2'],
    source: 'iana',
  },
  'video/h261': {
    extensions: ['h261'],
    source: 'iana',
  },
  'video/h263': {
    extensions: ['h263'],
    source: 'iana',
  },
  'video/h264': {
    extensions: ['h264'],
    source: 'iana',
  },
  'video/iso.segment': {
    extensions: ['m4s'],
    source: 'iana',
  },
  'video/jpeg': {
    extensions: ['jpgv'],
    source: 'iana',
  },
  'video/jpm': {
    extensions: ['jpm', 'jpgm'],
    source: 'apache',
  },
  'video/mj2': {
    extensions: ['mj2', 'mjp2'],
    source: 'iana',
  },
  'video/mp2t': {
    extensions: ['ts'],
    source: 'iana',
  },
  'video/mp4': {
    extensions: ['mp4', 'mp4v', 'mpg4'],
    source: 'iana',
  },
  'video/mpeg': {
    extensions: ['mpeg', 'mpg', 'mpe', 'm1v', 'm2v'],
    source: 'iana',
  },
  'video/ogg': {
    extensions: ['ogv'],
    source: 'iana',
  },
  'video/quicktime': {
    extensions: ['qt', 'mov'],
    source: 'iana',
  },
  'video/vnd.dece.hd': {
    extensions: ['uvh', 'uvvh'],
    source: 'iana',
  },
  'video/vnd.dece.mobile': {
    extensions: ['uvm', 'uvvm'],
    source: 'iana',
  },
  'video/vnd.dece.pd': {
    extensions: ['uvp', 'uvvp'],
    source: 'iana',
  },
  'video/vnd.dece.sd': {
    extensions: ['uvs', 'uvvs'],
    source: 'iana',
  },
  'video/vnd.dece.video': {
    extensions: ['uvv', 'uvvv'],
    source: 'iana',
  },
  'video/vnd.dvb.file': {
    extensions: ['dvb'],
    source: 'iana',
  },
  'video/vnd.fvt': {
    extensions: ['fvt'],
    source: 'iana',
  },
  'video/vnd.mpegurl': {
    extensions: ['mxu', 'm4u'],
    source: 'iana',
  },
  'video/vnd.ms-playready.media.pyv': {
    extensions: ['pyv'],
    source: 'iana',
  },
  'video/vnd.uvvu.mp4': {
    extensions: ['uvu', 'uvvu'],
    source: 'iana',
  },
  'video/vnd.vivo': {
    extensions: ['viv'],
    source: 'iana',
  },
  'video/webm': {
    extensions: ['webm'],
    source: 'apache',
  },
  'video/x-f4v': {
    extensions: ['f4v'],
    source: 'apache',
  },
  'video/x-fli': {
    extensions: ['fli'],
    source: 'apache',
  },
  'video/x-flv': {
    extensions: ['flv'],
    source: 'apache',
  },
  'video/x-m4v': {
    extensions: ['m4v'],
    source: 'apache',
  },
  'video/x-matroska': {
    extensions: ['mkv', 'mk3d', 'mks'],
    source: 'apache',
  },
  'video/x-mng': {
    extensions: ['mng'],
    source: 'apache',
  },
  'video/x-ms-asf': {
    extensions: ['asf', 'asx'],
    source: 'apache',
  },
  'video/x-ms-vob': {
    extensions: ['vob'],
    source: 'apache',
  },
  'video/x-ms-wm': {
    extensions: ['wm'],
    source: 'apache',
  },
  'video/x-ms-wmv': {
    extensions: ['wmv'],
    source: 'apache',
  },
  'video/x-ms-wmx': {
    extensions: ['wmx'],
    source: 'apache',
  },
  'video/x-ms-wvx': {
    extensions: ['wvx'],
    source: 'apache',
  },
  'video/x-msvideo': {
    extensions: ['avi'],
    source: 'apache',
  },
  'video/x-sgi-movie': {
    extensions: ['movie'],
    source: 'apache',
  },
  'video/x-smv': {
    extensions: ['smv'],
    source: 'apache',
  },
  'chemical/x-cdx': {
    extensions: ['cdx'],
    source: 'apache',
  },
  'chemical/x-cif': {
    extensions: ['cif'],
    source: 'apache',
  },
  'chemical/x-cmdf': {
    extensions: ['cmdf'],
    source: 'apache',
  },
  'chemical/x-cml': {
    extensions: ['cml'],
    source: 'apache',
  },
  'chemical/x-csml': {
    extensions: ['csml'],
    source: 'apache',
  },
  'chemical/x-xyz': {
    extensions: ['xyz'],
    source: 'apache',
  },
  'font/collection': {
    extensions: ['ttc'],
    source: 'iana',
  },
  'font/otf': {
    extensions: ['otf'],
    source: 'iana',
  },
  'font/ttf': {
    extensions: ['ttf'],
    source: 'iana',
  },
  'font/woff': {
    extensions: ['woff'],
    source: 'iana',
  },
  'font/woff2': {
    extensions: ['woff2'],
    source: 'iana',
  },
  'message/disposition-notification': {
    extensions: ['disposition-notification'],
    source: 'iana',
  },
  'message/global': {
    extensions: ['u8msg'],
    source: 'iana',
  },
  'message/global-delivery-status': {
    extensions: ['u8dsn'],
    source: 'iana',
  },
  'message/global-disposition-notification': {
    extensions: ['u8mdn'],
    source: 'iana',
  },
  'message/global-headers': {
    extensions: ['u8hdr'],
    source: 'iana',
  },
  'message/rfc822': {
    extensions: ['eml', 'mime'],
    source: 'iana',
  },
  'message/vnd.wfa.wsc': {
    extensions: ['wsc'],
    source: 'iana',
  },
  'model/3mf': {
    extensions: ['3mf'],
    source: 'iana',
  },
  'model/gltf+json': {
    extensions: ['gltf'],
    source: 'iana',
  },
  'model/gltf-binary': {
    extensions: ['glb'],
    source: 'iana',
  },
  'model/iges': {
    extensions: ['igs', 'iges'],
    source: 'iana',
  },
  'model/mesh': {
    extensions: ['msh', 'mesh', 'silo'],
    source: 'iana',
  },
  'model/mtl': {
    extensions: ['mtl'],
    source: 'iana',
  },
  'model/obj': {
    extensions: ['obj'],
    source: 'iana',
  },
  'model/step': {
    extensions: ['.p21', '.stp', '.step', '.stpnc', '.210'],
    source: 'iana',
  },
  'model/step+xml': {
    extensions: ['stpx'],
    source: 'iana',
  },
  'model/step+zip': {
    extensions: ['stpz'],
    source: 'iana',
  },
  'model/step-xml+zip': {
    extensions: ['stpxz'],
    source: 'iana',
  },
  'model/stl': {
    extensions: ['stl'],
    source: 'iana',
  },
  'model/vnd.collada+xml': {
    extensions: ['dae'],
    source: 'iana',
  },
  'model/vnd.dwf': {
    extensions: ['dwf'],
    source: 'iana',
  },
  'model/vnd.gdl': {
    extensions: ['gdl'],
    source: 'iana',
  },
  'model/vnd.gtw': {
    extensions: ['gtw'],
    source: 'iana',
  },
  'model/vnd.mts': {
    extensions: ['mts'],
    source: 'iana',
  },
  'model/vnd.opengex': {
    extensions: ['ogex'],
    source: 'iana',
  },
  'model/vnd.parasolid.transmit.binary': {
    extensions: ['x_b'],
    source: 'iana',
  },
  'model/vnd.parasolid.transmit.text': {
    extensions: ['x_t'],
    source: 'iana',
  },
  'model/vnd.sap.vds': {
    extensions: ['vds'],
    source: 'iana',
  },
  'model/vnd.usdz+zip': {
    extensions: ['usdz'],
    source: 'iana',
  },
  'model/vnd.valve.source.compiled-map': {
    extensions: ['bsp'],
    source: 'iana',
  },
  'model/vnd.vtu': {
    extensions: ['vtu'],
    source: 'iana',
  },
  'model/vrml': {
    extensions: ['wrl', 'vrml'],
    source: 'iana',
  },
  'model/x3d+binary': {
    extensions: ['x3db', 'x3dbz'],
    source: 'apache',
  },
  'model/x3d+fastinfoset': {
    extensions: ['x3db'],
    source: 'iana',
  },
  'model/x3d+vrml': {
    extensions: ['x3dv', 'x3dvz'],
    source: 'apache',
  },
  'model/x3d+xml': {
    extensions: ['x3d', 'x3dz'],
    source: 'iana',
  },
  'model/x3d-vrml': {
    extensions: ['x3dv'],
    source: 'iana',
  },
  'x-conference/x-cooltalk': {
    extensions: ['ice'],
    source: 'apache',
  },
} as const;

type MimeType = keyof typeof mimes;
type FileExtension = (typeof mimes)[MimeType]['extensions'][number];

let types: Record<FileExtension, MimeType> | undefined;

/** Looks up the MIME type for a file path or extension. */
export const lookup = (path: string): string | false => {
  if (!path) return false;

  const index = path.lastIndexOf('.');
  const extension = (
    index === -1 ? '' : path.slice(index + 1)
  ).toLowerCase() as FileExtension;

  if (!extension) return false;

  if (!types) {
    const next = {} as Record<FileExtension, MimeType>;
    const preference = ['nginx', 'apache', undefined, 'iana'];

    for (const type of Object.keys(mimes) as MimeType[]) {
      const mime = mimes[type];

      for (const fileExtension of mime.extensions as readonly FileExtension[]) {
        const current = next[fileExtension];

        if (current) {
          const from = preference.indexOf(mimes[current].source);
          const to = preference.indexOf(mime.source);

          if (
            current !== 'application/octet-stream' &&
            (from > to || (from === to && current.startsWith('application/')))
          ) {
            continue;
          }
        }

        next[fileExtension] = type;
      }
    }

    types = next;
  }

  return types[extension] || false;
};
