# ProseMirror raw declaration index

Generated from 19 package repositories, 74 source files, and 2180 source/test declarations.

## model

### model/src/comparedeep.ts

- 1: export function compareDeep

### model/src/content.ts

- 4: type MatchEdge
- 10: export class ContentMatch
- 12: property ContentMatch.next
- 14: property ContentMatch.wrapCache
- 17: constructor ContentMatch.constructor
- 23: method ContentMatch.parse
- 35: method ContentMatch.matchType
- 43: method ContentMatch.matchFragment
- 51: getter ContentMatch.inlineContent
- 57: getter ContentMatch.defaultType
- 66: method ContentMatch.compatible
- 79: method ContentMatch.fillBefore
- 104: method ContentMatch.findWrapping
- 113: method ContentMatch.computeWrapping
- 137: getter ContentMatch.edgeCount
- 143: method ContentMatch.edge
- 149: method ContentMatch.toString
- 166: property ContentMatch.empty
- 169: class TokenStream
- 170: property TokenStream.inline
- 171: property TokenStream.pos
- 172: property TokenStream.tokens
- 174: constructor TokenStream.constructor
- 183: getter TokenStream.next
- 185: method TokenStream.eat
- 187: method TokenStream.err
- 190: type Expr
- 199: function parseExpr
- 206: function parseExprSeq
- 213: function parseExprSubscript
- 229: function parseNum
- 236: function parseExprRange
- 246: function resolveName
- 258: function parseExprAtom
- 280: type Edge
- 290: function nfa
- 352: function cmp
- 357: function nullFrom
- 376: function dfa
- 402: function checkForDeadEnds

### model/src/diff.ts

- 3: export function findDiffStart
- 26: export function findDiffEnd

### model/src/dom.ts

- 1: export type DOMNode

### model/src/fragment.ts

- 10: export class Fragment
- 13: property Fragment.size
- 16: constructor Fragment.constructor
- 29: method Fragment.nodesBetween
- 48: method Fragment.descendants
- 54: method Fragment.textBetween
- 73: method Fragment.append
- 86: method Fragment.cut
- 107: method Fragment.cutByIndex
- 115: method Fragment.replaceChild
- 126: method Fragment.addToStart
- 132: method Fragment.addToEnd
- 137: method Fragment.eq
- 145: getter Fragment.firstChild
- 148: getter Fragment.lastChild
- 151: getter Fragment.childCount
- 155: method Fragment.child
- 162: method Fragment.maybeChild
- 168: method Fragment.forEach
- 178: method Fragment.findDiffStart
- 186: method Fragment.findDiffEnd
- 193: method Fragment.findIndex
- 208: method Fragment.toString
- 211: method Fragment.toStringInner
- 214: method Fragment.toJSON
- 219: method Fragment.fromJSON
- 227: method Fragment.fromArray
- 248: method Fragment.from
- 260: property Fragment.empty
- 263: variable found
- 264: function retIndex

### model/src/from_dom.ts

- 13: export interface ParseOptions
- 18: property ParseOptions.preserveWhitespace
- 25: property ParseOptions.findPositions
- 28: property ParseOptions.from
- 31: property ParseOptions.to
- 37: property ParseOptions.topNode
- 41: property ParseOptions.topMatch
- 46: property ParseOptions.context
- 49: property ParseOptions.ruleFromNode
- 51: property ParseOptions.topOpen
- 56: export interface GenericParseRule
- 62: property GenericParseRule.priority
- 68: property GenericParseRule.consuming
- 81: property GenericParseRule.context
- 84: property GenericParseRule.mark
- 90: property GenericParseRule.ignore
- 94: property GenericParseRule.closeParent
- 98: property GenericParseRule.skip
- 102: property GenericParseRule.attrs
- 106: export interface TagParseRule
- 108: property TagParseRule.tag
- 112: property TagParseRule.namespace
- 119: property TagParseRule.node
- 126: property TagParseRule.getAttrs
- 134: property TagParseRule.contentElement
- 139: property TagParseRule.getContent
- 146: property TagParseRule.preserveWhitespace
- 150: export interface StyleParseRule
- 159: property StyleParseRule.style
- 162: property StyleParseRule.tag
- 165: property StyleParseRule.clearMark
- 169: property StyleParseRule.getAttrs
- 174: export type ParseRule
- 176: function isTagRule
- 177: function isStyleRule
- 182: export class DOMParser
- 184: property DOMParser.tags
- 186: property DOMParser.styles
- 188: property DOMParser.matchedStyles
- 190: property DOMParser.normalizeLists
- 194: constructor DOMParser.constructor
- 221: method DOMParser.parse
- 233: method DOMParser.parseSlice
- 240: method DOMParser.matchTag
- 257: method DOMParser.matchStyle
- 278: method DOMParser.schemaRules
- 311: method DOMParser.fromSchema
- 317: variable blockTags
- 325: variable ignoreTags
- 329: variable listTags
- 332: variable OPT_PRESERVE_WS
- 332: variable OPT_PRESERVE_WS_FULL
- 332: variable OPT_OPEN_LEFT
- 334: function wsOptionsFor
- 340: class NodeContext
- 341: property NodeContext.match
- 342: property NodeContext.content
- 345: property NodeContext.activeMarks
- 347: constructor NodeContext.constructor
- 358: method NodeContext.findWrapping
- 377: method NodeContext.finish
- 392: method NodeContext.inlineContext
- 399: class ParseContext
- 400: property ParseContext.open
- 401: property ParseContext.find
- 402: property ParseContext.needsBlock
- 403: property ParseContext.nodes
- 404: property ParseContext.localPreserveWS
- 406: constructor ParseContext.constructor
- 427: getter ParseContext.top
- 434: method ParseContext.addDOM
- 439: method ParseContext.addTextNode
- 481: method ParseContext.addElement
- 521: method ParseContext.leafFallback
- 527: method ParseContext.ignoreFallback
- 536: method ParseContext.readStyles
- 563: method ParseContext.addElementByRule
- 604: method ParseContext.addAll
- 618: method ParseContext.findPlace
- 641: method ParseContext.insertNode
- 663: method ParseContext.enter
- 670: method ParseContext.enterInner
- 692: method ParseContext.closeExtra
- 700: method ParseContext.finish
- 706: method ParseContext.sync
- 718: getter ParseContext.currentPos
- 730: method ParseContext.findAtPoint
- 737: method ParseContext.findInside
- 744: method ParseContext.findAround
- 754: method ParseContext.findInText
- 762: method ParseContext.matchesContext
- 792: method ParseContext.textblockFromContext
- 808: function normalizeList
- 823: function matches
- 827: function copy
- 836: function markMayApply

### model/src/index.ts

- 1: export re-export "./node"
- 2: export re-export "./resolvedpos"
- 3: export re-export "./fragment"
- 4: export re-export "./replace"
- 5: export re-export "./mark"
- 7: export re-export "./schema"
- 8: export re-export "./content"
- 10: export re-export "./from_dom"
- 11: export re-export "./to_dom"

### model/src/mark.ts

- 10: export class Mark
- 12: constructor Mark.constructor
- 24: method Mark.addToSet
- 49: method Mark.removeFromSet
- 57: method Mark.isInSet
- 65: method Mark.eq
- 71: method Mark.toJSON
- 81: method Mark.fromJSON
- 91: method Mark.sameSet
- 101: method Mark.setFrom
- 110: property Mark.none

### model/src/node.ts

- 8: variable emptyAttrs
- 22: export class Node
- 24: constructor Node.constructor
- 41: property Node.content
- 44: getter Node.children
- 47: property Node.text
- 54: getter Node.nodeSize
- 57: getter Node.childCount
- 61: method Node.child
- 64: method Node.maybeChild
- 68: method Node.forEach
- 79: method Node.nodesBetween
- 87: method Node.descendants
- 93: getter Node.textContent
- 104: method Node.textBetween
- 111: getter Node.firstChild
- 115: getter Node.lastChild
- 118: method Node.eq
- 124: method Node.sameMarkup
- 130: method Node.hasMarkup
- 138: method Node.copy
- 145: method Node.mark
- 152: method Node.cut
- 159: method Node.slice
- 175: method Node.replace
- 180: method Node.nodeAt
- 193: method Node.childAfter
- 201: method Node.childBefore
- 211: method Node.resolve
- 214: method Node.resolveNoCache
- 218: method Node.rangeHasMark
- 228: getter Node.isBlock
- 232: getter Node.isTextblock
- 235: getter Node.inlineContent
- 239: getter Node.isInline
- 242: getter Node.isText
- 245: getter Node.isLeaf
- 252: getter Node.isAtom
- 256: method Node.toString
- 265: method Node.contentMatchAt
- 276: method Node.canReplace
- 286: method Node.canReplaceWith
- 297: method Node.canAppend
- 304: method Node.check
- 319: method Node.toJSON
- 333: method Node.fromJSON
- 353: export class TextNode
- 354: property TextNode.text
- 357: constructor TextNode.constructor
- 363: method TextNode.toString
- 368: getter TextNode.textContent
- 370: method TextNode.textBetween
- 372: getter TextNode.nodeSize
- 374: method TextNode.mark
- 378: method TextNode.withText
- 383: method TextNode.cut
- 388: method TextNode.eq
- 392: method TextNode.toJSON
- 399: function wrapMarks

### model/src/replace.ts

