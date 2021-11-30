import { Rectangle } from "./rectangle.mjs";
import { Vector2d } from "./vector2d.mjs";
import { Ball, Paddle, paddleWidth, paddleHeight } from "./pong.mjs"
import { WebSocketServer } from "ws"
import { v4 as uuidv4 } from "uuid"

class Player {
  constructor(ws, paddle) {
    this.id = uuidv4()
    this.ws = ws
    this.paddle = paddle
    this.score = 0

    this.ws.on('message', (data) => {
      const message = JSON.parse(data)
      this.paddle.geometry.position = Vector2d.fromPosition(message.position)
    })
  }

  send(data) {
    this.ws.send(JSON.stringify(data))
  }
}

class Players {
  constructor() {
    this.players = []
  }

  add(player) {
    this.players.push(player)
  }

  delete(player) {
    for (let i = 0; i < this.players.length; i++) {
      if (this.players[i].id === player.id) {
        this.players.splice(i, 1)
      }
    }
  }

  count() {
    return this.players.length
  }

  broadcast(message, exceptId) {
    this.players.forEach((p) => {
      if (p.id === exceptId) {
        return
      }
      p.send(message)
    })
  }
}

const paddleInset = 20

class Game {
  constructor() {
    this.boundary = new Rectangle(new Vector2d(0,0), 750, 500) 
    // this.ball = new Ball(new Vector2d(100, 100), new Vector2d(-2, 3))
    this.ball = new Ball(this.boundary.middle(), new Vector2d(-2, 3))
    this.players = new Players()
    this.interval = null
    this.playing = false
    this.tickrate = 1000 / 60

    this.run()
  }

  run() {
    let wss = new WebSocketServer({ port: 8081 })
    wss.on('connection', (ws) => {
      // if game in progress reject additional players
      if (this.playing) {
        ws.terminate()
      }

      const player = this.addPlayer(ws)
      ws.on('close', () => {
        if (this.playing) {
          this.stopGame()
        }

        this.players.delete(player)
      })

      if (this.players.count() === 2 && !this.playing) {
        this.startGame(this.tickrate)
      }
    })
  }

  startGame(tickrate) {
    this.interval = setInterval(this.loop.bind(this), tickrate)
    this.playing = true
  }

  stopGame() {
    clearInterval(this.interval)
    this.playing = false
    this.players.broadcast({'type': 'game_end'})
  }

  addPlayer(ws) {
    const position = this.players.count() === 0
    // left side
    ? new Vector2d(paddleInset, Math.floor(this.boundary.height / 2), - Math.floor(paddleHeight / 2))
    // right side
    : new Vector2d(this.boundary.width - (paddleInset + paddleWidth), Math.floor(this.boundary.height / 2) - Math.floor(paddleHeight / 2))

    const player = new Player(ws, new Paddle(position))
    this.players.add(player)

    player.send({
      type: 'player_join_confirmation',
      boundary : this.boundary,
      ball: this.ball,
      players: this.players.players.map((p) => {
        return {id: p.id, paddle: p.paddle, you: p === player}
      })
    })

    this.players.broadcast({
      type: 'player_connected',
      player: {
        id: player.id,
        paddle: player.paddle
      }
    }, player.id)

    return player
  }

  broadcastGameState() {
    const update = {
      type: 'game_update',
      ball: this.ball,
      players: this.players.players.map((p) => {
        return {
          id: p.id,
          paddle: p.paddle
        }
      })
    }
    this.players.broadcast(update)
  }

  checkIfScored() {
    if (!this.ball.geometry.isOutside(this.boundary)) {
      return
    }

    const side = this.ball.geometry.getRelativeSideFrom(this.boundary)

    if (!(side === 'left' || side === 'right')) {
      return
    }

    let player = this.players.players[side === 'left' ? 1 : 0]
    player.score++

    this.players.broadcast({
      type: 'game_score_update',
      score: Object.fromEntries(this.players.players.map((p) => {
        return [p.id, p.score]
      }))
    })

    this.ball.geometry.position = this.boundary.middle()
    this.ball.velocity = this.ball.velocity.randomizeAngle(0.5)
  }

  resolveBallCollision() {
    const outsideBouundary = this.ball.geometry.getRelativeSideFrom(this.boundary)

    if (outsideBouundary) {
      const sideOfBoundary = this.ball.geometry.getRelativeSideFrom(this.boundary)
      const normal = Rectangle.getInsideCollisionNormal(sideOfBoundary)
      
      this.ball.bounce(normal)
      return
    }

    for (const p of this.players.players) {
      if (p.paddle.geometry.intersects(this.ball.geometry)) {
        const sideOfPaddle = p.paddle.geometry.getIntersectingSide(this.ball.geometry)
        const normal = Rectangle.getOutsideCollisionNormal(sideOfPaddle)
  
        this.ball.bounce(normal)
  
        return
      }
    }
  }

  loop() {
    this.ball.update()
    this.checkIfScored()
    this.resolveBallCollision()
    this.broadcastGameState()
  }
}

new Game()