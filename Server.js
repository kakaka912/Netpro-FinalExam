const express = require('express')
const expressWs = require('express-ws')

const app = express()
expressWs(app)

const port = process.env.PORT || 3001
let connects = []

app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

function convertHeart(text) {
  const base = text
    .replace(/!/g, "♡")
    .replace(/！/g, "♡")

  return base + "♡"
}

app.ws('/ws', (ws, req) => {
  connects.push(ws)

  ws.on('message', (raw) => {
    const data = JSON.parse(raw.toString())

    // --- チャット ---
    if (data.type === 'chat') {
      const text = data.text || ""
      const converted = convertHeart(text)

      const sendData = {
        type: 'chat',
        id: data.id,
        text: converted
      }

      broadcast(sendData)
      return
    }

    // --- スタンプ ---
    if (data.type === 'stamp') {
      const sendData = {
        type: 'stamp',
        x: data.x,
        y: data.y
      }

      broadcast(sendData)
      return
    }
  })

  ws.on('close', () => {
    connects = connects.filter((conn) => conn !== ws)
  })
})

// 全員に送信
function broadcast(obj) {
  const msg = JSON.stringify(obj)
  connects.forEach((socket) => {
    if (socket.readyState === 1) {
      socket.send(msg)
    }
  })
}

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})