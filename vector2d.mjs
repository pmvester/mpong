export class Vector2d {
  constructor(x, y) {
    this.x = x
    this.y = y
  }

  static fromPosition(position) {
    return new Vector2d(position.x, position.y)
  }

  static combine(...vectors) {
    const x = vectors.reduce((x, v) => x + v.x)
    const y = vectors.reduce((y, v) => y + v.y)

    return new Vector2d(x / vectors.length, y / vectors.length)
  }

  magnitude() {
    return Math.sqrt(this.x * this.x, this.y * this.y)
  }

  normalize() {
    const magnitude = this.magnitude()

    return new Vector2d(this.x / magnitude, this.y / magnitude)
  }

  dot(other) {
    return this.x * other.x + this.y * other.y
  }

  add(other) {
    return new Vector2d(this.x + other.x, this.y + other.y)
  }

  subtract(other) {
    return new Vector2d(this.x - other.x, this.y - other.y)
  }

  multiplyScalar(s) {
    return new Vector2d(this.x * s, this.y * s)
  }
}