import { GraphMode, Shared } from '../shared'
import { BaseClass, IVisualCreator, SvgVisual, RadialLayout, Point } from 'yfiles'

export class CircleVisual extends BaseClass<IVisualCreator>(IVisualCreator)
  implements IVisualCreator {
  private radii: Array<number>
  private center: any

  constructor() {
    super()
  }

  createVisual(context) {
    const graph = context.canvasComponent.graph
    const container = document.createElementNS('http://www.w3.org/2000/svg', 'g')

    this.updateCircleInformation(graph)

    this.radii.forEach(radius => {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
      circle.setAttribute('cx', this.center.x)
      circle.setAttribute('cy', this.center.y)
      circle.setAttribute('r', radius.toString())
      circle.setAttribute('class', 'centric-circle')
      container.appendChild(circle)
    })

    const visual = new SvgVisual(container)
    visual['render-data-cache'] = {
      center: this.center,
      radii: this.radii,
      graphMode: Shared.graphMode
    }

    return visual
  }

  updateVisual(context, oldVisual) {
    const renderDataCache = oldVisual['render-data-cache']
    this.updateCircleInformation(context.canvasComponent.graph)

    if (
      renderDataCache.graphMode !== Shared.graphMode ||
      renderDataCache.center !== this.center ||
      this.equalsArray(renderDataCache.radii, this.radii)
    ) {
      return this.createVisual(context)
    }

    return oldVisual
  }

  /**
   * Checks if the two arrays are equal.
   * @param {Array} array1
   * @param {Array} array2
   * @return {boolean}
   */
  equalsArray(array1, array2) {
    if (array1 === array2) {
      return true
    }
    if (array1 === null || array2 === null) {
      return false
    }
    if (array1.length !== array2.length) {
      return false
    }

    // the radii in the arrays are sorted
    for (let i = 0; i < array1.length; ++i) {
      if (array1[i] !== array2[i]) {
        return false
      }
    }
    return true
  }

  updateCircleInformation(graph) {
    const circleInfo = graph.mapperRegistry.getMapper(RadialLayout.NODE_INFO_DP_KEY)

    this.center = null
    this.radii = []
    if (Shared.graphMode === GraphMode.centric) {
      graph.nodes.forEach(node => {
        const info = circleInfo.get(node)
        if (info) {
          if (this.center === null) {
            // only calculate the center once
            const nodeCenter = node.layout.center
            this.center = new Point(
              nodeCenter.x - info.centerOffset.x,
              nodeCenter.y - info.centerOffset.y
            )
          }

          if (this.radii.indexOf(info.radius) < 0) {
            // we collect the radii of all circles the  nodes are placed on
            this.radii.push(info.radius)
          }
        }
      })

      this.radii.sort()
    }
  }
}
