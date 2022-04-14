const url ='../docs/pdf.pdf'

let pdfDoc= null,
    pageNum = 1,
    pageIsRendering = false,
    pageNumIsPending = null,
    scale = 1.5;

const canvas = document.querySelector('#pdf-render'),
    ctx = canvas.getContext('2d')

// Render the page
const renderPage = (num) => {
    pageIsRendering = true

    // Get the page
    pdfDoc.getPage(num).then(page => {
        // Set Scale
        const viewport = page.getViewport({ scale })
        canvas.height = viewport.height
        canvas.width = viewport.width

        const renderCtx = {
            canvasContext: ctx,
            viewport
        }

        page.render(renderCtx).promise.then(() => {
            pageIsRendering = false

            if(pageNumIsPending !== null) {
                renderPage(pageNumIsPending)
                pageNumIsPending = null
            }
        })
        // Output current page 
        document.querySelector('#page-num').textContent = num
    })
}

// Check for pages rendering
const queueRenderPage = num => {
    if(pageIsRendering) {
        pageNumIsPending = num
    } else {
        renderPage(num)
    }
}

// Show Previous Page
const showPreviousPage = () => {
    if(pageNum <= 1) {
        return
    }
    pageNum--
    queueRenderPage(pageNum)
}

// Show Next Page
const showNextPage = () => {
    if(pageNum >= pdfDoc.numPages) {
        return
    }
    pageNum++
    queueRenderPage(pageNum)
}

// Zoom out
function zoomOut() {
    scale -= 0.1
    console.log(scale)
    renderPage(pageNum)
}

// Zoom in
function zoomIn() {
    scale += 0.1
    console.log(scale)
    renderPage(pageNum)
}

// Get Document
pdfjsLib.getDocument(url).promise.then(pdfDoc_ => {
    pdfDoc = pdfDoc_
    
    document.querySelector('#page-count').textContent = pdfDoc.numPages

    renderPage(pageNum)
})
    .catch(err => {
        // Display error
        const div = document.createElement('div')
        div.className = 'error'
        div.appendChild(document.createTextNode(err.message))
        document.querySelector('body').insertBefore(div, canvas)

        //Remove top bar
        document.querySelector('.top-bar').style.display = 'none'
    })

// Button events
document.querySelector('#prev-page').addEventListener('click', showPreviousPage)
document.querySelector('#next-page').addEventListener('click', showNextPage)

document.querySelector('#zoom-in').addEventListener('click', zoomIn)
document.querySelector('#zoom-out').addEventListener('click', zoomOut)