- 8: export class ReplaceError
- 24: export class Slice
- 35: constructor Slice.constructor
- 45: getter Slice.size
- 50: method Slice.insertAt
- 56: method Slice.removeBetween
- 61: method Slice.eq
- 66: method Slice.toString
- 71: method Slice.toJSON
- 80: method Slice.fromJSON
- 90: method Slice.maxOpen
- 98: property Slice.empty
- 101: function removeRange
- 112: function insertInto
- 122: export function replace
- 130: function replaceOuter
- 146: function checkJoin
- 151: function joinable
- 157: function addNode
- 165: function addRange
- 182: function close
- 187: function replaceThreeWay
- 207: function replaceTwoWay
- 218: function prepareSliceForReplace

### model/src/resolvedpos.ts

- 12: export class ResolvedPos
- 16: property ResolvedPos.depth
- 19: constructor ResolvedPos.constructor
- 31: method ResolvedPos.resolveDepth
- 40: getter ResolvedPos.parent
- 43: getter ResolvedPos.doc
- 47: method ResolvedPos.node
- 52: method ResolvedPos.index
- 56: method ResolvedPos.indexAfter
- 63: method ResolvedPos.start
- 70: method ResolvedPos.end
- 78: method ResolvedPos.before
- 86: method ResolvedPos.after
- 95: getter ResolvedPos.textOffset
- 100: getter ResolvedPos.nodeAfter
- 110: getter ResolvedPos.nodeBefore
- 119: method ResolvedPos.posAtIndex
- 130: method ResolvedPos.marks
- 160: method ResolvedPos.marksAcross
- 173: method ResolvedPos.sharedDepth
- 186: method ResolvedPos.blockRange
- 195: method ResolvedPos.sameParent
- 200: method ResolvedPos.max
- 205: method ResolvedPos.min
- 210: method ResolvedPos.toString
- 218: method ResolvedPos.resolve
- 236: method ResolvedPos.resolveCached
- 252: class ResolveCache
- 253: property ResolveCache.elts
- 254: property ResolveCache.i
- 257: variable resolveCacheSize
- 257: variable resolveCache
- 261: export class NodeRange
- 265: constructor NodeRange.constructor
- 279: getter NodeRange.start
- 281: getter NodeRange.end
- 284: getter NodeRange.parent
- 286: getter NodeRange.startIndex
- 288: getter NodeRange.endIndex

### model/src/schema.ts

- 11: export type Attrs
- 17: function defaultAttrs
- 27: function computeAttrs
- 41: export function checkAttrs
- 50: function initAttrs
- 60: export class NodeType
- 62: property NodeType.groups
- 64: property NodeType.attrs
- 66: property NodeType.defaultAttrs
- 69: constructor NodeType.constructor
- 90: property NodeType.inlineContent
- 92: property NodeType.isBlock
- 94: property NodeType.isText
- 97: getter NodeType.isInline
- 101: getter NodeType.isTextblock
- 104: getter NodeType.isLeaf
- 108: getter NodeType.isAtom
- 112: method NodeType.isInGroup
- 117: property NodeType.contentMatch
- 121: property NodeType.markSet
- 124: getter NodeType.whitespace
- 129: method NodeType.hasRequiredAttrs
- 136: method NodeType.compatibleContent
- 141: method NodeType.computeAttrs
- 152: method NodeType.create
- 160: method NodeType.createChecked
- 172: method NodeType.createAndFill
- 188: method NodeType.validContent
- 199: method NodeType.checkContent
- 205: method NodeType.checkAttrs
- 210: method NodeType.allowsMarkType
- 215: method NodeType.allowsMarks
- 222: method NodeType.allowedMarks
- 236: method NodeType.compile
- 249: function validateType
- 259: class Attribute
- 260: property Attribute.hasDefault
- 261: property Attribute.default
- 262: property Attribute.validate
- 264: constructor Attribute.constructor
- 270: getter Attribute.isRequired
- 281: export class MarkType
- 283: property MarkType.attrs
- 285: property MarkType.excluded
- 287: property MarkType.instance
- 290: constructor MarkType.constructor
- 309: method MarkType.create
- 315: method MarkType.compile
- 323: method MarkType.removeFromSet
- 332: method MarkType.isInSet
- 338: method MarkType.checkAttrs
- 344: method MarkType.excludes
- 351: export interface SchemaSpec
- 358: property SchemaSpec.nodes
- 364: property SchemaSpec.marks
- 368: property SchemaSpec.topNode
- 372: export interface NodeSpec
- 376: property NodeSpec.content
- 383: property NodeSpec.marks
- 388: property NodeSpec.group
- 391: property NodeSpec.inline
- 396: property NodeSpec.atom
- 399: property NodeSpec.attrs
- 404: property NodeSpec.selectable
- 408: property NodeSpec.draggable
- 412: property NodeSpec.code
- 423: property NodeSpec.whitespace
- 429: property NodeSpec.definingAsContext
- 434: property NodeSpec.definingForContent
- 439: property NodeSpec.defining
- 445: property NodeSpec.isolating
- 459: property NodeSpec.toDOM
- 467: property NodeSpec.parseDOM
- 471: property NodeSpec.toDebugString
- 477: property NodeSpec.leafText
- 486: property NodeSpec.linebreakReplacement
- 490: index-signature NodeSpec.[]
- 494: export interface MarkSpec
- 496: property MarkSpec.attrs
- 501: property MarkSpec.inclusive
- 516: property MarkSpec.excludes
- 519: property MarkSpec.group
- 523: property MarkSpec.spanning
- 527: property MarkSpec.code
- 533: property MarkSpec.toDOM
- 538: property MarkSpec.parseDOM
- 543: index-signature MarkSpec.[]
- 548: export interface AttributeSpec
- 553: property AttributeSpec.default
- 562: property AttributeSpec.validate
- 572: export class Schema
- 578: property Schema.spec
- 585: property Schema.nodes
- 588: property Schema.marks
- 593: property Schema.linebreakReplacement
- 596: constructor Schema.constructor
- 635: property Schema.topNodeType
- 640: property Schema.cached
- 646: method Schema.node
- 662: method Schema.text
- 668: method Schema.mark
- 675: property Schema.nodeFromJSON
- 679: property Schema.markFromJSON
- 682: method Schema.nodeType
- 689: function gatherMarks

### model/src/to_dom.ts

- 23: export type DOMOutputSpec
- 27: export class DOMSerializer
- 35: constructor DOMSerializer.constructor
- 46: method DOMSerializer.serializeFragment
- 77: method DOMSerializer.serializeNodeInner
- 94: method DOMSerializer.serializeNode
- 107: method DOMSerializer.serializeMark
- 115: method DOMSerializer.renderSpec
- 119: method DOMSerializer.renderSpec
- 132: method DOMSerializer.fromSchema
- 139: method DOMSerializer.nodesFromSchema
- 146: method DOMSerializer.marksFromSchema
- 151: function gatherToDOM
- 160: function doc
- 164: variable suspiciousAttributeCache
- 166: function suspiciousAttributes
- 173: function suspiciousAttributesInner
- 193: function renderSpec

## transform

### transform/src/attr_step.ts

- 6: export class AttrStep
- 8: constructor AttrStep.constructor
- 19: method AttrStep.apply
- 29: method AttrStep.getMap
- 33: method AttrStep.invert
- 37: method AttrStep.map
- 42: method AttrStep.toJSON
- 46: method AttrStep.fromJSON
- 56: export class DocAttrStep
- 58: constructor DocAttrStep.constructor
- 67: method DocAttrStep.apply
- 75: method DocAttrStep.getMap
- 79: method DocAttrStep.invert
- 83: method DocAttrStep.map
- 87: method DocAttrStep.toJSON
- 91: method DocAttrStep.fromJSON

### transform/src/index.ts

- 1: export re-export "./transform"
- 3: export re-export "./transform"
- 4: export re-export "./step"
- 5: export re-export "./structure"
- 6: export re-export "./map"
- 7: export re-export "./mark_step"
- 8: export re-export "./replace_step"
- 9: export re-export "./attr_step"
- 11: export re-export "./replace"

### transform/src/map.ts

- 3: export interface Mappable
- 8: property Mappable.map
- 16: property Mappable.mapResult
- 29: variable lower16
- 30: variable factor16
- 32: function makeRecover
- 33: function recoverIndex
- 34: function recoverOffset
- 36: variable DEL_BEFORE
- 36: variable DEL_AFTER
- 36: variable DEL_ACROSS
- 36: variable DEL_SIDE
- 40: export class MapResult
- 42: constructor MapResult.constructor
- 54: getter MapResult.deleted
- 57: getter MapResult.deletedBefore
- 60: getter MapResult.deletedAfter
- 65: getter MapResult.deletedAcross
- 72: export class StepMap
- 76: constructor StepMap.constructor
- 86: method StepMap.recover
- 93: method StepMap.mapResult
- 95: method StepMap.map
- 98: method StepMap.\_map
- 119: method StepMap.touches
- 134: method StepMap.forEach
- 146: method StepMap.invert
- 151: method StepMap.toString
- 158: method StepMap.offset
- 163: property StepMap.empty
- 172: export class Mapping
- 174: constructor Mapping.constructor
- 189: getter Mapping.maps
- 191: property Mapping.\_maps
- 193: property Mapping.ownData
- 196: method Mapping.slice
- 203: method Mapping.appendMap
- 215: method Mapping.appendMapping
- 225: method Mapping.getMirror
- 231: method Mapping.setMirror
- 237: method Mapping.appendMappingInverted
- 245: method Mapping.invert
- 252: method Mapping.map
- 261: method Mapping.mapResult
- 264: method Mapping.\_map

