import { FilteredGraphWrapper } from 'yfiles'
import { MainComponent } from './main.component'
import { GraphLayer } from './graph/graphLayer'
import { TimelineLeafletControl } from './timeline/timeline'
import * as _ from 'lodash'
import { Subscription } from 'rxjs'
import { select, Store } from '@ngrx/store'
import * as faker from 'faker'
import { AddEdge, AddNode } from '../store/actions/graphActions'
import { EdgeData, NodeData } from './data/entities'
import * as moment from 'moment'
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
  /**
   * Adds a random node and links it to a randomly chosen existing node.
   */
  static addRandomNode(store) {
    const newId = _.random(50, 1e10)
    let otherNode = null
    let secondNode = null

    function getTwo(items) {
      otherNode = _.sample(items)
      secondNode = _.sample(items)
    }

    const sub: Subscription = store.pipe(select('nodes')).subscribe(getTwo)
    sub.unsubscribe()
    const baseDate = '2016-10-16'
    const offset = _.random(-300, 300)
    const blob = {
      id: newId,
      name: faker.name.findName(),
      lat: _.random(45.0, 55.0),
      lng: _.random(6.4, 22.6),
      image: 'assets/person.png',
      style: 'entity',
      belongsToGroup: false,
      badges: _.sampleSize(
        ['ar', 'tf', 'co', 'p', 'a', 'mv', 'po', 'me', 'mo', 'r', 'rh', 's'],
        _.random(1, 8)
      ),
      enter: [
        moment(baseDate)
          .add(offset, 'd')
          .toDate()
          .toString()
      ],
      exit: [
        moment(baseDate)
          .add(offset + 1, 'd')
          .toDate()
          .toString()
      ]
    }
    store.dispatch(new AddNode(new NodeData(blob)))
    if (!_.isNil(otherNode)) {
      // likely no other nodes yet

      store.dispatch(
        new AddEdge(
          new EdgeData({
            from: newId.toString(),
            to: otherNode.id.toString(),
            id: _.random(50, 1e10)
          })
        )
      )
    }

    // small chance of connecting to a second one
    if (Math.random() < 0.3 && otherNode && otherNode.id !== secondNode.id) {
      store.dispatch(
        new AddEdge(
          new EdgeData({
            from: newId.toString(),
            to: secondNode.id.toString(),
            id: _.random(50, 1e10)
          })
        )
      )
    }
  }
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

  static toggleClass(/**Element*/ e, /**string*/ className) {
    if (Utils.hasClass(e, className)) {
      Utils.removeClass(e, className)
    } else {
      Utils.addClass(e, className)
    }
    return e
  }
}
