import { Vector2d } from "./vector2d.mjs";

export class Rectangle {
  constructor(position, width, height) {
    this.position = position
    this.width = width
    this.height = height
  }

  middle() {
    return new Vector2d((this.width / 2) + this.position.x, (this.height / 2) + this.position.y )
  }

  getRelativeSideFrom(geometry) {
    // assuming that there is a an outside boundary condition
    if (this.position.x <= geometry.position.x) return 'left'
    if (this.position.x + this.width >= geometry.position.x + geometry.width) return 'right'
    if (this.position.y <= geometry.position.y) return 'top'
    if (this.position.y + this.height >= geometry.position.y + geometry.height) return 'bottom'
  }

  isOutside(geometry) {
    return this.position.x <= geometry.position.x ||
      this.position.x + this.width >= geometry.position.x + geometry.width ||
      this.position.y <= geometry.position.y ||
      this.position.y + this.height >= geometry.position.y + geometry.height
  }

  intersects(geometry) {
    return this.position.x + this.width >= geometry.position.x &&
      this.position.x <= geometry.position.x + geometry.width &&
      this.position.y + this.height >= geometry.position.y &&
      this.position.y <= geometry.position.y + geometry.height
  }

  getIntersectingSide(geometry) {
    const geometryBottom = geometry.position.y + geometry.height
    const thisBottom = this.position.y + this.height
    const geometryRight = geometry.position.x + geometry.width
    const thisRight = this.position.x + this.width

    const bottomD = thisBottom - geometry.position.y
    const topD = geometryBottom - this.position.y
    const leftD = geometryRight - this.position.x
    const rightD = thisRight - geometry.position.x

    if (topD <= bottomD && topD <= leftD && topD <= rightD) {
      return 'top'
    }

    if (bottomD <= topD && bottomD <= leftD && bottomD <= rightD) {
      return 'bottom'
    }

    if (leftD <= rightD && leftD <= topD && leftD <= bottomD) {
      return 'left'
    }

    if (rightD <= leftD && rightD <= topD && rightD <= bottomD) {
      return 'right'
    }
  }

  static getInsideCollisionNormal(side) {
    switch (side) {
      case 'left': return new Vector2d(1, 0)
      case 'right': return new Vector2d(-1, 0)
      case 'top': return new Vector2d(0, 1)
      case 'bottom': return new Vector2d(0, -1)
    }
  }

  static getOutsideCollisionNormal(side) {
    return this.getInsideCollisionNormal(side).reverse()
  }
}