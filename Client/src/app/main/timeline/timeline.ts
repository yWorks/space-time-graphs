import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  Input,
  NgZone,
  OnChanges,
  OnInit,
  ViewChild
} from '@angular/core'
import * as d3 from 'd3'
import * as _ from 'lodash'
import * as L from 'leaflet'
import { select } from '@ngrx/store'
import { Shared } from '../shared'
import { INode } from '../data/entities'
import * as moment from 'moment'

/**
 * A timeline based on d3 integrated in LEaflet
 */
export class TimelineLeafletControl extends L.Control implements OnInit, AfterViewInit, OnChanges {
  map: L.Map
  private element: HTMLElement
  private svg: any
  private nodes: INode[]
  private filteringEnabled: boolean
  private timeWindow = []
  private selectionListener: any
  private currentNode: INode

  /**
   * Instantiates the component.
   */
  constructor() {
    super({ position: 'bottomleft' })
  }

  /**
   * What happens when this control is added to Leaflet.
   * @param map Parent Leaflet map.
   */
  onAdd(map: L.Map): HTMLElement {
    this.map = map
    return this.createDom()
  }

  onRemove(map: L.Map): void {
    super.onRemove(map)
  }

  ngOnChanges(): void {
    this.render()
  }

  ngOnInit() {}

  ngAfterViewInit(): void {}

  /**
   * Creates the dom elements making up this component.
   */
  private createDom() {
    // <div #timelineRef (window:resize)="onResize($event)" style="border: 1px solid black">
    // <svg width="100%" height="200"></svg>
    //     </div>
    this.element = L.DomUtil.create('div')
    this.element.id = 'timeline-wrapper'
    this.element.setAttribute('class', 'timeline-wrapper')
    // this.svgElement = document.createElement('svg');
    // this.svgElement.setAttribute('width', '100%');
    // this.svgElement.setAttribute('height', '200');
    // this.svgElement.id = 'svgTimeline';
    // this.element.appendChild(this.svgElement);
    const self = this
    this.element.addEventListener('mouseover', () => {
      self.map.dragging.disable()
      self.map.dragging.disable()
      self.map.touchZoom.disable()
      self.map.doubleClickZoom.disable()
      self.map.scrollWheelZoom.disable()
      self.map.boxZoom.disable()
      self.map.keyboard.disable()
    })
    // Re-enable dragging when user's cursor leaves the element
    this.element.addEventListener('mouseout', () => {
      self.map.dragging.enable()
      self.map.touchZoom.enable()
      self.map.doubleClickZoom.enable()
      self.map.scrollWheelZoom.enable()
      self.map.boxZoom.enable()
      self.map.keyboard.enable()
    })

    this.svg = d3
      .select(this.element)
      .append('svg')
      .style('width', '100%')
      .style('height', '200')
    return this.element
  }

