import { Rectangle } from "./rectangle.mjs";
import { Vector2d } from "./vector2d.mjs";

export const ballDiameter = 10

export class Ball {
  constructor(position, velocity) {
    this.geometry = new Rectangle(position, ballDiameter, ballDiameter)
    this.velocity = velocity
    this.previousPosition = position
  }

  render(ctx) {
    ctx.fillRect(this.geometry.position.x, this.geometry.position.y, this.geometry.width, this.geometry.height)
  }

  update() {
    this.previousPosition = this.geometry.position
    this.geometry.position = this.geometry.position.add(this.velocity)
  }

  bounce(normal) {
    this.previousPosition = this.geometry.position
    const ballSpeed = this.velocity.magnitude()
    const ballUnitVelocity = this.velocity.normalize()

    // 𝑟=𝑑−2(𝑑⋅𝑛)𝑛 
    const reflection = ballUnitVelocity.subtract(normal.multiplyScalar(2 * ballUnitVelocity.dot(normal)))

    this.velocity = reflection.multiplyScalar(ballSpeed)
  }
}

export const paddleWidth = 20
export const paddleHeight = 80

export class Paddle {
  constructor(position) {
    this.geometry = new Rectangle(position, paddleWidth, paddleHeight)
  }

  render(ctx) {
    ctx.fillRect(this.geometry.position.x, this.geometry.position.y, this.geometry.width, this.geometry.height)
  }

  move(amount) {
    // this.geometry.position.y += amount
    this.geometry.position = new Vector2d(this.geometry.position.x, this.geometry.position.y + amount)
  }
}