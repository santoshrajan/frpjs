// Socket.io functions

const io     = require('socket.io'),
      Socket = {}

Socket.io.connectToServer = function(http) {
    let io = io(http)
    return io
}

Socket.io.on = function(name) {
    return function(next) {
        io.on(name, next)
    }
}

Socket.io.emit = function(name, msg) {
    io.emit(name, msg)
}

Socket.socket.on = function(socket, name) {
    return function(next) {
        socket.on(name, next)
    }
}

export default Socket