  /**
   * Renders the actual timeline.
   */
  render() {
    // main: main area 70%
    // thumb: the minimap or thumb view 30%
    const mainHeight = Math.round(this.element.offsetHeight * 0.6)
    const thumbHeight = Math.max(Math.round(this.element.offsetHeight * 0.4) - 20, 20)
    const self = this
    this.svg.selectAll('*').remove()
    const mainMargin = { top: 10, right: 10, bottom: thumbHeight + 10, left: 40 },
      thumbMargin = { top: mainHeight + 0, right: 20, bottom: 0, left: 40 }

    const contentWidth = Math.max(
      this.element.offsetWidth - mainMargin.left - mainMargin.right - 10,
      0
    )
    const contentHeight = Math.max(
      this.element.offsetHeight - mainMargin.top - mainMargin.bottom - 10,
      0
    )
    // this.element.setAttribute('style', `border: 1px solid black; width: ${contentWidth}px; margin:-50 0 0 0; height: 200px; background-color: white;`);

    const parseTime = d3.timeParse('%Y-%m-%d')

    let x = d3.scaleTime().range([0, contentWidth]),
      x2 = d3.scaleTime().range([0, contentWidth]),
      y = d3.scaleLinear().range([contentHeight, 0]),
      y2 = d3.scaleLinear().range([thumbHeight, 0])

    const xAxis = d3.axisBottom(x).tickSize(0),
      xAxis2 = d3.axisBottom(x2).tickSize(0),
      yAxis = d3
        .axisLeft(y)
        .tickSize(0)
        .tickValues([0.0, 0.5, 0.1])

    const brush = d3
      .brushX()
      .extent([[0, 20], [contentWidth, thumbHeight]])
      .on('brush', brushed)

    const zoom = d3
      .zoom()
      .scaleExtent([1, Infinity])
      .translateExtent([[0, 0], [contentWidth, contentHeight]])
      .extent([[0, 0], [contentWidth, contentHeight]])
      .on('zoom', zoomed)

    this.svg
      .append('defs')
      .append('clipPath')
      .attr('id', 'clip')
      .append('rect')
      .attr('width', contentWidth)
      .attr('height', contentHeight)

    const focus = this.svg
      .append('g')
      .attr('class', 'focus')
      .attr('transform', 'translate(' + mainMargin.left + ',' + mainMargin.top + ')')

    const context = this.svg
      .append('g')
      .attr('class', 'context')
      .attr('transform', 'translate(' + thumbMargin.left + ',' + thumbMargin.top + ')')

    // d3.csv('assets/messages.csv').then((data, error) => {
    //     if (error) {
    //         throw error;
    //     }
    //     processNodes(data);
    // });

    self.svg
      .append('rect')
      .attr('class', 'zoom')
      .attr('width', contentWidth)
      .attr('height', contentHeight)
      .attr('transform', 'translate(' + mainMargin.left + ',' + mainMargin.top + ')')
      .call(zoom)
    context
      .append('g')
      .attr('class', 'brush')
      .call(brush)
      .call(brush.move, x.range())
    const secondx = context
      .append('g')
      .attr('class', 'axis x-axis')
      .attr('transform', 'translate(0,' + thumbHeight + ')')
    const firstx = focus
      .append('g')
      .attr('class', 'axis x-axis')
      .attr('transform', 'translate(0,' + contentHeight + ')')

    focus
      .append('g')
      .attr('class', 'axis axis--y')
      .call(yAxis)

    focus
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - mainMargin.left)
      .attr('x', 0 - contentHeight / 2)
      .attr('dy', '1em')
      .attr('class', 'timeline-text')
      .text('Events')

    const countEventsText = focus
      .append('text')
      .attr('x', contentWidth - mainMargin.right)
      .attr('dy', '1em')
      .attr('class', 'timeline-text')
      .attr('text-anchor', 'end')

    const dateWindowText = focus
      .append('text')
      .attr('x', contentWidth - mainMargin.right - 100)
      .attr('dy', '1em')
      .attr('class', 'timeline-text')
      .attr('text-anchor', 'end')

    const mainDots = focus.append('g')
    mainDots.attr('clip-path', 'url(#clip)')

    const miniDots = context.append('g')
    miniDots.attr('clip-path', 'url(#clip)')

    const highlight = focus
      .append('path')
      .attr('class', 'timeline-highlight')
      .attr('d', 'm0,13.37477l7.32175,-13.37477l7.32175,13.37477l-14.6435,0z')
    const highlightLine = focus
      .append('line')
      .attr('y1', '100')
      .attr('y2', '20')
      .attr('class', 'timeline-highlight')

    let currentData = []
    let eventsCount

