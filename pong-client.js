import { Ball, Paddle } from "./pong.mjs"
import { Rectangle } from "./rectangle.mjs"
import { Vector2d } from "./vector2d.mjs"

class Player {
  constructor(id, paddle) {
    this.id = id
    this.paddle = paddle
  }
}

class Game {
  constructor(canvas, ws) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.ws = ws

    this.boundary = new Rectangle(new Vector2d(0,0), 750, 500)
    this.players = []
    this.player = null
    // position ball somewhere in the middle
    this.ball = new Ball(new Vector2d(Math.floor(this.boundary.width / 2), Math.floor(this.boundary.height / 2)))

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data)
      this.handleMessage(message)
    }

    ws.onopen = () => {
      this.startGame(1000 / 60)
    }
  }

  assignControl(paddle) {
    const keyMoveUp = 'KeyW'
    const KeyMoveDown = 'KeyS'
    const step = 15

    document.addEventListener('keypress', (e) => {
      if (e.code === keyMoveUp) {
        paddle.move(-step)
        this.sendPaddlePosition()
        for (const p of this.players) {
        }
      } else if (e.code === KeyMoveDown) {
        paddle.move(step)
        this.sendPaddlePosition()
      }
    })
  }

  sendPaddlePosition() {
    const data = {
      position: this.player.paddle.geometry.position
    }
    this.ws.send(JSON.stringify(data))
  }

  startGame(tickrate) {
    setInterval(this.loop.bind(this), tickrate)
  }

  loop() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.ball.render(this.ctx)

    for (const p of this.players) {
      p.paddle.render(this.ctx)
    }
  }

  handleMessage(message) {
    const createPlayer = (p) => {
      const paddle = new Paddle(Vector2d.fromPosition(p.paddle.geometry.position))
      return new Player(p.id, paddle)
    }

    switch (message.type) {
      case 'player_connected':
        this.players.push(createPlayer(message.player))
        break
      case 'player_join_confirmation':
        this.boundary = new Rectangle(
          Vector2d.fromPosition(message.boundary.position), 
          message.boundary.width,
          message.boundary.height
        )

        for (const p of message.players) {
          const player = createPlayer(p)
          this.players.push(player)

          if (p.you) {
            this.player = player
            this.assignControl(player.paddle)
          }
        }
        break
      case 'game_update':
        this.ball.geometry.position = Vector2d.fromPosition(message.ball.geometry.position)

        for (const ps of message.players) {
          for (const p of this.players) {
            if (p.id === ps.id) {
              // p.paddle.geometry.position = Vector2d.fromPosition(ps.paddle.geometry.position)
              p.paddle.geometry.position.y = ps.paddle.geometry.position.y
            }
          }
        }
    }
  }
}

window.onload = () => {
  const wss = "ws://" + location.hostname + ":8081"
  console.log('connecting to ' + wss)
  let ws = new WebSocket(wss, "pong")
  new Game(document.getElementById('gameCanvas'), ws)
}