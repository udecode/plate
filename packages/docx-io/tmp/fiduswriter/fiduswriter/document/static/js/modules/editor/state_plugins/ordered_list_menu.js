import {Plugin, PluginKey, Selection} from "prosemirror-state"
import {WRITE_ROLES} from "../"
import {ContentMenu} from "../../common"

const key = new PluginKey("tableMenu")

class OrderedListView {
    constructor(node, view, getPos, options) {
        this.node = node
        this.view = view
        this.getPos = getPos
        this.options = options
        this.dom = document.createElement("div")
        this.dom.classList.add("content-container")
        this.dom.id = node.attrs.id
        this.menuButton = document.createElement("button")
        this.menuButton.classList.add("content-menu-btn")
        this.menuButton.innerHTML =
            '<span class="dot-menu-icon"><i class="fa fa-ellipsis-v"></i></span>'
        this.dom.appendChild(this.menuButton)
        const orderedList = document.createElement("ol")
        if (node.attrs.order !== 1) {
            orderedList.start = node.attrs.order
        }
        if (node.attrs.track?.length) {
            orderedList.dataset.track = JSON.stringify(node.attrs.track)
        }
        this.contentDOM = this.dom.appendChild(orderedList)
        this.dom.appendChild(this.contentDOM)
    }

    stopEvent(event) {
        let stopped = false
        if (
            event.type === "mousedown" &&
            event.composedPath().includes(this.menuButton)
        ) {
            stopped = true
            const tr = this.view.state.tr
            const $pos = this.view.state.doc.resolve(this.getPos())
            tr.setSelection(Selection.findFrom($pos, 1, true))
            this.view.dispatch(tr)
            const contentMenu = new ContentMenu({
                menu: this.options.editor.menu.orderedListMenuModel,
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

export const orderedListMenuPlugin = options =>
    new Plugin({
        key,
        state: {
            init(_config, _state) {
                if (
                    WRITE_ROLES.includes(options.editor.docInfo.access_rights)
                ) {
                    this.spec.props.nodeViews["ordered_list"] = (
                        node,
                        view,
                        getPos
                    ) => new OrderedListView(node, view, getPos, options)
                }
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