### transform/src/mark.ts

- 8: export function addMark
- 38: export function removeMark
- 75: export function clearIncompatible

### transform/src/mark_step.ts

- 5: function mapFragment
- 17: export class AddMarkStep
- 19: constructor AddMarkStep.constructor
- 30: method AddMarkStep.apply
- 40: method AddMarkStep.invert
- 44: method AddMarkStep.map
- 50: method AddMarkStep.merge
- 59: method AddMarkStep.toJSON
- 65: method AddMarkStep.fromJSON
- 75: export class RemoveMarkStep
- 77: constructor RemoveMarkStep.constructor
- 88: method RemoveMarkStep.apply
- 96: method RemoveMarkStep.invert
- 100: method RemoveMarkStep.map
- 106: method RemoveMarkStep.merge
- 115: method RemoveMarkStep.toJSON
- 121: method RemoveMarkStep.fromJSON
- 131: export class AddNodeMarkStep
- 133: constructor AddNodeMarkStep.constructor
- 142: method AddNodeMarkStep.apply
- 149: method AddNodeMarkStep.invert
- 163: method AddNodeMarkStep.map
- 168: method AddNodeMarkStep.toJSON
- 173: method AddNodeMarkStep.fromJSON
- 183: export class RemoveNodeMarkStep
- 185: constructor RemoveNodeMarkStep.constructor
- 194: method RemoveNodeMarkStep.apply
- 201: method RemoveNodeMarkStep.invert
- 207: method RemoveNodeMarkStep.map
- 212: method RemoveNodeMarkStep.toJSON
- 217: method RemoveNodeMarkStep.fromJSON

### transform/src/replace.ts

- 12: export function replaceStep
- 21: function fitsTrivially
- 26: interface Fittable
- 27: property Fittable.sliceDepth
- 28: property Fittable.frontierDepth
- 29: property Fittable.parent
- 30: property Fittable.inject
- 31: property Fittable.wrap
- 54: class Fitter
- 55: property Fitter.frontier
- 56: property Fitter.placed
- 58: constructor Fitter.constructor
- 75: getter Fitter.depth
- 77: method Fitter.fit
- 112: method Fitter.findFittable
- 156: method Fitter.openMore
- 165: method Fitter.dropNode
- 180: method Fitter.placeNodes
- 235: method Fitter.mustMoveInline
- 246: method Fitter.findCloseLevel
- 261: method Fitter.close
- 275: method Fitter.openFrontierNode
- 282: method Fitter.closeFrontierNode
- 289: function dropFromFragment
- 294: function addToFragment
- 300: function contentAt
- 305: function closeNodeStart
- 317: function contentAfterFits
- 324: function invalidMarks
- 330: function definesContent
- 334: export function replaceRange
- 405: function closeFragment
- 418: export function replaceRangeWith
- 426: export function deleteRange
- 462: function coveredDepths

### transform/src/replace_step.ts

- 7: export class ReplaceStep
- 15: constructor ReplaceStep.constructor
- 28: method ReplaceStep.apply
- 34: method ReplaceStep.getMap
- 38: method ReplaceStep.invert
- 42: method ReplaceStep.map
- 49: method ReplaceStep.merge
- 65: method ReplaceStep.toJSON
- 73: method ReplaceStep.fromJSON
- 85: property ReplaceStep.MAP_BIAS
- 93: export class ReplaceAroundStep
- 98: constructor ReplaceAroundStep.constructor
- 118: method ReplaceAroundStep.apply
- 131: method ReplaceAroundStep.getMap
- 136: method ReplaceAroundStep.invert
- 144: method ReplaceAroundStep.map
- 152: method ReplaceAroundStep.toJSON
- 161: method ReplaceAroundStep.fromJSON
- 172: function contentBetween

### transform/src/step.ts

- 5: variable stepsByID
- 16: export class Step
- 21: method Step.apply
- 26: method Step.getMap
- 30: method Step.invert
- 35: method Step.map
- 40: method Step.merge
- 46: method Step.toJSON
- 50: method Step.fromJSON
- 61: method Step.jsonID
- 71: export class StepResult
- 73: constructor StepResult.constructor
- 81: method StepResult.ok
- 84: method StepResult.fail
- 89: method StepResult.fromReplace

### transform/src/structure.ts

- 7: function canCut
- 15: export function liftTarget
- 30: export function lift
- 66: export function findWrapping
- 79: function withAttrs
- 81: function findWrappingOutside
- 89: function findWrappingInside
- 102: export function wrap
- 117: export function setBlockType
- 144: function replaceNewlines
- 156: function replaceLinebreaks
- 165: function canChangeType
- 172: export function setNodeMarkup
- 189: export function canSplit
- 213: export function split
- 225: export function canJoin
- 231: function canAppendWithSubstitutedLinebreaks
- 245: function joinable
- 252: export function joinPoint
- 274: export function join
- 305: export function insertPoint
- 328: export function dropPoint

### transform/src/transform.ts

- 11: export variable TransformError
- 28: export class Transform
- 30: property Transform.steps
- 32: property Transform.docs
- 34: property Transform.mapping
- 37: constructor Transform.constructor
- 44: getter Transform.before
- 48: method Transform.step
- 56: method Transform.maybeStep
- 64: getter Transform.docChanged
- 72: method Transform.changedRange
- 89: method Transform.addStep
- 98: method Transform.replace
- 106: method Transform.replaceWith
- 111: method Transform.delete
- 116: method Transform.insert
- 137: method Transform.replaceRange
- 149: method Transform.replaceRangeWith
- 156: method Transform.deleteRange
- 166: method Transform.lift
- 173: method Transform.join
- 181: method Transform.wrap
- 188: method Transform.setBlockType
- 195: method Transform.setNodeMarkup
- 203: method Transform.setNodeAttribute
- 209: method Transform.setDocAttribute
- 215: method Transform.addNodeMark
- 222: method Transform.removeNodeMark
- 243: method Transform.split
- 249: method Transform.addMark
- 258: method Transform.removeMark
- 267: method Transform.clearIncompatible

## state

### state/src/index.ts

- 1: export re-export "./selection"
- 3: export re-export "./transaction"
- 5: export re-export "./state"
- 7: export re-export "./plugin"

### state/src/plugin.ts

- 7: export interface PluginSpec
- 11: property PluginSpec.props
- 15: property PluginSpec.state
- 21: property PluginSpec.key
- 27: property PluginSpec.view
- 32: property PluginSpec.filterTransaction
- 40: property PluginSpec.appendTransaction
- 44: index-signature PluginSpec.[]
- 49: export type PluginView
- 58: function bindProps
- 71: export class Plugin
- 73: constructor Plugin.constructor
- 82: property Plugin.props
- 85: property Plugin.key
- 88: method Plugin.getState
- 95: export interface StateField
- 100: property StateField.init
- 106: property StateField.apply
- 110: property StateField.toJSON
- 114: property StateField.fromJSON
- 117: variable keys
- 119: function createKey
- 129: export class PluginKey
- 131: property PluginKey.key
- 134: constructor PluginKey.constructor
- 138: method PluginKey.get
- 141: method PluginKey.getState

### state/src/selection.ts

- 5: variable classesById
- 9: export class Selection
- 13: constructor Selection.constructor
- 26: property Selection.ranges
- 29: getter Selection.anchor
- 32: getter Selection.head
- 35: getter Selection.from
- 38: getter Selection.to
- 41: getter Selection.$from
- 46: getter Selection.$to
- 51: getter Selection.empty
- 59: method Selection.eq
- 63: method Selection.map
- 66: method Selection.content
- 72: method Selection.replace
- 93: method Selection.replaceWith
- 111: method Selection.toJSON
- 118: method Selection.findFrom
- 135: method Selection.near
- 143: method Selection.atStart
- 149: method Selection.atEnd
- 155: method Selection.fromJSON
- 166: method Selection.jsonID
- 180: method Selection.getBookmark
- 187: property Selection.visible
- 195: export interface SelectionBookmark
- 197: property SelectionBookmark.map
- 203: property SelectionBookmark.resolve
- 207: export class SelectionRange
- 209: constructor SelectionRange.constructor
- 217: variable warnedAboutTextSelection
- 218: function checkTextSelection
- 229: export class TextSelection
- 231: constructor TextSelection.constructor
- 239: getter TextSelection.$cursor
- 241: method TextSelection.map
- 248: method TextSelection.replace
- 256: method TextSelection.eq
- 260: method TextSelection.getBookmark
- 264: method TextSelection.toJSON
- 269: method TextSelection.fromJSON
- 276: method TextSelection.create
- 287: method TextSelection.between
- 309: class TextBookmark
- 310: constructor TextBookmark.constructor
- 312: method TextBookmark.map
- 315: method TextBookmark.resolve
- 325: export class NodeSelection
- 328: constructor NodeSelection.constructor
- 336: property NodeSelection.node
- 338: method NodeSelection.map
- 345: method NodeSelection.content
- 349: method NodeSelection.eq
- 353: method NodeSelection.toJSON
- 357: method NodeSelection.getBookmark
- 360: method NodeSelection.fromJSON
- 367: method NodeSelection.create
- 373: method NodeSelection.isSelectable
- 382: class NodeBookmark
- 383: constructor NodeBookmark.constructor
- 384: method NodeBookmark.map
- 388: method NodeBookmark.resolve
- 399: export class AllSelection
- 401: constructor AllSelection.constructor
- 405: method AllSelection.replace
- 415: method AllSelection.toJSON
- 418: method AllSelection.fromJSON
- 420: method AllSelection.map
- 422: method AllSelection.eq
- 424: method AllSelection.getBookmark
- 429: variable AllBookmark
- 439: function findSelectionIn
- 454: function selectionToInsertionEnd

