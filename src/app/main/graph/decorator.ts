import * as _ from 'lodash'
import {
  NodeStyleBase,
  ImageNodeStyle,
  SimpleNode,
  ShapeNodeStyle,
  Rect,
  SvgVisualGroup,
  SvgVisual,
} from 'yfiles'

export class NodeStyleDecorator extends NodeStyleBase {
  baseStyle: any
  imageUrls: string[]
  imageStyles: ImageNodeStyle[]
  dummyDecorationNodes: SimpleNode[]
  badges: string[]
  hasBadges = false
  readonly badgeSize = 25 // IMPORTANT: has to be half size of main node
  readonly s = this.badgeSize * Math.tan(Math.PI / 6)
  readonly delta = (this.badgeSize - this.s) * 0.5

  constructor(baseStyle, badges) {
    super()
    this.badges = badges
    this.initArrays()
    this.baseStyle = baseStyle || new ShapeNodeStyle()
  }

  /**
   * Badges and things.
   */
  initArrays() {
    this.imageUrls = []
    this.imageStyles = []
    this.dummyDecorationNodes = []
    if (!_.isNil(this.badges)) {
      this.hasBadges = true

      // contour
      this.imageUrls.push(`assets/contour.svg`)
      this.imageStyles.push(new ImageNodeStyle())
      const contour = new SimpleNode()
      contour.layout = new Rect(0, 0, 4 * this.badgeSize, 3 * this.badgeSize + 5)
      this.dummyDecorationNodes.push(contour)
      // for (let i = 0; i < 12; i++) {
      for (let i = 0; i < this.badges.length; i++) {
        this.imageUrls.push(`assets/badges/badge_${i + 1}.svg`)
        this.imageStyles.push(new ImageNodeStyle())
        // This dummy node is passed to the image node style to render the decoration image.
        // Its size is the size of the decoration. Its location is adjusted during each createVisual
        // and updateVisual.
        const simple = new SimpleNode()
        simple.layout = new Rect(0, 0, this.badgeSize, this.badgeSize)
        this.dummyDecorationNodes.push(simple)
      }
    }
  }

  createVisual(context, node) {
    // if no badges the basestyle will do
    if (!this.hasBadges) {
      return this.baseStyle.renderer.getVisualCreator(node, this.baseStyle).createVisual(context)
    }

    const rect = node.layout.toRect()

    // create the base visualization
    const baseVisual = this.baseStyle.renderer
      .getVisualCreator(node, this.baseStyle)
      .createVisual(context)

    // add both to a group
    const group = new SvgVisualGroup()
    group.add(baseVisual)

    // create the decoration
    for (let i = 0; i < this.imageStyles.length; i++) {
      const imageStyle = this.imageStyles[i]
      const dummyDecorationNode = this.dummyDecorationNodes[i]
      imageStyle.image = this.imageUrls[i]
      dummyDecorationNode.layout = this.getDecorationLayout(rect, i)
      const decorationRenderer = imageStyle.renderer.getVisualCreator(
        dummyDecorationNode,
        imageStyle
      )
      const decorationVisual: SvgVisual = decorationRenderer.createVisual(context) as SvgVisual

      group.add(decorationVisual)

      // save image URL with the visual for the update method
      group['data-renderDataCache'] = {
        imageUrls: this.imageUrls,
      }
    }

    return group
  }

  updateVisual(context, oldVisual, node) {
    /*
     * group organization:
     * 0: base
     * 1: contour
     * 2...: badges
     * */
    if (!this.hasBadges) {
      return this.baseStyle.renderer
        .getVisualCreator(node, this.baseStyle)
        .updateVisual(context, oldVisual)
    }

    const rect = node.layout.toRect()

    // check whether the elements are as expected
    if (oldVisual.children.size < 2) {
      return this.createVisual(context, node)
    }

    // update the base visual
    const baseVisual = this.baseStyle.renderer
      .getVisualCreator(node, this.baseStyle)
      .updateVisual(context, oldVisual.children.get(0))
    // check whether the updateVisual method created a new element and replace the old one if needed
    if (baseVisual !== oldVisual.children.get(0)) {
      oldVisual.children.set(0, baseVisual)
    }

    // update the decoration visual
    const oldRenderData = oldVisual['data-renderDataCache']
    // first, check whether the image URL changed
    for (let i = 0; i < this.imageUrls.length; i++) {
      if (this.imageUrls[i] !== oldRenderData.imageUrls[i]) {
        this.imageStyles[i].image = this.imageUrls[i]
      }
    }
    for (let i = 0; i < this.dummyDecorationNodes.length; i++) {
      this.dummyDecorationNodes[i].layout = this.getDecorationLayout(rect, i)
      const decorationRenderer = this.imageStyles[i].renderer.getVisualCreator(
        this.dummyDecorationNodes[i],
        this.imageStyles[i]
      )
      const decorationVisual = decorationRenderer.updateVisual(
        context,
        oldVisual.children.get(i + 1)
      )
      if (decorationVisual !== oldVisual.children.get(i + 1)) {
        // check whether the updateVisual method created a new element and replace the old one if needed
        oldVisual.children.set(i + 1, decorationVisual)
      }
    }

    // update the stored image URL for the next update visual call
    oldVisual['data-renderDataCache'] = {
      imageUrls: this.imageUrls,
    }

    return oldVisual
  }

  getDecorationLayout(nodeLayout, index) {
    if (index === 0) {
      // contour
      return new Rect(
        nodeLayout.x - this.badgeSize - 5,
        nodeLayout.y - 0.5 * this.badgeSize - 1,
        4 * this.badgeSize,
        3 * this.badgeSize
      )
    }

    const size = this.dummyDecorationNodes[index].layout.toSize()

    const p = {
      x: nodeLayout.x + 19 + 30 * Math.cos(-Math.PI / 2 + (index - 1) * Math.PI * 0.2),
      y: nodeLayout.y + 19 + 30 * Math.sin(-Math.PI / 2 + (index - 1) * Math.PI * 0.2),
    } // contour has index 0
    return new Rect(p.x - 5, p.y - 4, size.width, size.height)
  }

  isVisible(context, rectangle, node) {
    const main = this.baseStyle.renderer
      .getVisibilityTestable(node, this.baseStyle)
      .isVisible(context, rectangle)
    if (main) {
      return true
    }
    for (let i = 0; i < this.dummyDecorationNodes.length; i++) {
      if (rectangle.intersects(this.getDecorationLayout(node.layout, i))) {
        return true
      }
    }
    return false
  }

  isHit(context, location, node) {
    return this.baseStyle.renderer.getHitTestable(node, this.baseStyle).isHit(context, location)
  }

  isInBox(context, rectangle, node) {
    // return only box containment test of baseStyle - we don't want the decoration to be marquee selectable
    return this.baseStyle.renderer
      .getMarqueeTestable(node, this.baseStyle)
      .isInBox(context, rectangle)
  }

  getIntersection(node, inner, outer) {
    return this.baseStyle.renderer
      .getShapeGeometry(node, this.baseStyle)
      .getIntersection(inner, outer)
  }

  isInside(node, location) {
    // return only inside test of baseStyle
    return this.baseStyle.renderer.getShapeGeometry(node, this.baseStyle).isInside(location)
  }
}
