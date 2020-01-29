import * as _ from 'lodash'
import { NodeStyleDecorator } from './decorator'
import {
  DefaultLabelStyle,
  Stroke,
  SolidColorFill,
  TemplateNodeStyle,
  DashStyle,
  ExteriorLabelModel,
  GeneralPath,
  Rect,
  Size,
  ArcEdgeStyle,
  PolylineEdgeStyle,
  NodeStyleLabelStyleAdapter,
  ShapeNodeStyle,
  ShapeNodeShape,
  Fill,
  Insets,
  TemplateNodeStyleRenderer,
  IRenderContext,
  Visual,
  SvgVisual
} from 'yfiles'

class ContaminationTemplateRenderer extends TemplateNodeStyleRenderer {
  createVisual(context: IRenderContext): Visual | null {
    const visual = super.createVisual(context) as SvgVisual
    this.$applyContamination(visual.svgElement.lastElementChild, this.node.tag.level)
    return visual
  }

  updateVisual(context: IRenderContext, oldVisual: Visual | null): Visual | null {
    const updatedVisual = super.updateVisual(context, oldVisual) as SvgVisual
    this.$applyContamination(updatedVisual.svgElement.lastElementChild, this.node.tag.level)
    return updatedVisual
  }
  $applyContamination(circleElement, contaminationLevel) {
    const maxOffset = 125
    circleElement.setAttribute('stroke-dashoffset', maxOffset - maxOffset * contaminationLevel)
  }
}

export class Styling {
  private static mapEdgeStroke
  private static centricEdgeStroke
  static defaultTheme = {
    mapEdge: {
      color: '#4682B4',
      width: 2.0,
      dash: 'solid'
    },
    mapNode: {
      fill: '#00CED1',
      stroke: '#FC5130'
    },
    centricEdge: {
      color: '#FFFFFF',
      width: 2.0,
      dash: 'solid'
    },
    centricNode: {
      fill: '#37d124',
      stroke: '#ffe55f'
    }
  }

  /**
   * Applies a set of colors to the graph elements.
   * @param definition see the default theme for details
   */
  static setTheme(definition = Styling.defaultTheme) {
    const mapEdgeStrokeRGB = Styling.hex2rgba(definition.mapEdge.color)
    // yFiles doesnt like view.SolidColorFill(...mapEdgeStroke) for some reason
    this.mapEdgeStroke = new Stroke({
      thickness: definition.mapEdge.width,
      fill: new SolidColorFill(
        mapEdgeStrokeRGB[0],
        mapEdgeStrokeRGB[1],
        mapEdgeStrokeRGB[2],
        mapEdgeStrokeRGB[3]
      ),
      dashStyle: Styling.dash2y(definition.mapEdge.dash)
    })

    const centricEdgeStrokeRGB = Styling.hex2rgba(definition.centricEdge.color)
    this.centricEdgeStroke = new Stroke({
      thickness: definition.centricEdge.width,
      fill: new SolidColorFill(
        centricEdgeStrokeRGB[0],
        centricEdgeStrokeRGB[1],
        centricEdgeStrokeRGB[2],
        centricEdgeStrokeRGB[3]
      ),
      dashStyle: Styling.dash2y(definition.centricEdge.dash)
    })

    // these converters are used in the SVG templates inside 'index.html'
    // things like <rect fill="{Binding , Converter=centricFill}" />

    // @ts-ignore
    TemplateNodeStyle.CONVERTERS.mapFill = val => {
      return definition.mapNode.fill
    }
    // @ts-ignore
    TemplateNodeStyle.CONVERTERS.mapStroke = val => {
      return definition.mapNode.stroke
    }
    // @ts-ignore
    TemplateNodeStyle.CONVERTERS.centricFill = val => {
      return definition.centricNode.fill
    }
    // @ts-ignore
    TemplateNodeStyle.CONVERTERS.centricStroke = val => {
      return definition.centricNode.stroke
    }
  }

  /**
   * Converts the dash-style string-name into as yFiles type.
   * @param dashName can be solid, dash, dot, dashdot and dashdotdot.
   */
  static dash2y(dashName) {
    switch (dashName) {
      case 'solid':
        return DashStyle.SOLID
      case 'dot':
        return DashStyle.DOT
      case 'dash':
        return DashStyle.DASH
      case 'dashdot':
        return DashStyle.DASH_DOT
      case 'dashdotdot':
        return DashStyle.DASH_DOT_DOT
      default:
        throw new Error(`Unrecognized yFiles dash style: ${dashName}.`)
    }
  }

  static hex2rgba(hex: string, opacity = 1.0): Array<number> {
    if (_.isNil(hex) || hex.length < 6) {
      throw new Error(`Suspicious hex color definition: ${hex}.`)
    }
    hex = hex.replace('#', '')
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)