### state/src/state.ts

- 7: function bind
- 11: class FieldDesc
- 12: property FieldDesc.init
- 13: property FieldDesc.apply
- 15: constructor FieldDesc.constructor
- 21: variable baseFields
- 45: class Configuration
- 46: property Configuration.fields
- 47: property Configuration.plugins
- 48: property Configuration.pluginsByKey
- 50: constructor Configuration.constructor
- 65: export interface EditorStateConfig
- 67: property EditorStateConfig.schema
- 71: property EditorStateConfig.doc
- 74: property EditorStateConfig.selection
- 77: property EditorStateConfig.storedMarks
- 80: property EditorStateConfig.plugins
- 90: export class EditorState
- 92: constructor EditorState.constructor
- 98: property EditorState.doc
- 101: property EditorState.selection
- 105: property EditorState.storedMarks
- 108: getter EditorState.schema
- 113: getter EditorState.plugins
- 118: method EditorState.apply
- 123: method EditorState.filterTransaction
- 137: method EditorState.applyTransaction
- 171: method EditorState.applyInner
- 182: getter EditorState.tr
- 185: method EditorState.create
- 199: method EditorState.reconfigure
- 217: method EditorState.toJSON
- 234: method EditorState.fromJSON

### state/src/transaction.ts

- 18: export type Command
- 20: variable UPDATED_SEL
- 20: variable UPDATED_MARKS
- 20: variable UPDATED_SCROLL
- 42: export class Transaction
- 45: property Transaction.time
- 47: property Transaction.curSelection
- 49: property Transaction.curSelectionFor
- 52: property Transaction.updated
- 54: property Transaction.meta
- 57: property Transaction.storedMarks
- 60: constructor Transaction.constructor
- 71: getter Transaction.selection
- 81: method Transaction.setSelection
- 92: getter Transaction.selectionSet
- 97: method Transaction.setStoredMarks
- 106: method Transaction.ensureMarks
- 113: method Transaction.addStoredMark
- 118: method Transaction.removeStoredMark
- 123: getter Transaction.storedMarksSet
- 128: method Transaction.addStep
- 135: method Transaction.setTime
- 141: method Transaction.replaceSelection
- 149: method Transaction.replaceSelectionWith
- 158: method Transaction.deleteSelection
- 165: method Transaction.insertText
- 187: method Transaction.setMeta
- 193: method Transaction.getMeta
- 199: getter Transaction.isGeneric
- 206: method Transaction.scrollIntoView
- 212: getter Transaction.scrolledIntoView

## view

### view/src/browser.ts

- 1: variable nav
- 2: variable doc
- 3: variable agent
- 5: variable ie_edge
- 6: variable ie_upto10
- 7: variable ie_11up
- 9: export variable ie
- 10: export variable ie_version
- 11: export variable gecko
- 12: export variable gecko_version
- 14: variable \_chrome
- 15: export variable chrome
- 16: export variable chrome_version
- 17: export variable safari
- 19: export variable ios
- 20: export variable mac
- 21: export variable windows
- 22: export variable android
- 23: export variable webkit
- 24: export variable webkit_version

### view/src/capturekeys.ts

- 7: function moveSelectionBlock
- 14: function apply
- 19: function selectHorizontally
- 58: function nodeLen
- 62: function isIgnorable
- 67: function skipIgnoredNodes
- 73: function skipIgnoredNodesBefore
- 121: function skipIgnoredNodesAfter
- 159: function isBlockNode
- 164: function textNodeAfter
- 178: function textNodeBefore
- 192: function setSelFocus
- 223: function findDirection
- 247: function selectVertically
- 266: function stopNativeHorizontalDelete
- 283: function switchEditable
- 294: function safariDownArrowBug
- 313: function getMods
- 322: export function captureKeyDown

### view/src/clipboard.ts

- 5: export function serializeForClipboard
- 43: export function parseFromClipboard
- 112: variable inlineParents
- 122: function normalizeSiblings
- 147: function withWrappers
- 155: function addToSibling
- 166: function closeRight
- 173: function closeRange
- 183: function closeSlice
- 194: variable wrapMap
- 206: variable \_detachedDoc
- 207: function detachedDoc
- 211: variable \_policy
- 213: function maybeWrapTrusted
- 224: function readHTML
- 241: function restoreReplacedSpaces
- 250: function addContext

### view/src/decoration.ts

- 6: function compareObjs
- 13: export interface DecorationType
- 14: property DecorationType.spec
- 15: method DecorationType.map
- 16: method DecorationType.valid
- 17: method DecorationType.eq
- 18: method DecorationType.destroy
- 21: export type WidgetConstructor
- 23: export class WidgetType
- 24: property WidgetType.spec
- 25: property WidgetType.side
- 27: constructor WidgetType.constructor
- 32: method WidgetType.map
- 37: method WidgetType.valid
- 39: method WidgetType.eq
- 46: method WidgetType.destroy
- 51: export class InlineType
- 52: property InlineType.spec
- 54: constructor InlineType.constructor
- 58: method InlineType.map
- 64: method InlineType.valid
- 66: method InlineType.eq
- 72: method InlineType.is
- 74: method InlineType.destroy
- 77: export class NodeType
- 78: property NodeType.spec
- 79: constructor NodeType.constructor
- 83: method NodeType.map
- 91: method NodeType.valid
- 96: method NodeType.eq
- 102: method NodeType.destroy
- 108: export class Decoration
- 110: constructor Decoration.constructor
- 121: method Decoration.copy
- 126: method Decoration.eq
- 131: method Decoration.map
- 141: method Decoration.widget
- 207: method Decoration.inline
- 229: method Decoration.node
- 235: getter Decoration.spec
- 238: getter Decoration.inline
- 241: getter Decoration.widget
- 247: export type DecorationAttrs
- 263: variable none
- 263: variable noSpec
- 268: export interface DecorationSource
- 271: property DecorationSource.map
- 273: method DecorationSource.locals
- 275: method DecorationSource.forChild
- 277: method DecorationSource.eq
- 279: method DecorationSource.forEachSet
- 286: export class DecorationSet
- 288: property DecorationSet.local
- 290: property DecorationSet.children
- 293: constructor DecorationSet.constructor
- 301: method DecorationSet.create
- 311: method DecorationSet.find
- 317: method DecorationSet.findInner
- 334: method DecorationSet.map
- 345: method DecorationSet.mapInner
- 365: method DecorationSet.add
- 371: method DecorationSet.addInner
- 395: method DecorationSet.remove
- 400: method DecorationSet.removeInner
- 431: method DecorationSet.forChild
- 456: method DecorationSet.eq
- 472: method DecorationSet.locals
- 477: method DecorationSet.localsInner
- 489: property DecorationSet.empty
- 492: property DecorationSet.removeOverlap
- 494: method DecorationSet.forEachSet
- 497: variable empty
- 502: class DecorationGroup
- 503: constructor DecorationGroup.constructor
- 505: method DecorationGroup.map
- 512: method DecorationGroup.forChild
- 524: method DecorationGroup.eq
- 532: method DecorationGroup.locals
- 552: method DecorationGroup.from
- 563: method DecorationGroup.forEachSet
- 568: function mapChildren
- 655: function moveSpans
- 665: function mapAndGatherRemainingDecorations
- 690: function takeSpansForNode
- 702: function withoutNulls
- 713: function buildTree
- 740: function byPos
- 748: function removeOverlap
- 778: function insertAhead
- 784: export function viewDecorations

### view/src/dom.ts

- 1: export type DOMNode
- 2: export type DOMSelection
- 3: export type DOMSelectionRange
- 8: export variable domIndex
- 15: export variable parentNode
- 20: variable reusedRange
- 25: export variable textRange
- 32: export variable clearReusedRange
- 39: export variable isEquivalentPosition
- 44: variable atomElements
- 46: function scanFor
- 71: export function nodeSize
- 75: export function textNodeBefore
- 91: export function textNodeAfter
- 107: export function isOnEdge
- 118: export function hasBlockDesc
- 126: export variable selectionCollapsed
- 131: export function keyEvent
- 139: export function deepActiveElement
- 145: export function caretFromPoint

### view/src/domchange.ts

- 15: function parseBetween
- 58: function ruleFromNode
- 79: variable isInline
- 81: export function readDOMChange
- 279: function resolveSelection
- 287: function isMarkChange
- 308: function looksLikeBackspace
- 336: function skipClosingAndOpening
- 353: function findDiff
- 379: function isSurrogatePair

### view/src/domcoords.ts

- 6: export type Rect
- 8: function windowRect
- 18: function getSide
- 22: function clientRect
- 32: export function scrollRectIntoView
- 73: export function storeScrollPos
- 94: function scrollStack
- 105: export function resetScrollPos
- 114: function restoreScrollStack
- 122: variable preventScrollSupported
- 125: export function focusPreventScroll
- 142: function findOffsetInNode
- 185: function findOffsetInText
- 202: function inRect
- 207: function targetKludge
- 214: function posFromElement
- 223: function posFromCaret
- 256: function elementFromPoint
- 275: export function posAtCoords
- 331: function nonZero
- 335: function singleRect
- 344: variable BIDI
- 348: export function coordsAtPos
- 413: function flattenV
- 419: function flattenH
- 425: function withFlushedState
- 439: function endOfTextblockVertical
- 468: variable maybeRTL
- 470: function endOfTextblockHorizontal
- 504: export type TextblockDir
- 506: variable cachedState
- 507: variable cachedDir
- 508: variable cachedResult
- 509: export function endOfTextblock