    function processNodes(data) {
      currentData = data

      function calcHeights(): number {
        const h = {}
        let max = 0
        if (_.isNil(data)) {
          return 0
        }
        for (let i = 0; i < data.length; i++) {
          const d = data[i]
          if (h[d.date]) {
            h[d.date] += 1
          } else {
            h[d.date] = 1
          }
          d.height = h[d.date]
          max = Math.max(max, d.height)
        }

        return max
      }

      let maxHeight = calcHeights()
      data.forEach(d => {
        d.eventDate = parseTime(d.date)
      })

      let xMin = d3.min(data, d => d.eventDate)
      xMin = moment(xMin)
        .add(-10, 'd')
        .toDate()
      let xMax = d3.max(data, d => d.eventDate)
      xMax = moment(xMax)
        .add(+10, 'd')
        .toDate()
      const yMax = Math.max(10, maxHeight)

      x.domain([xMin, xMax])
      y.domain([0, yMax])
      x2.domain([xMin, xMax])
      y2.domain([0, yMax])
      secondx.call(xAxis2)
      firstx.call(xAxis)
      eventsCount = (dataArray, domainRange) =>
        d3.sum(
          dataArray,
          d => d.eventDate >= domainRange.domain()[0] && d.eventDate <= domainRange.domain()[1]
        )
      self.timeWindow = x.domain()
      updateInfo()
      focus
        .selectAll('.event-dot')
        .data(data)
        .enter()
        .append('circle')
        .attr('class', 'event-dot')
        .attr('r', 5)
        .style('opacity', 0.5)
        .attr('cx', d => x(d.eventDate))
        .attr('cy', d => y(d.height))

      miniDots
        .selectAll('.event-dot')
        .data(data)
        .enter()
        .append('circle')
        .attr('class', 'event-dot')
        .attr('r', 4)
        .style('opacity', 0.7)
        .attr('cx', d => x2(d.eventDate))
        .attr('cy', d => y2(d.height))
    }

    function brushed() {
      if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'zoom') {
        // ignore brush-by-zoom
        return
      }

      self.timeWindow = x.domain()
      updateInfo()
      const s = d3.event.selection || x2.range()
      x.domain(s.map(x2.invert, x2))
      focus
        .selectAll('.event-dot')
        .attr('cx', d => x(d.eventDate))
        .attr('cy', d => y(d.height))
      focus.select('.x-axis').call(xAxis)
      self.svg
        .select('.zoom')
        .call(
          zoom.transform,
          d3.zoomIdentity.scale(contentWidth / (s[1] - s[0])).translate(-s[0], 0)
        )
    }

    function zoomed() {
      if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'brush') {
        return
      }
      self.timeWindow = x.domain()
      updateInfo()
      const t = d3.event.transform
      x.domain(t.rescaleX(x2).domain())
      focus
        .selectAll('.event-dot')
        .attr('cx', d => x(d.eventDate))
        .attr('cy', d => y(d.height))
      focus.select('.x-axis').call(xAxis)
      context.select('.brush').call(brush.move, x.range().map(t.invertX, t))
    }

    function updateInfo() {
      if (dateWindowText) {
        dateWindowText.text(
          `From: ${moment(self.timeWindow[0]).format('YYYY-MM-DD')} To:${moment(
            self.timeWindow[1]
          ).format('YYYY-MM-DD')}`
        )
        let selected = 0
        for (let i = 0; i < currentData.length; i++) {
          if (
            new Date(currentData[i].date) <= self.timeWindow[1] &&
            new Date(currentData[i].date) >= self.timeWindow[0]
          ) {
            selected += 1
          }
        }
        countEventsText.text(`Events: ${selected}/${currentData.length}`) // eventsCount(currentData, x)
      }
      highlightCurrent()
      Shared.graph.nodePredicateChanged()
    }

    function highlightCurrent() {
      if (_.isNil(highlight)) {
        return
      }
      if (_.isNil(self.currentNode)) {
        highlight.style('opacity', 0)
        highlightLine.style('opacity', 0)
      } else {
        const hx = x(parseTime(self.currentNode.date)) - 8
        highlight.style('opacity', 1).attr('transform', `translate(${hx}, ${y(1)})`)
        highlightLine
          .style('opacity', 1)
          .attr('x1', hx + 8)
          .attr('x2', hx + 8)
      }
    }

    Shared.store.pipe(select('nodes')).subscribe(ns => {
      this.nodes = ns
      if (!_.isNil(this.nodes) && this.nodes.length > 0) {
        processNodes(this.nodes)
      }
    })

    Shared.store.pipe(select('currentNode')).subscribe(n => {
      this.currentNode = n
      highlightCurrent()
    })
  }

  /**
   * Whether the given node sits in the the time windos.
   * @param node
   */
  isInTimeFrame(node: any) {
    if (this.filteringEnabled) {
      return new Date(node.date) <= this.timeWindow[1] && new Date(node.date) >= this.timeWindow[0]
    }
    return true
  }

  setVisible(value: boolean) {
    this.element.hidden = !value
    this.element.classList.toggle('hidden')
    this.filteringEnabled = value
  }
}
