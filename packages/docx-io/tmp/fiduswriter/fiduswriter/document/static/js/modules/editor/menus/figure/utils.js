export const figureMenuAction = (value, figureDialog) => {
    const buttonDOM = document.querySelector(".figure-width")
    buttonDOM.firstElementChild.innerText = `${value} %`
    figureDialog.width = value
}
