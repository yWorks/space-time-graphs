import { BaseClass, IPropertyObservable, PropertyChangedEventArgs } from 'yfiles'

export interface IGraph {
  nodes: Array<INode>
  edge: Array<IEdge>
}

export interface IGraphElement {
  id: number
}

export interface INode extends IGraphElement {
  lat: number
  lng: number
  level: number
  name: string
  image: string
  style: string
  badges: string[]
  date: string
  description: string

  toJson(): () => any
}

export interface IEdge extends IGraphElement {
  from: string
  to: string

  toJson(): () => any
}

export class NodeData extends BaseClass<IPropertyObservable>(IPropertyObservable)
  implements IPropertyObservable, INode {
  private listeners = []
  _id: number
  _image: string
  _name: string
  _lat: number
  _lng: number
  _level: number
  _style: any
  _badges: string[]
  _date: string
  _description: string

  get lat(): number {
    return this._lat
  }

  set lat(value) {
    this._lat = value
    this.listeners.forEach(listener => listener(this, new PropertyChangedEventArgs('lat')))
  }

  get level(): number {
    return this._level
  }

  set level(value) {
    this._level = value
    this.listeners.forEach(listener => listener(this, new PropertyChangedEventArgs('level')))
  }

  get badges(): string[] {
    return this._badges
  }

  set badges(value) {
    this._badges = value
    this.listeners.forEach(listener => listener(this, new PropertyChangedEventArgs('badges')))
  }

  get lng(): number {
    return this._lng
  }

  set lng(value) {
    this._lng = value
    this.listeners.forEach(listener => listener(this, new PropertyChangedEventArgs('lng')))
  }

  get name(): string {
    return this._name
  }

  set name(value) {
    this._name = value
    this.listeners.forEach(listener => listener(this, new PropertyChangedEventArgs('name')))
  }

  get id(): number {
    return this._id
  }

  set id(value) {
    this._id = value
    this.listeners.forEach(listener => listener(this, new PropertyChangedEventArgs('id')))
  }

  get image(): string {
    return this._image
  }

  set image(value) {
    this._image = value
    this.listeners.forEach(listener => listener(this, new PropertyChangedEventArgs('image')))
  }

  get style(): string {
    return this._style
  }

  set style(value) {
    this._style = value
    this.listeners.forEach(listener => listener(this, new PropertyChangedEventArgs('style')))
  }

  get description(): string {
    return this._description
  }

  set description(value) {
    this._description = value
    this.listeners.forEach(listener => listener(this, new PropertyChangedEventArgs('description')))
  }

  get date(): string {
    return this._date
  }

  set date(value: string) {
    this._date = value
    this.listeners.forEach(listener => listener(this, new PropertyChangedEventArgs('date')))
  }

  addPropertyChangedListener(listener) {
    this.listeners.push(listener)
  }

  removePropertyChangedListener(listener) {
    this.listeners.splice(this.listeners.indexOf(listener), 1)
  }

  constructor(n: any) {
    super()
    this._image = n.image
    this._id = n.id
    this._name = n.name

    this._lat = n.lat
    this._lng = n.lng
    this._style = n.style
    this._badges = n.badges
    this._date = n.date
    this._level = n.level
    this._description = n.description
  }

  toJson(): any {
    return {
      id: this.id,
      image: this.image,
      name: this.name,
      level: this.level,
      lat: this.lat,
      lng: this.lng,
      style: this.style,
      date: this.date,
      badges: this.badges,
      description: this.description
    }
  }
}

export class EdgeData implements IEdge {
  from: string
  to: string
  id: number

  constructor(e: any) {
    this.from = e.from
    this.to = e.to
    this.id = e.id
  }

  toJson(): any {
    return {
      from: this.from,
      to: this.to,
      id: this.id
    }
  }
}
