import {DOMSerializer} from "prosemirror-model"
import {NodeSelection, Plugin, PluginKey} from "prosemirror-state"
import {ContentMenu} from "../../common"

const key = new PluginKey("figureMenu")

class FigureView {
    constructor(node, view, getPos, options) {
        this.node = node
        this.view = view
        this.getPos = getPos
        this.options = options
        this.dom = document.createElement("div")
        this.dom.classList.add("figure")
        this.serializer = DOMSerializer.fromSchema(node.type.schema)
        const contentDOM = this.serializer.serializeNode(this.node)
        contentDOM.classList.forEach(className =>
            this.dom.classList.add(className)
        )
        contentDOM.classList.value = ""
        this.dom.appendChild(contentDOM)
        this.contentDOM = contentDOM
        this.menuButton = document.createElement("button")
        this.menuButton.classList.add("figure-menu-btn")
        this.menuButton.innerHTML =
            '<span class="dot-menu-icon"><i class="fa fa-ellipsis-v"></i></span>'
        this.dom.insertBefore(this.menuButton, this.dom.firstChild)
    }

    stopEvent(event) {
        let stopped = false
        if (event.type === "mousedown") {
            const composedPath = event.composedPath()
            if (composedPath.includes(this.menuButton)) {
                stopped = true
                const tr = this.view.state.tr
                const $pos = this.view.state.doc.resolve(this.getPos())
                tr.setSelection(new NodeSelection($pos))
                this.view.dispatch(tr)
                const contentMenu = new ContentMenu({
                    menu: this.options.editor.menu.figureMenuModel,
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
            } else if (
                composedPath.includes(this.dom) &&
                !composedPath.find(el => el.matches && el.matches("figcaption"))
            ) {
                stopped = true
                const tr = this.view.state.tr
                const $pos = this.view.state.doc.resolve(this.getPos())
                tr.setSelection(new NodeSelection($pos))
                this.view.dispatch(tr)
            }
        }

        return stopped
    }
}

class FigureCaptionView {
    constructor(node, view, getPos, options) {
        this.node = node
        this.view = view
        this.getPos = getPos
        this.options = options

        this.dom = document.createElement("figcaption")
        this.dom.innerHTML = '<span class="text"></span>'
        this.contentDOM = this.dom.lastElementChild
    }
}

export const figurePlugin = options =>
    new Plugin({
        key,
        state: {
            init(_config, _state) {
                if (options.editor.docInfo.access_rights === "write") {
                    this.spec.props.nodeViews["figure"] = (
                        node,
                        view,
                        getPos
                    ) => new FigureView(node, view, getPos, options)
                }
                this.spec.props.nodeViews["figure_caption"] = (
                    node,
                    view,
                    getPos
                ) => new FigureCaptionView(node, view, getPos, options)
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
