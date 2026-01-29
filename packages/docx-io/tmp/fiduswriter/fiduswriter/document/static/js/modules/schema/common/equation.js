export const equation = {
    inline: true,
    group: "inline",
    attrs: {
        equation: {
            default: ""
        }
    },
    parseDOM: [
        {
            tag: "span.equation",
            getAttrs(dom) {
                return {
                    equation: dom.dataset.equation
                }
            }
        }
    ],
    toDOM(node) {
        const dom = document.createElement("span")
        dom.dataset.equation = node.attrs.equation
        dom.classList.add("equation")
        import("mathlive").then(MathLive => {
            dom.innerHTML = MathLive.convertLatexToMarkup(node.attrs.equation, {
                mathstyle: "textstyle"
            })
        })
        dom.setAttribute("contenteditable", "false")
        return dom
    }
}
