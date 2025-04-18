const grpc = require('@grpc/grpc-js')
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

//loading proto file
const packageDefinition = protoLoader.loadSync(
    path.resolve('C:/Users/heath/dist-systems-ca/protos/chat.proto'), {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
    });

const chatProto = grpc.loadPackageDefinition(packageDefinition).chat;

//connecting clients
let connectedClients = [];

//chat service
function chatService(call) {
    console.log('New user connected');

    //add client to active streams
    connectedClients.push(call);

    //client messages
    call.on('data', (userMessage) => {
        console.log(`From ${userMessage.name} [${userMessage.cust_id}]: ${userMessage.message}`);
    });

    //ending call and error handling
    call.on('end', () => {
        console.log('User disconnected');
        connectedClients = connectedClients.filter((c) => c !== call); 
        call.end();
    });

    call.on('error', (err) => {
        console.error('Client stream error:', err);
    });
}

//starting the server
function main() {
    const server = new grpc.Server();
    server.addService(chatProto.ChatBot.service, { chatService });

    server.bindAsync('0.0.0.0:3000', grpc.ServerCredentials.createInsecure(), (err, port) => {
        if (err) {
            console.error('Server failed to start:', err);
            return;
        }
        console.log(`gRPC server running on port ${port}`);

        //readline for staff input
        const rl = Readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        //promting staff to enter message
        rl.on('line', (input) => {
            const now = new Date().toISOString();
            
            //defining staff message - hardcoding basic info for ease and consistency
            const staffMessage = {
                staff_id: 'HL10047',
                name: 'Customer Support',
                message: input,
                message_time: now,
            };

            connectedClients.forEach((clientCall) => {
                clientCall.write(staffMessage);
            });
        });
    });
}

main();




//Express - for GUI
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var readlineSync = require('readline-sync');
const readline = require("readline");
var indexRouter = require('../public/routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use(express.static(__dirname));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

//gRPC
const grpc = require('@grpc/grpc-js')
const protoLoader = require('@grpc/proto-loader');

//loading proto file
const packageDefinition = protoLoader.loadSync(
    path.resolve('C:/Users/heath/dist-systems-ca/protos/chat.proto'), {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
    });

const chatProto = grpc.loadPackageDefinition(packageDefinition).chat;

//connecting clients
let connectedClients = [];

//chat service
function chatService(call) {
    console.log('New user connected');

    //add client to active streams
    connectedClients.push(call);

    //client messages
    call.on('data', (userMessage) => {
        console.log(`From ${userMessage.name} [${userMessage.cust_id}]: ${userMessage.message}`);
    });

    //ending call and error handling
    call.on('end', () => {
        console.log('User disconnected');
        connectedClients = connectedClients.filter((c) => c !== call); 
        call.end();
    });

    call.on('error', (err) => {
        console.error('Client stream error:', err);
    });
}

//starting the server
function main() {
    const server = new grpc.Server();
    server.addService(chatProto.ChatBot.service, { chatService });

    server.bindAsync('0.0.0.0:3000', grpc.ServerCredentials.createInsecure(), (err, port) => {
        if (err) {
            console.error('Server failed to start:', err);
            return;
        }
        console.log(`gRPC server running on port ${port}`);

        //readline for staff input
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        //promting staff to enter message
        rl.on('line', (input) => {
            const now = new Date().toISOString();
            
            //defining staff message - hardcoding basic info for ease and consistency
            const staffMessage = {
                staff_id: 'HL10047',
                name: 'Customer Support',
                message: input,
                message_time: now,
            };

            connectedClients.forEach((clientCall) => {
                clientCall.write(staffMessage);
            });
        });
    });
}

main();

module.exports = app;