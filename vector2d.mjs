export class Vector2d {
  constructor(x, y) {
    this.x = x
    this.y = y
  }

  static fromPosition(position) {
    return new Vector2d(position.x, position.y)
  }

  reverse() {
    return new Vector2d(-this.x, -this.y)
  }

  randomizeAngle(minComponent) {
    const randomComponent = (min) => {
      const max = 1
      const value = Math.random() * (max - min + 1) + min
      const sign = Math.random() < 0.5 ? 1 : -1

      return value * sign
    }

    const magnitude = this.magnitude()
    const angle = new Vector2d(randomComponent(minComponent), randomComponent(minComponent)).normalize()

    return angle.multiplyScalar(magnitude)
  }

  normalize() {
    const magnitude = this.magnitude()

    return new Vector2d(this.x / magnitude, this.y / magnitude)
  }

  dot(other) {
    return this.x * other.x + this.y * other.y
  }

  magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y)
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