    // result = 'rgba(' + r + ',' + g + ',' + b + ',' + opacity / 100 + ')';
    return [r, g, b, opacity * 255]
  }

  static initializeDefaultStyles(graph) {
    graph.nodeDefaults.style = Styling.createMapNodeStyle()
    graph.nodeDefaults.size = [40, 40]
    graph.nodeDefaults.shareStyleInstance = false
    graph.nodeDefaults.labels.style = Styling.createLabelStyle()
    graph.nodeDefaults.labels.layoutParameter = ExteriorLabelModel.EAST
    graph.edgeDefaults.style = Styling.createMapEdgeStyle()
    graph.edgeDefaults.shareStyleInstance = false
  }

  static applyMapStyles(graph) {
    graph.edges.forEach(edge => {
      graph.setStyle(edge, Styling.createMapEdgeStyle(Styling.getArcHeight(edge)))
    })
    graph.nodes.forEach(node => {
      if (node.tag.style === 'group') {
        graph.setStyle(node, Styling.createLayoutGroupNodeStyle())
      } else {
        graph.setStyle(node, Styling.createMapNodeStyle())
      }
      node.ports.forEach(port => {
        graph.setPortLocationParameter(port, graph.nodeDefaults.ports.locationParameter.clone())
      })
    })
  }

  static applyLayoutStyles(graph) {
    graph.edges.forEach(edge => {
      graph.setStyle(edge, Styling.createLayoutEdgeStyle())
    })
    graph.nodes.forEach(node => {
      if (node.tag.style === 'group') {
        graph.setStyle(node, Styling.createLayoutGroupNodeStyle())
      } else {
        graph.setStyle(node, Styling.createLayoutNodeStyle(node.tag.badges))
      }
    })
  }

  static createMapNodeStyle() {
    const outlinePath = new GeneralPath()
    // the path is interpreted as normalized - spanning from 0/0 to 1/1
    outlinePath.appendEllipse(new Rect(0, 0, 1, 1), true)
    return new TemplateNodeStyle({
      renderer: new ContaminationTemplateRenderer(),
      renderTemplateId: 'geo-template',
      minimumSize: new Size(50, 50),
      normalizedOutline: outlinePath
    })
  }

  static createMapEdgeStyle(height = null) {
    return new ArcEdgeStyle({
      stroke: Styling.mapEdgeStroke,
      height: height || 100
    })
  }

  static createLayoutEdgeStyle() {
    return new PolylineEdgeStyle({
      stroke: Styling.centricEdgeStroke
    })
  }

  static createLayoutNodeStyle(badges = null) {
    const outlinePath = new GeneralPath()
    // the path is interpreted as normalized - spanning from 0/0 to 1/1
    outlinePath.appendEllipse(new Rect(0, 0, 1, 1), true)

    const baseStyle = new TemplateNodeStyle({
      renderer: new ContaminationTemplateRenderer(),
      renderTemplateId: 'layout-template',
      minimumSize: new Size(50, 50),
      normalizedOutline: outlinePath
    })
    if (_.isNil(badges) || badges.length === 0) {
      return baseStyle
    } else {
      return new NodeStyleDecorator(baseStyle, badges)
    }
  }

  static createLayoutGroupNodeStyle() {
    const outlinePath = new GeneralPath()
    // the path is interpreted as normalized - spanning from 0/0 to 1/1
    outlinePath.appendEllipse(new Rect(0, 0, 1, 1), true)
    return new TemplateNodeStyle({
      renderer: new ContaminationTemplateRenderer(),
      renderTemplateId: 'group-template',
      minimumSize: new Size(150, 50),
      normalizedOutline: outlinePath
    })
  }

  static createLabelStyle() {
    return new NodeStyleLabelStyleAdapter({
      nodeStyle: new ShapeNodeStyle({
        shape: ShapeNodeShape.RECTANGLE,
        fill: Fill.STEEL_BLUE,
        stroke: null
      }),
      labelStyle: new DefaultLabelStyle({
        textFill: Fill.WHITE
      }),
      labelStyleInsets: new Insets(3, 5, 3, 5)
    })
  }

  static updateEdgeArcs(graph) {
    graph.edges.forEach(edge => {
      edge.style.height = Styling.getArcHeight(edge)
    })
  }

  static getArcHeight(edge) {
    const sourceCenter = edge.sourceNode.layout.center
    const targetCenter = edge.targetNode.layout.center
    const distance = sourceCenter.distanceTo(targetCenter)
    if (distance < 500) {
      return distance / 10
    }
    return 100
  }
}
