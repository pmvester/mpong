import { Vector2d } from "./vector2d.mjs";

export class Rectangle {
  constructor(position, width, height) {
    this.position = position
    this.width = width
    this.height = height
  }

  // 𝑟=𝑑−2(𝑑⋅𝑛)𝑛

  getOutsideCollisionNormal(geometry) {
    const normals = []

    // return this.position.x < p.x + w && this.position.x + this.width > p.x &&
    //   this.position.y < p.y + h && this.height + this.position.y > p.y
  }

  getInsideCollisionNormal(geometry) {
    const left = geometry.position.x <= this.position.x
    const right = geometry.position.x + geometry.width >= this.position.x + this.width
    const top = geometry.position.y <= this.position.y
    const bottom = geometry.position.y + geometry.height >= this.position.y + this.height

    let normalX = 0
    let normalY = 0

    if (left || right) normalX = left ? 1 : -1
    if (top || bottom) normalY = top ? 1 : -1
     
    if (left || right || top || bottom) {
      return new Vector2d(normalX, normalY)
    } else {
      return null
    }
  }

}