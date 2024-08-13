const express = require("express")
const fs = require('fs')
const https = require("https")
const cors = require('cors');
const app = express()
const server = https.createServer(app)
const socketio = require('socket.io')

//read in our certs
const key = fs.readFileSync('./certs/cert.key')
const cert = fs.readFileSync('./certs/cert.crt')


const secureExpressServer  = https.createServer({key, cert}, app)
secureExpressServer.listen(5000)

const io = socketio(secureExpressServer, {
    cors: [
        //the domains that are allowed
        '192.168.100.27:3000',
        '192.168.100.27:3000'


        // if you have a lot od domains/IP
        // 'localhost:3000',
        // 'localhost:3001',
        // 'localhost:3002',
        // 'localhost:3003',
    ],
    methods: [
        "GET",
        "POST",
    ]
})

// Use CORS middleware with configuration
// app.use(cors({
// 	origin: ['https://192.168.100.27:3000'],
// 	methods: ['GET', 'POST', 'PUT', 'DELETE'],
// 	credentials: true // if you need to send cookies or authorization headers
//   }));

  
io.on("connection", (socket) => {
	socket.emit("me", socket.id)

	socket.on("disconnect", () => {
		socket.broadcast.emit("callEnded")
	})

	socket.on("callUser", (data) => {
		io.to(data.userToCall).emit("callUser", { signal: data.signalData, from: data.from, name: data.name })
	})

	socket.on("answerCall", (data) => {
		io.to(data.to).emit("callAccepted", data.signal)
	})
})

// server.listen(5000, '0.0.0.0', () => console.log("server is running on port 5000"))