### view/src/domobserver.ts

- 7: variable observeOptions
- 16: variable useCharData
- 18: class SelectionState
- 19: property SelectionState.anchorNode
- 20: property SelectionState.anchorOffset
- 21: property SelectionState.focusNode
- 22: property SelectionState.focusOffset
- 24: method SelectionState.set
- 29: method SelectionState.clear
- 33: method SelectionState.eq
- 39: export class DOMObserver
- 40: property DOMObserver.queue
- 41: property DOMObserver.flushingSoon
- 42: property DOMObserver.observer
- 43: property DOMObserver.currentSelection
- 44: property DOMObserver.onCharData
- 45: property DOMObserver.suppressingSelectionUpdates
- 46: property DOMObserver.lastChangedTextNode
- 48: constructor DOMObserver.constructor
- 83: method DOMObserver.flushSoon
- 88: method DOMObserver.forceFlush
- 96: method DOMObserver.start
- 106: method DOMObserver.stop
- 119: method DOMObserver.connectSelection
- 123: method DOMObserver.disconnectSelection
- 127: method DOMObserver.suppressSelectionUpdates
- 132: method DOMObserver.onSelectionChange
- 147: method DOMObserver.setCurSelection
- 151: method DOMObserver.ignoreSelectionChange
- 169: method DOMObserver.pendingRecords
- 174: method DOMObserver.flush
- 252: method DOMObserver.registerMutation
- 305: variable cssChecked
- 306: variable cssCheckWarned
- 308: function checkCSS
- 319: function rangeToSelectionRange
- 334: export function safariShadowSelectionRange
- 359: function blockParent
- 371: function fixUpBadSafariComposition

### view/src/index.ts

- 16: export re-export "./decoration"
- 17: export re-export "./viewdesc"
- 23: export variable \_\_parseFromClipboard
- 25: export variable \_\_endComposition
- 30: export class EditorView
- 32: property EditorView.\_props
- 33: property EditorView.directPlugins
- 34: property EditorView.\_root
- 36: property EditorView.focused
- 38: property EditorView.trackWrites
- 39: property EditorView.mounted
- 41: property EditorView.markCursor
- 43: property EditorView.cursorWrapper
- 45: property EditorView.nodeViews
- 47: property EditorView.lastSelectedViewDesc
- 49: property EditorView.docView
- 51: property EditorView.input
- 52: property EditorView.prevDirectPlugins
- 53: property EditorView.pluginViews
- 55: property EditorView.domObserver
- 59: property EditorView.requiresGeckoHackNode
- 62: property EditorView.state
- 69: constructor EditorView.constructor
- 97: property EditorView.dom
- 100: property EditorView.editable
- 105: property EditorView.dragging
- 110: getter EditorView.composing
- 113: getter EditorView.props
- 125: method EditorView.update
- 139: method EditorView.setProps
- 149: method EditorView.updateState
- 153: method EditorView.updateStateInner
- 236: method EditorView.scrollToSelection
- 250: method EditorView.destroyPluginViews
- 255: method EditorView.updatePluginViews
- 275: method EditorView.updateDraggedNode
- 294: method EditorView.someProp
- 298: method EditorView.someProp
- 299: method EditorView.someProp
- 317: method EditorView.hasFocus
- 337: method EditorView.focus
- 348: getter EditorView.root
- 362: method EditorView.updateRoot
- 373: method EditorView.posAtCoords
- 383: method EditorView.coordsAtPos
- 395: method EditorView.domAtPos
- 407: method EditorView.nodeDOM
- 420: method EditorView.posAtDOM
- 432: method EditorView.endOfTextblock
- 439: method EditorView.pasteHTML
- 444: method EditorView.pasteText
- 454: method EditorView.serializeForClipboard
- 460: method EditorView.destroy
- 478: getter EditorView.isDestroyed
- 483: method EditorView.dispatchEvent
- 494: property EditorView.dispatch
- 497: method EditorView.domSelectionRange
- 505: method EditorView.domSelection
- 516: function computeDocDeco
- 537: function updateCursorWrapper
- 550: function getEditable
- 554: function selectionContextChanged
- 559: function buildNodeViews
- 570: function changedNodeViews
- 580: function checkStateComponent
- 587: export type NodeViewConstructor
- 592: export type MarkViewConstructor
- 594: type NodeViewSet
- 599: export interface DOMEventMap
- 600: index-signature DOMEventMap.[]
- 620: export interface EditorProps
- 628: property EditorProps.handleDOMEvents
- 633: property EditorProps.handleKeyDown
- 636: property EditorProps.handleKeyPress
- 641: property EditorProps.handleTextInput
- 645: property EditorProps.handleClickOn
- 649: property EditorProps.handleClick
- 652: property EditorProps.handleDoubleClickOn
- 655: property EditorProps.handleDoubleClick
- 658: property EditorProps.handleTripleClickOn
- 661: property EditorProps.handleTripleClick
- 666: property EditorProps.handlePaste
- 671: property EditorProps.handleDrop
- 677: property EditorProps.handleScrollToSelection
- 682: property EditorProps.dragCopies
- 686: property EditorProps.createSelectionBetween
- 692: property EditorProps.domParser
- 696: property EditorProps.transformPastedHTML
- 701: property EditorProps.clipboardParser
- 705: property EditorProps.transformPastedText
- 714: property EditorProps.clipboardTextParser
- 719: property EditorProps.transformPasted
- 723: property EditorProps.transformCopied
- 750: property EditorProps.nodeViews
- 757: property EditorProps.markViews
- 766: property EditorProps.clipboardSerializer
- 772: property EditorProps.clipboardTextSerializer
- 776: property EditorProps.decorations
- 780: property EditorProps.editable
- 790: property EditorProps.attributes
- 795: property EditorProps.scrollThreshold
- 799: property EditorProps.scrollMargin
- 804: export interface DirectEditorProps
- 806: property DirectEditorProps.state
- 815: property DirectEditorProps.plugins
- 824: property DirectEditorProps.dispatchTransaction

### view/src/input.ts

- 15: variable handlers
- 16: variable editHandlers
- 17: variable passiveHandlers
- 19: export class InputState
- 20: property InputState.shiftKey
- 21: property InputState.mouseDown
- 22: property InputState.lastKeyCode
- 23: property InputState.lastKeyCodeTime
- 24: property InputState.lastClick
- 25: property InputState.lastSelectionOrigin
- 26: property InputState.lastSelectionTime
- 27: property InputState.lastIOSEnter
- 28: property InputState.lastIOSEnterFallbackTimeout
- 29: property InputState.lastFocus
- 30: property InputState.lastTouch
- 31: property InputState.lastChromeDelete
- 32: property InputState.composing
- 33: property InputState.compositionNode
- 34: property InputState.composingTimeout
- 35: property InputState.compositionNodes
- 36: property InputState.compositionEndedAt
- 37: property InputState.compositionID
- 38: property InputState.badSafariComposition
- 40: property InputState.compositionPendingChanges
- 41: property InputState.domChangeCount
- 42: property InputState.eventHandlers
- 43: property InputState.hideSelectionGuard
- 46: export function initInput
- 63: function setSelectionOrigin
- 68: export function destroyInput
- 76: export function ensureListeners
- 83: function runCustomHandler
- 90: function eventBelongsToView
- 100: export function dispatchEvent
- 162: function eventCoords
- 164: function isNear
- 169: function runHandlerOnContext
- 186: function updateSelection
- 194: function selectClickedLeaf
- 204: function selectClickedNode
- 230: function handleSingleClick
- 236: function handleDoubleClick
- 241: function handleTripleClick
- 247: function defaultTripleClick
- 272: function forceDOMFlush
- 276: variable selectNodeModifier
- 303: class MouseDown
- 304: property MouseDown.startDoc
- 305: property MouseDown.selectNode
- 306: property MouseDown.allowDefault
- 307: property MouseDown.delayedSelectionSync
- 308: property MouseDown.mightDrag
- 309: property MouseDown.target
- 311: constructor MouseDown.constructor
- 361: method MouseDown.done
- 374: method MouseDown.up
- 409: method MouseDown.move
- 415: method MouseDown.updateAllowDefault
- 435: function inOrNearComposition
- 455: variable timeoutComposition
- 495: function selectionBeforeUneditable
- 515: function scheduleComposeEnd
- 520: export function clearComposition
- 528: export function findCompositionNode
- 547: function timestampFromCustomEvent
- 554: export function endComposition
- 568: function captureCopy
- 592: variable brokenClipboardAPI
- 614: function sliceSingleNode
- 618: function capturePaste
- 634: export function doPaste
- 647: function getText
- 669: export class Dragging
- 670: constructor Dragging.constructor
- 673: variable dragCopyModifier
- 675: function dragMoves
- 728: function handleDrop

### view/src/selection.ts

