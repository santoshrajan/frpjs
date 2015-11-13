// Node Server for socket.io chat example using frpjs

var express = require('express'),
    app = express(),
    http = require('http').Server(app),
    frp = require('frpjs')

app.use(express.static('public'))

frp.io.connectToServer(http)

var connectionEvent       = frp.io.on('connection'),
    connectionToSockEvent = socket => frp.socket.on(socket, 'chat message')
    msgEvent              = frp.bind(connectionEvent, connectionToSockEvent)

msgEvent(msg => frp.io.emit('chat message', msg))

http.listen(3000, function(){
  console.log('listening on *:3000')
})