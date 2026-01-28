import {Plugin, PluginKey, Selection} from "prosemirror-state"
import {WRITE_ROLES} from "../"
import {ContentMenu} from "../../common"

const key = new PluginKey("table")

class TableView {
    constructor(node, view, getPos, options) {
        this.node = node
        this.view = view
        this.getPos = getPos
        this.options = options
        this.dom = document.createElement("div")
        this.dom.classList.add(
            `table-${node.attrs.width}`,
            `table-${node.attrs.aligned}`,
            "content-container"
        )
        this.dom.id = node.attrs.id
        this.menuButton = document.createElement("button")
        this.menuButton.classList.add("content-menu-btn")
        this.menuButton.innerHTML =
            '<span class="dot-menu-icon"><i class="fa fa-ellipsis-v"></i></span>'
        this.dom.appendChild(this.menuButton)
        const dom = document.createElement("table")
        if (node.attrs.track.length) {
            dom.dataset.track = JSON.stringify(node.attrs.track)
        }
        dom.id = node.attrs.id
        dom.dataset.width = node.attrs.width
        dom.dataset.aligned = node.attrs.aligned
        dom.dataset.layout = node.attrs.layout
        dom.class = `table-${node.attrs.width} table-${node.attrs.aligned} table-${node.attrs.layout}`
        dom.dataset.category = node.attrs.category
        if (!node.attrs.caption) {
            dom.dataset.captionHidden = true
        }
        this.contentDOM = dom
        this.dom.appendChild(this.contentDOM)
    }

    stopEvent(event) {
        let stopped = false
        if (
            event.type === "mousedown" &&
            event.composedPath().includes(this.menuButton)
        ) {
            stopped = true
            if (!isSelectedTableClicked(this.view.state, this.getPos())) {
                const tr = this.view.state.tr
                const $pos = this.view.state.doc.resolve(this.getPos())
                tr.setSelection(Selection.findFrom($pos, 1, true))
                this.view.dispatch(tr)
            }
            const contentMenu = new ContentMenu({
                menu: this.options.editor.menu.tableMenuModel,
                width: 280,
                page: this.options.editor,
                menuPos: {
                    X: Number.parseInt(event.pageX) + 20,
                    Y: Number.parseInt(event.pageY) - 100
                },
                onClose: () => {
                    this.view.focus()
                }
            })
            contentMenu.open()
        }
        return stopped
    }
}

class TableCaptionView {
    constructor(node, view, getPos, options) {
        this.node = node
        this.view = view
        this.getPos = getPos
        this.options = options

        this.dom = document.createElement("caption")
        this.dom.innerHTML = '<span class="text"></span>'
        this.contentDOM = this.dom.lastElementChild
    }
}

const isSelectedTableClicked = (state, $pos) => {
    const pathArr = state.selection.$head.path
    for (let i = 0; i < pathArr.length; i++) {
        if (
            pathArr[i].type &&
            pathArr[i].type.name &&
            pathArr[i].type.name === "table" &&
            pathArr[i - 1] === $pos
        ) {
            return true
        }
    }
    return false
}

export const tablePlugin = options =>
    new Plugin({
        key,
        state: {
            init(_config, _state) {
                if (
                    WRITE_ROLES.includes(options.editor.docInfo.access_rights)
                ) {
                    this.spec.props.nodeViews["table"] = (node, view, getPos) =>
                        new TableView(node, view, getPos, options)
                }
                this.spec.props.nodeViews["table_caption"] = (
                    node,
                    view,
                    getPos
                ) => new TableCaptionView(node, view, getPos, options)

                return {}
            },
            apply(_tr, prev) {
                return prev
            }
        },
        props: {
            nodeViews: {}
        }
    })