- 9: export function selectionFromDOM
- 50: function editorOwnsSelection
- 55: export function selectionToDOM
- 108: variable brokenSelectBetweenUneditable
- 110: function temporarilyEditableNear
- 122: function setEditable
- 128: function resetEditable
- 133: function removeClassOnSelectionChange
- 149: function selectCursorWrapper
- 166: export function syncNodeSelection
- 180: function clearNodeSelection
- 188: export function selectionBetween
- 193: export function hasFocusAndSelection
- 198: export function hasSelection
- 212: export function anchorInRightPlace

### view/src/viewdesc.ts

- 9: namespace global
- 21: export type ViewMutationRecord
- 31: export interface NodeView
- 33: property NodeView.dom
- 41: property NodeView.contentDOM
- 53: property NodeView.update
- 61: property NodeView.multiType
- 65: property NodeView.selectNode
- 69: property NodeView.deselectNode
- 76: property NodeView.setSelection
- 81: property NodeView.stopEvent
- 86: property NodeView.ignoreMutation
- 90: property NodeView.destroy
- 100: export interface MarkView
- 102: property MarkView.dom
- 106: property MarkView.contentDOM
- 111: property MarkView.ignoreMutation
- 116: property MarkView.destroy
- 132: variable NOT_DIRTY
- 132: variable CHILD_DIRTY
- 132: variable CONTENT_DIRTY
- 132: variable NODE_DIRTY
- 136: export class ViewDesc
- 137: property ViewDesc.dirty
- 138: property ViewDesc.node
- 140: constructor ViewDesc.constructor
- 155: method ViewDesc.matchesWidget
- 156: method ViewDesc.matchesMark
- 157: method ViewDesc.matchesNode
- 158: method ViewDesc.matchesHack
- 163: method ViewDesc.parseRule
- 167: method ViewDesc.stopEvent
- 170: getter ViewDesc.size
- 178: getter ViewDesc.border
- 180: method ViewDesc.destroy
- 187: method ViewDesc.posBeforeChild
- 195: getter ViewDesc.posBefore
- 199: getter ViewDesc.posAtStart
- 203: getter ViewDesc.posAfter
- 207: getter ViewDesc.posAtEnd
- 211: method ViewDesc.localPosFromDOM
- 260: method ViewDesc.nearestDesc
- 261: method ViewDesc.nearestDesc
- 262: method ViewDesc.nearestDesc
- 276: method ViewDesc.getDesc
- 281: method ViewDesc.posFromDOM
- 291: method ViewDesc.descAt
- 308: method ViewDesc.domFromPos
- 343: method ViewDesc.parseRange
- 388: method ViewDesc.emptyChildAt
- 394: method ViewDesc.domAfterPos
- 406: method ViewDesc.setSelection
- 488: method ViewDesc.ignoreMutation
- 492: getter ViewDesc.contentLost
- 498: method ViewDesc.markDirty
- 519: method ViewDesc.markParentsDirty
- 527: getter ViewDesc.domAtom
- 529: getter ViewDesc.ignoreForCoords
- 531: getter ViewDesc.ignoreForSelection
- 533: method ViewDesc.isText
- 538: class WidgetViewDesc
- 539: constructor WidgetViewDesc.constructor
- 559: method WidgetViewDesc.matchesWidget
- 563: method WidgetViewDesc.parseRule
- 565: method WidgetViewDesc.stopEvent
- 570: method WidgetViewDesc.ignoreMutation
- 574: method WidgetViewDesc.destroy
- 579: getter WidgetViewDesc.domAtom
- 581: getter WidgetViewDesc.ignoreForSelection
- 583: getter WidgetViewDesc.side
- 586: class CompositionViewDesc
- 587: constructor CompositionViewDesc.constructor
- 591: getter CompositionViewDesc.size
- 593: method CompositionViewDesc.localPosFromDOM
- 598: method CompositionViewDesc.domFromPos
- 602: method CompositionViewDesc.ignoreMutation
- 612: class MarkViewDesc
- 613: constructor MarkViewDesc.constructor
- 617: method MarkViewDesc.create
- 625: method MarkViewDesc.parseRule
- 630: method MarkViewDesc.matchesMark
- 632: method MarkViewDesc.markDirty
- 643: method MarkViewDesc.slice
- 653: method MarkViewDesc.ignoreMutation
- 657: method MarkViewDesc.destroy
- 666: export class NodeViewDesc
- 667: constructor NodeViewDesc.constructor
- 690: method NodeViewDesc.create
- 725: method NodeViewDesc.parseRule
- 754: method NodeViewDesc.matchesNode
- 759: getter NodeViewDesc.size
- 761: getter NodeViewDesc.border
- 767: method NodeViewDesc.updateChildren
- 815: method NodeViewDesc.localCompositionInfo
- 835: method NodeViewDesc.protectLocalComposition
- 856: method NodeViewDesc.update
- 863: method NodeViewDesc.updateInner
- 871: method NodeViewDesc.updateOuterDeco
- 886: method NodeViewDesc.selectNode
- 894: method NodeViewDesc.deselectNode
- 901: getter NodeViewDesc.domAtom
- 906: export function docViewDesc
- 914: class TextViewDesc
- 915: constructor TextViewDesc.constructor
- 920: method TextViewDesc.parseRule
- 926: method TextViewDesc.update
- 939: method TextViewDesc.inParent
- 945: method TextViewDesc.domFromPos
- 949: method TextViewDesc.localPosFromDOM
- 954: method TextViewDesc.ignoreMutation
- 958: method TextViewDesc.slice
- 963: method TextViewDesc.markDirty
- 969: getter TextViewDesc.domAtom
- 971: method TextViewDesc.isText
- 976: class TrailingHackViewDesc
- 977: method TrailingHackViewDesc.parseRule
- 978: method TrailingHackViewDesc.matchesHack
- 979: getter TrailingHackViewDesc.domAtom
- 980: getter TrailingHackViewDesc.ignoreForCoords
- 986: class CustomNodeViewDesc
- 987: constructor CustomNodeViewDesc.constructor
- 996: method CustomNodeViewDesc.update
- 1009: method CustomNodeViewDesc.selectNode
- 1013: method CustomNodeViewDesc.deselectNode
- 1017: method CustomNodeViewDesc.setSelection
- 1022: method CustomNodeViewDesc.destroy
- 1027: method CustomNodeViewDesc.stopEvent
- 1031: method CustomNodeViewDesc.ignoreMutation
- 1039: function renderDescs
- 1060: type OuterDecoLevel
- 1062: variable OuterDecoLevel
- 1067: variable noDeco
- 1069: function computeOuterDeco
- 1094: function patchOuterDeco
- 1120: function patchAttributes
- 1148: function applyOuterDeco
- 1152: function sameOuterDeco
- 1159: function rm
- 1167: class ViewTreeUpdater
- 1170: property ViewTreeUpdater.index
- 1173: property ViewTreeUpdater.stack
- 1175: property ViewTreeUpdater.changed
- 1176: property ViewTreeUpdater.preMatch
- 1177: property ViewTreeUpdater.top
- 1179: constructor ViewTreeUpdater.constructor
- 1186: method ViewTreeUpdater.destroyBetween
- 1194: method ViewTreeUpdater.destroyRest
- 1200: method ViewTreeUpdater.syncToMarks
- 1242: method ViewTreeUpdater.findNodeMatch
- 1263: method ViewTreeUpdater.updateNodeAt
- 1272: method ViewTreeUpdater.findIndexWithChild
- 1289: method ViewTreeUpdater.updateNextNode
- 1329: method ViewTreeUpdater.recreateWrapper
- 1345: method ViewTreeUpdater.addNode
- 1352: method ViewTreeUpdater.placeWidget
- 1366: method ViewTreeUpdater.addTextblockHacks
- 1384: method ViewTreeUpdater.addHackNode
- 1401: method ViewTreeUpdater.isLocked
- 1409: function preMatch
- 1450: function compareSide
- 1458: function iterDeco
- 1533: function iosHacks
- 1543: function findTextInFragment
- 1574: function replaceNodes

## keymap

### keymap/src/keymap.ts

- 5: variable mac
- 6: variable windows
- 8: function normalizeKeyName
- 28: function normalize
- 39: function modifiers
- 76: export function keymap
- 83: export function keydownHandler

## inputrules

### inputrules/src/index.ts

- 1: export re-export "./inputrules"
- 2: export re-export "./rules"
- 4: export re-export "./rulebuilders"

### inputrules/src/inputrules.ts

- 8: export class InputRule
- 10: property InputRule.handler
- 13: property InputRule.undoable
- 14: property InputRule.inCode
- 15: property InputRule.inCodeMark
- 31: constructor InputRule.constructor
- 58: function stringHandler
- 75: variable MAX_MATCH
- 77: type PluginState
- 82: export function inputRules
- 112: function run
- 146: export variable undoInputRule

### inputrules/src/rulebuilders.ts

- 20: export function wrappingInputRule
- 46: export function textblockTypeInputRule

### inputrules/src/rules.ts

- 4: export variable emDash
- 6: export variable ellipsis
- 8: export variable openDoubleQuote
- 10: export variable closeDoubleQuote
- 12: export variable openSingleQuote
- 14: export variable closeSingleQuote
- 17: export variable smartQuotes

## history

### history/src/history.ts

