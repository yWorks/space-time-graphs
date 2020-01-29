import { FilteredGraphWrapper } from 'yfiles'
import { MainComponent } from './main.component'
import { GraphLayer } from './graph/graphLayer'
import { TimelineLeafletControl } from './timeline/timeline'
import { Store } from '@ngrx/store'
import { IAppState } from '../store/IAppState'

/**
 * The three main visualization modes.
 */
export enum GraphMode {
  geo = 'Geographic layout',
  centric = 'Concentric layout',
  tree = 'Tree layout'
}

export class Shared {
  /**
   * The switch between the different modes.
   */
  static graphMode: GraphMode = GraphMode.geo

  /**
   * Instance of the Leaflet GraphLayer.
   */
  static graphLayer: GraphLayer

  /**
   * Root of the Angular component.
   */
  static rootElement: HTMLElement

  /**
   * Instance of the TimelineControl (Leaflet Control).
   */
  static timelineControl: TimelineLeafletControl

  /**
   * yFiles graph across the different visualization elements.
   */
  static graph: FilteredGraphWrapper

  /**
   * The main component.
   */
  static rootComponent: MainComponent

  static store: Store<IAppState>
}

export class Utils {
  static addClass(/**Element*/ e, /**string*/ className) {
    const classes = e.getAttribute('class')
    if (classes === null || classes === '') {
      e.setAttribute('class', className)
    } else if (!Utils.hasClass(e, className)) {
      e.setAttribute('class', `${classes} ${className}`)
    }
    return e
  }

  static removeClass(/**Element*/ e, /**string*/ className) {
    const classes = e.getAttribute('class')
    if (classes !== null && classes !== '') {
      if (classes === className) {
        e.setAttribute('class', '')
      } else {
        const result = classes
          .split(' ')
          .filter(s => s !== className)
          .join(' ')
        e.setAttribute('class', result)
      }
    }
    return e
  }

  static hasClass(/**Element*/ e, /**string*/ className) {
    const classes = e.getAttribute('class')
    const r = new RegExp(`\\b${className}\\b`, '')
    return r.test(classes)
  }

}
