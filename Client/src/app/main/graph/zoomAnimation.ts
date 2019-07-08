import { BaseClass, IAnimation, TimeSpan } from 'yfiles'

export class ZoomAnimation extends BaseClass<IAnimation>(IAnimation) implements IAnimation {
  private canvas: any
  private targetZoomLog: number
  private $preferredDuration: TimeSpan
  private $delta: number
  private $initialZoomLog: number
  private zoomPoint: any

  constructor(canvas, targetZoom, zoomPoint, duration) {
    super()
    this.canvas = canvas
    this.targetZoomLog = Math.log(targetZoom) / Math.log(2)
    this.$preferredDuration = new TimeSpan(duration)
    this.$delta = 0
    this.$initialZoomLog = 0
    this.zoomPoint = zoomPoint
  }

  get preferredDuration() {
    return this.$preferredDuration
  }

  set preferredDuration(value) {
    this.$preferredDuration = value
  }

  get delta() {
    return this.$delta
  }

  set delta(value) {
    this.$delta = value
  }

  /**
   * Binary logarithm of the initial zoom level.
   * @type {number}
   */
  get initialZoomLog() {
    return this.$initialZoomLog
  }

  /** @type {number} */
  set initialZoomLog(value) {
    this.$initialZoomLog = value
  }

  /**
   * Initializes the animation.
   */
  initialize() {
    this.initialZoomLog = Math.log(this.canvas.zoom) / Math.log(2)
    this.delta = this.targetZoomLog - this.initialZoomLog
  }

  /**
   * Does the animation according to the relative animation time.
   * The animation starts with the time 0 and ends with time 1.
   * @param {number} time
   */
  animate(time) {
    const newZoom = this.initialZoomLog + this.delta * time
    this.canvas.zoomTo(this.zoomPoint, Math.pow(2, newZoom))
  }

  cleanUp() {}
}