- 22: variable max_empty_items
- 24: class Branch
- 25: constructor Branch.constructor
- 29: method Branch.popEvent
- 83: method Branch.addTransform
- 111: method Branch.remapping
- 121: method Branch.addMaps
- 130: method Branch.rebased
- 167: method Branch.emptyItemCount
- 179: method Branch.compress
- 206: property Branch.empty
- 209: function cutOffEvents
- 220: class Item
- 221: constructor Item.constructor
- 235: method Item.merge
- 246: class HistoryState
- 247: constructor HistoryState.constructor
- 256: variable DEPTH_OVERFLOW
- 259: function applyTransaction
- 300: function isAdjacentTo
- 312: function rangesFor
- 319: function mapRanges
- 331: function histTransaction
- 345: variable cachedPreserveItems
- 345: variable cachedPreserveItemsPlugins
- 350: function mustPreserveItems
- 366: export function closeHistory
- 370: variable historyKey
- 371: variable closeHistoryKey
- 373: interface HistoryOptions
- 376: property HistoryOptions.depth
- 381: property HistoryOptions.newGroupDelay
- 391: export function history
- 423: function buildCommand
- 436: export variable undo
- 439: export variable redo
- 443: export variable undoNoScroll
- 447: export variable redoNoScroll
- 450: export function undoDepth
- 456: export function redoDepth
- 463: export function isHistoryTransaction

## collab

### collab/src/collab.ts

- 4: class Rebaseable
- 5: constructor Rebaseable.constructor
- 14: export function rebaseSteps
- 34: class CollabState
- 35: constructor CollabState.constructor
- 47: function unconfirmedFrom
- 56: variable collabKey
- 58: type CollabConfig
- 70: export function collab
- 102: export function receiveTransaction
- 162: export function sendableSteps
- 182: export function getVersion

## commands

### commands/src/commands.ts

- 9: export variable deleteSelection
- 15: function atBlockStart
- 30: export variable joinBackward
- 80: export variable joinTextblockBackward
- 90: export variable joinTextblockForward
- 97: function joinTextblocksAround
- 124: function textblockAt
- 138: export variable selectNodeBackward
- 153: function findCutBefore
- 161: function atBlockEnd
- 174: export variable joinForward
- 217: export variable selectNodeForward
- 232: function findCutAfter
- 244: export variable joinUp
- 263: export variable joinDown
- 279: export variable lift
- 290: export variable newlineInCode
- 297: function defaultBlockAt
- 308: export variable exitCode
- 323: export variable createParagraphNear
- 339: export variable liftEmptyBlock
- 357: export function splitBlockAs
- 409: export variable splitBlock
- 413: export variable splitBlockKeepMarks
- 423: export variable selectParentNode
- 433: export variable selectAll
- 438: function joinMaybeClear
- 452: function deleteBarrier
- 507: function selectTextblockSide
- 524: export variable selectTextblockStart
- 527: export variable selectTextblockEnd
- 533: export function wrapIn
- 545: export function setBlockType
- 574: function markApplies
- 588: function removeInlineAtoms
- 611: export function toggleMark
- 673: function wrapDispatchForJoin
- 717: export function autoJoin
- 728: export function chainCommands
- 736: variable backspace
- 737: variable del
- 749: export variable pcBaseKeymap
- 764: export variable macBaseKeymap
- 776: variable mac
- 783: export variable baseKeymap

## gapcursor

### gapcursor/src/gapcursor.ts

- 7: export class GapCursor
- 9: constructor GapCursor.constructor
- 13: method GapCursor.map
- 18: method GapCursor.content
- 20: method GapCursor.eq
- 24: method GapCursor.toJSON
- 29: method GapCursor.fromJSON
- 35: method GapCursor.getBookmark
- 38: method GapCursor.valid
- 48: method GapCursor.findGapCursorFrom
- 94: class GapBookmark
- 95: constructor GapBookmark.constructor
- 97: method GapBookmark.map
- 100: method GapBookmark.resolve
- 106: function needsGap
- 110: function closedBefore
- 128: function closedAfter

### gapcursor/src/index.ts

- 15: export function gapCursor
- 31: export re-export {GapCursor}
- 33: variable handleKeyDown
- 40: function arrow
- 57: function handleClick
- 71: function beforeinput
- 86: function drawGapCursor

## schema-basic

### schema-basic/src/schema-basic.ts

- 3: variable pDOM
- 3: variable blockquoteDOM
- 4: variable hrDOM
- 4: variable preDOM
- 5: variable brDOM
- 8: export variable nodes
- 106: variable emDOM
- 106: variable strongDOM
- 106: variable codeDOM
- 109: export variable marks
- 166: export variable schema

## schema-list

### schema-list/src/schema-list.ts

- 6: variable olDOM
- 6: variable ulDOM
- 6: variable liDOM
- 12: export variable orderedList
- 23: export variable bulletList
- 29: export variable listItem
- 35: function add
- 54: export function addListNodes
- 66: export function wrapInList
- 83: export function wrapRangeInList
- 101: function doWrapInList
- 127: export function splitListItem
- 173: export function splitListItemKeepMarks
- 186: export function liftListItem
- 199: function liftToOuterList
- 217: function liftOutOfList
- 245: export function sinkListItem

## menu

### menu/src/icons.ts

- 1: variable SVG
- 2: variable XLINK
- 4: variable prefix
- 6: function hashPath
- 13: export function getIcon
- 39: function buildSVG

### menu/src/index.ts

- 1: export re-export "./menu"
- 4: export re-export "./menubar"

### menu/src/menu.ts

- 13: export interface MenuElement
- 20: method MenuElement.render
- 23: variable prefix
- 26: export class MenuItem
- 28: constructor MenuItem.constructor
- 36: method MenuItem.render
- 84: function translate
- 96: export type IconSpec
- 99: export interface MenuItemSpec
- 101: property MenuItemSpec.run
- 105: property MenuItemSpec.select
- 110: property MenuItemSpec.enable
- 115: property MenuItemSpec.active
- 119: property MenuItemSpec.render
- 122: property MenuItemSpec.icon
- 127: property MenuItemSpec.label
- 130: property MenuItemSpec.title
- 133: property MenuItemSpec.class
- 137: property MenuItemSpec.css
- 140: variable lastMenuEvent
- 141: function markMenuEvent
- 145: function isMenuEvent
- 152: export class Dropdown
- 154: property Dropdown.content
- 156: property Dropdown.focusables
- 158: property Dropdown.focusIndex
- 159: property Dropdown.focusTimeout
- 162: constructor Dropdown.constructor
- 185: method Dropdown.render
- 258: method Dropdown.expand
- 277: method Dropdown.setFocusIndex
- 287: export function findFocusableIndex
- 296: export function keyboardMoveFocus
- 314: function renderDropdownItems
- 341: function combineUpdates
- 358: export class DropdownSubmenu
- 360: property DropdownSubmenu.content
- 362: property DropdownSubmenu.focusables
- 364: property DropdownSubmenu.focusIndex
- 365: property DropdownSubmenu.focusTimeout
- 369: constructor DropdownSubmenu.constructor
- 381: method DropdownSubmenu.render
- 445: method DropdownSubmenu.setFocusIndex
- 459: export function renderGrouped
- 492: function separator
- 501: export variable icons
- 550: export variable joinUpItem
- 558: export variable liftItem
- 566: export variable selectParentNodeItem
- 574: export variable undoItem
- 582: export variable redoItem
- 593: export function wrapItem
- 610: export function blockTypeItem
- 626: function setClass

### menu/src/menubar.ts

- 7: variable prefix
- 9: function isIOS
- 17: export function menuBar
- 36: class MenuBarView
- 37: property MenuBarView.wrapper
- 38: property MenuBarView.menu
- 39: property MenuBarView.focusables
- 40: property MenuBarView.focusIndex
- 41: property MenuBarView.spacer
- 42: property MenuBarView.maxHeight
- 43: property MenuBarView.widthForMaxHeight
- 44: property MenuBarView.floating
- 45: property MenuBarView.contentUpdate
- 46: property MenuBarView.scrollHandler
- 47: property MenuBarView.root
- 49: constructor MenuBarView.constructor
- 106: method MenuBarView.setFocusIndex
- 115: method MenuBarView.update
- 143: method MenuBarView.updateScrollCursor
- 156: method MenuBarView.updateFloat
- 188: method MenuBarView.destroy
- 195: function selectionIsInverted
- 200: function findWrappingScrollable
- 205: function getAllWrapping

## example-setup

### example-setup/src/index.ts

- 14: export re-export {buildMenuItems, buildKeymap, buildInputRules}
- 42: export function exampleSetup

### example-setup/src/inputrules.ts

- 7: export function blockQuoteRule
- 13: export function orderedListRule
- 21: export function bulletListRule
- 27: export function codeBlockRule
- 35: export function headingRule
- 42: export function buildInputRules

### example-setup/src/keymap.ts

- 9: variable mac
- 38: export function buildKeymap

### example-setup/src/menu.ts

- 11: function canInsert
- 20: function insertImageItem
- 46: function cmdItem
- 58: function markActive
- 64: function markItem
- 72: function linkItem
- 101: function wrapListItem
- 105: type MenuItemResult
- 172: export function buildMenuItems

### example-setup/src/prompt.ts

- 3: variable prefix
- 5: export function openPrompt
- 79: function getValues
- 93: function reportInvalid
- 105: export class Field
- 108: constructor Field.constructor
- 130: method Field.render
- 133: method Field.read
- 136: method Field.validateType
- 139: method Field.validate
- 145: method Field.clean
- 151: export class TextField
- 152: method TextField.render
- 167: export class SelectField
- 168: method SelectField.render

## markdown

### markdown/src/from_markdown.ts

