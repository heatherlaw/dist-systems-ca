const {fork} = require('child_process');
const path = require('path');

//starting server.js - Express server
const expressServer = fork(path.join(__dirname, 'server.js'));

//starting server/app.js - WebSocket
const wSocket = fork(path.join(__dirname, 'server', 'app.js'));

//starting gRPC server
const grpcServer = fork(path.join(__dirname, 'grpc-server.js'));

//starting gRPC client
const grpcClient = fork(path.join(__dirname, 'client', 'app.js'));

//Exits
const services = [expressServer, wSocket];
services.forEach(proc => {
    proc.on('exit', (code) => {
        console.log(`${proc.spawnargs[1]} exited with code ${code}`);
    });
});

console.log('Services launched');