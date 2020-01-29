/**
 * Custom highlighter from the main graph.
 */
import {
  CanvasComponent,
  HighlightIndicatorManager,
  INode,
  GraphComponent,
  NodeStyleDecorationInstaller,
  Insets,
  StyleDecorationZoomPolicy,
  ShapeNodeStyle,
  Stroke,
  Fill
} from 'yfiles'

export class MainHighlightManager extends HighlightIndicatorManager<INode> {
  private readonly nodeHighlightGroup: any

  constructor(canvas: CanvasComponent) {
    super(canvas)
    const graphModelManager = (this.canvasComponent as GraphComponent).graphModelManager

    // the nodes' highlight group should be above the nodes
    this.nodeHighlightGroup = graphModelManager.contentGroup.addGroup()
    this.nodeHighlightGroup.above(graphModelManager.nodeGroup)
  }

  getCanvasObjectGroup(item) {
    if (INode.isInstance(item)) {
      return this.nodeHighlightGroup
    }
    return super.getCanvasObjectGroup(item)
  }

  getInstaller(item) {
    if (INode.isInstance(item)) {
      return new NodeStyleDecorationInstaller({
        margins: new Insets(5),
        zoomPolicy: StyleDecorationZoomPolicy.MIXED,
        nodeStyle: new ShapeNodeStyle({
          shape: 'ellipse',
          fill: null,
          stroke: new Stroke({
            dashStyle: 'dash',
            lineCap: 'round',
            thickness: 4,
            fill: '#FFFAFF'
          })
        })
      })
    }
    return super.getInstaller(item)
  }
}