- 7: function maybeMerge
- 13: class MarkdownParseState
- 14: property MarkdownParseState.stack
- 16: constructor MarkdownParseState.constructor
- 23: method MarkdownParseState.top
- 27: method MarkdownParseState.push
- 33: method MarkdownParseState.addText
- 42: method MarkdownParseState.openMark
- 48: method MarkdownParseState.closeMark
- 53: method MarkdownParseState.parseTokens
- 64: method MarkdownParseState.addNode
- 73: method MarkdownParseState.openNode
- 78: method MarkdownParseState.closeNode
- 84: function attrs
- 93: function noCloseToken
- 97: function withoutTrailingNewline
- 101: function noOp
- 103: function tokenHandlers
- 155: export interface ParseSpec
- 159: property ParseSpec.node
- 167: property ParseSpec.block
- 173: property ParseSpec.mark
- 177: property ParseSpec.attrs
- 183: property ParseSpec.getAttrs
- 189: property ParseSpec.noCloseToken
- 192: property ParseSpec.ignore
- 199: export class MarkdownParser
- 201: property MarkdownParser.tokenHandlers
- 209: constructor MarkdownParser.constructor
- 229: method MarkdownParser.parse
- 237: function listIsTight
- 245: export variable defaultMarkdownParser

### markdown/src/index.ts

- 3: export re-export "./schema"
- 4: export re-export "./from_markdown"
- 5: export re-export "./to_markdown"

### markdown/src/schema.ts

- 4: export variable schema

### markdown/src/to_markdown.ts

- 3: type MarkSerializerSpec
- 28: variable blankMark
- 32: export class MarkdownSerializer
- 36: constructor MarkdownSerializer.constructor
- 59: method MarkdownSerializer.serialize
- 73: export variable defaultMarkdownSerializer
- 153: function backticksFor
- 162: function isPlainURL
- 172: export class MarkdownSerializerState
- 174: property MarkdownSerializerState.delim
- 176: property MarkdownSerializerState.out
- 178: property MarkdownSerializerState.closed
- 180: property MarkdownSerializerState.inAutolink
- 182: property MarkdownSerializerState.atBlockStart
- 184: property MarkdownSerializerState.inTightList
- 187: constructor MarkdownSerializerState.constructor
- 202: method MarkdownSerializerState.flushClose
- 217: method MarkdownSerializerState.getMark
- 231: method MarkdownSerializerState.wrapBlock
- 241: method MarkdownSerializerState.atBlank
- 246: method MarkdownSerializerState.ensureNewLine
- 253: method MarkdownSerializerState.write
- 261: method MarkdownSerializerState.closeBlock
- 267: method MarkdownSerializerState.text
- 280: method MarkdownSerializerState.render
- 295: method MarkdownSerializerState.renderContent
- 300: method MarkdownSerializerState.renderInline
- 415: method MarkdownSerializerState.renderList
- 434: method MarkdownSerializerState.esc
- 445: method MarkdownSerializerState.quote
- 451: method MarkdownSerializerState.repeat
- 458: method MarkdownSerializerState.markString
- 467: method MarkdownSerializerState.getEnclosingWhitespace
- 475: method MarkdownSerializerState.isMarkAhead

## dropcursor

### dropcursor/src/dropcursor.ts

- 5: interface DropCursorOptions
- 7: property DropCursorOptions.color
- 10: property DropCursorOptions.width
- 13: property DropCursorOptions.class
- 24: export function dropCursor
- 31: namespace "prosemirror-model"
- 37: class DropCursorView
- 38: property DropCursorView.width
- 39: property DropCursorView.color
- 40: property DropCursorView.class
- 41: property DropCursorView.cursorPos
- 42: property DropCursorView.element
- 43: property DropCursorView.timeout
- 44: property DropCursorView.lastDragEvent
- 45: property DropCursorView.handlers
- 47: constructor DropCursorView.constructor
- 59: method DropCursorView.destroy
- 63: method DropCursorView.update
- 77: method DropCursorView.setCursor
- 88: method DropCursorView.updateOverlay
- 140: method DropCursorView.scheduleRemoval
- 145: method DropCursorView.computeTarget
- 163: method DropCursorView.dragover
- 173: method DropCursorView.dragend
- 177: method DropCursorView.drop
- 181: method DropCursorView.dragleave

## test-builder

### test-builder/src/build.ts

- 3: type Tags
- 5: export type ChildSpec
- 7: variable noTag
- 9: function flatten
- 52: function id
- 54: function takeAttrs
- 68: export type NodeBuilder
- 69: export type MarkBuilder
- 71: type Builders
- 82: function block
- 95: function mark
- 106: export function builders

### test-builder/src/index.ts

- 6: export re-export "./build"
- 8: export variable schema
- 13: variable b
- 28: export function eq
- 30: export variable doc
- 31: export variable p
- 32: export variable code_block
- 33: export variable pre
- 34: export variable h1
- 35: export variable h2
- 36: export variable h3
- 37: export variable li
- 38: export variable ul
- 39: export variable ol
- 40: export variable img
- 41: export variable hr
- 42: export variable br
- 43: export variable blockquote
- 44: export variable a
- 45: export variable em
- 46: export variable strong
- 47: export variable code

## changeset

### changeset/src/change.ts

- 2: export class Span
- 4: constructor Span.constructor
- 12: method Span.cut
- 17: method Span.slice
- 31: method Span.join
- 43: method Span.len
- 50: property Span.none
- 54: export class Change
- 56: constructor Change.constructor
- 74: getter Change.lenA
- 76: getter Change.lenB
- 79: method Change.slice
- 91: method Change.merge
- 173: method Change.fromJSON
- 180: method Change.toJSON
- 184: export type ChangeJSON

### changeset/src/changeset.ts

- 5: export re-export {Change, Span, ChangeJSON}
- 6: export re-export "./simplify"
- 7: export re-export {TokenEncoder}
- 13: export class ChangeSet
- 15: constructor ChangeSet.constructor
- 36: method ChangeSet.addSteps
- 96: getter ChangeSet.startDoc
- 100: method ChangeSet.map
- 115: method ChangeSet.changedRange
- 154: method ChangeSet.create
- 164: property ChangeSet.computeDiff
- 168: function mergeAll
- 179: function endRange
- 195: function touchedRange
- 202: function sameRanges
- 207: function sameSpans

### changeset/src/diff.ts

- 12: export interface TokenEncoder
- 14: method TokenEncoder.encodeCharacter
- 17: method TokenEncoder.encodeNodeStart
- 20: method TokenEncoder.encodeNodeEnd
- 23: method TokenEncoder.compareTokens
- 26: function typeID
- 36: export variable DefaultEncoder
- 44: function tokens
- 67: variable MAX_DIFF_SIZE
- 74: function minUnchanged
- 78: export function computeDiff

### changeset/src/simplify.ts

- 4: variable letter
- 11: variable nonASCIISingleCaseWordChar
- 13: function isLetter
- 24: function getText
- 50: variable MAX_SIMPLIFY_DISTANCE
- 58: export function simplifyChanges
- 69: function simplifyAdjacentChanges
- 110: function combine
- 112: function fillChange

## search

### search/src/query.ts

- 4: export class SearchQuery
- 6: property SearchQuery.search
- 8: property SearchQuery.caseSensitive
- 12: property SearchQuery.literal
- 15: property SearchQuery.regexp
- 18: property SearchQuery.replace
- 21: property SearchQuery.valid
- 24: property SearchQuery.wholeWord
- 26: property SearchQuery.filter
- 29: property SearchQuery.impl
- 32: constructor SearchQuery.constructor
- 63: method SearchQuery.eq
- 70: method SearchQuery.findNext
- 81: method SearchQuery.findPrev
- 91: method SearchQuery.checkResult
- 97: method SearchQuery.unquote
- 111: method SearchQuery.getReplacements
- 143: export interface SearchResult
- 144: property SearchResult.from
- 145: property SearchResult.to
- 146: property SearchResult.match
- 147: property SearchResult.matchStart
- 150: interface QueryImpl
- 151: method QueryImpl.findNext
- 152: method QueryImpl.findPrev
- 155: variable nullQuery
- 160: class StringQuery
- 161: property StringQuery.string
- 163: constructor StringQuery.constructor
- 169: method StringQuery.findNext
- 178: method StringQuery.findPrev
- 189: variable baseFlags
- 191: class RegExpQuery
- 192: property RegExpQuery.regexp
- 194: constructor RegExpQuery.constructor
- 198: method RegExpQuery.findNext
- 207: method RegExpQuery.findPrev
- 223: function getGroupIndices
- 233: function parseReplacement
- 261: export function validRegExp
- 266: variable TextContentCache
- 268: function textContent
- 283: function scanTextblocks
- 312: function checkWordBoundary

### search/src/search.ts

- 5: export re-export {SearchQuery, SearchResult}
- 7: class SearchState
- 8: constructor SearchState.constructor
- 15: function buildMatchDeco
- 30: variable searchKey
- 34: export function search
- 67: export function getSearchState
- 76: export function getMatchHighlights
- 83: export function setSearchState
- 87: function nextMatch
- 95: function prevMatch
- 103: function findCommand
- 118: export variable findNext
- 122: export variable findNextNoWrap
- 126: export variable findPrev
- 131: export variable findPrevNoWrap
- 133: function replaceCommand
- 166: export variable replaceNext
- 170: export variable replaceNextNoWrap
- 174: export variable replaceCurrent
- 177: export variable replaceAll
