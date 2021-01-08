import { HtmlCanvasVisual, IVisualCreator, ICanvasObjectDescriptor } from 'yfiles'

const heatscale = 1

class HeatMapBackground extends HtmlCanvasVisual {
  private canvas: HTMLCanvasElement
  private ctx: null
  private readonly getHeat: (element) => number
  private fillStyle: string

  constructor(getHeat) {
    super()
    this.canvas = null
    this.ctx = null
    this.getHeat =
      getHeat ||
      function (element) {
        return 1
      }
  }

  /**
   *
   * @param renderContext
   * @param {CanvasRenderingContext2D} ctx
   */
  paint(renderContext, ctx) {
    ctx.save()
    ctx.fillStyle = this.fillStyle
    ctx.setTransform(1, 0, 0, 1, 0, 0)

    let { width, height } = ctx.canvas
    width = Math.max(1, width)
    height = Math.max(1, height)

    let canvas = this.canvas
    let backgroundContext

    if (!canvas || canvas.width !== width || canvas.height !== height) {
      canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      backgroundContext = canvas.getContext('2d')
      this.canvas = canvas
      this.ctx = backgroundContext
    } else {
      backgroundContext = this.ctx
      backgroundContext.clearRect(0, 0, width, height)
    }

    const scale = renderContext.zoom * heatscale

    backgroundContext.setTransform(
      renderContext.canvasComponent.devicePixelRatio,
      0,
      0,
      renderContext.canvasComponent.devicePixelRatio,
      0,
      0
    )

    let lastHeat = -1
    renderContext.canvasComponent.graph.nodes.forEach((node) => {
      const c = renderContext.toViewCoordinates(node.layout.center)
      let heat = this.getHeat(node)
      if (heat > 0) {
        if (heat !== lastHeat) {
          backgroundContext.fillStyle = `rgba(255,255,255, ${heat})`
          heat = lastHeat
        }
        const w = Math.max(100, node.layout.width * 1.5)
        const h = Math.max(100, node.layout.height * 1.5)
        backgroundContext.beginPath()
        backgroundContext.ellipse(c.x, c.y, w * scale * 0.5, h * scale * 0.5, 0, 0, Math.PI * 2)
        backgroundContext.fill()
      }
    })
    lastHeat = -1
    renderContext.canvasComponent.graph.edges.forEach((edge) => {
      let heat = this.getHeat(edge)
      if (heat > 0) {
        if (heat !== lastHeat) {
          backgroundContext.strokeStyle = `rgba(255,255,255, ${heat})`
          backgroundContext.lineWidth = (5 + heat * 15) * scale
          heat = lastHeat
        }

        const path = edge.style.renderer.getPathGeometry(edge, edge.style).getPath().flatten(1)

        backgroundContext.beginPath()
        const cursor = path.createCursor()
        if (cursor.moveNext()) {
          let p = renderContext.toViewCoordinates(cursor.currentEndPoint)
          backgroundContext.moveTo(p.x, p.y)
          while (cursor.moveNext()) {
            let p = renderContext.toViewCoordinates(cursor.currentEndPoint)
            backgroundContext.lineTo(p.x, p.y)
          }
          backgroundContext.stroke()
        }
      }
    })

    ctx.filter = `url(${document.location.pathname}#heatmap)`
    ctx.drawImage(canvas, 0, 0)
    ctx.restore()
  }
}

let installed = false
export function addHeatMap(graphComponent, getHeat) {
  if (!installed) {
    const divElement = document.createElement('div')
    divElement.setAttribute('style', 'height: 0px; width: 0px;')
    divElement.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10" width="0" height="0">
  <defs>
    <filter id="heatmap" x="0" y="0" width="100%" height="100%">
      <!-- Blur the image - change blurriness via stdDeviation between 10 and maybe 25 - lower values may perform better -->
      <feGaussianBlur stdDeviation="16" edgeMode="none"/>
      <!-- Take the alpha value -->
      <feColorMatrix
        type="matrix"
        values="0 0 0 1 0
                0 0 0 1 0
                0 0 0 1 0
                0 0 0 1 0" />
      <!-- Map it to a "heat" rainbow colors -->
      <feComponentTransfer>
        <feFuncR type="table" tableValues="0 0 0 0 1 1"></feFuncR>
        <feFuncG type="table" tableValues="0 0 1 1 1 0"></feFuncG>
        <feFuncB type="table" tableValues="0.5 1 0 0 0"></feFuncB>
        <!-- specify maximum opacity for the overlay here -->
        <!-- less opaque: <feFuncA type="table" tableValues="0 0.1 0.4 0.6 0.7"></feFuncA> -->
        <feFuncA type="table" tableValues="0 0.6 0.7 0.8 0.9"></feFuncA>
      </feComponentTransfer>
    </filter>
  </defs>
</svg>
`
    document.body.appendChild(divElement)
    installed = true
  }
  // @ts-ignore
  const creator = new IVisualCreator({
    createVisual(context) {
      return new HeatMapBackground(getHeat)
    },
    updateVisual(context, oldVisual) {
      return oldVisual
    },
  })
  graphComponent.backgroundGroup.addChild(creator, ICanvasObjectDescriptor.ALWAYS_DIRTY_INSTANCE)
}
