//Websocket
const WebSocket = require('ws');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

// Load proto
const chatProto = protoLoader.loadSync(path.join(__dirname, '../protos/chat.proto'));
const chatPackage = grpc.loadPackageDefinition(chatProto).chat;

// Create gRPC client
const chatClient = new chatPackage.ChatBot('localhost:3000', grpc.credentials.createInsecure());

// Create WebSocket server
const socket = new WebSocket.Server({port: 8081});

console.log('WebSocket server running on ws://localhost:8081');

socket.on('connection', (ws) => {
    console.log('Client connected through WebSocket');

    //gRPC bidirectional stream
    const call = chatClient.chatService();

    //receiving messages from staff
    call.on('data', (staffMsg) => {
        ws.send(JSON.stringify({
            type: 'staff', 
            from: staffMsg.staff,
            message: staffMsg.staff_nessage,
            time: staffMsg.message_time
        }));
    });

    call.on('end', () => {
        ws.send(JSON.stringify({type: 'system', message: 'Chat ended by staff'}));
        ws.close();
    });

    call.on('error', (err) => {
        console.error('gRPC error', err);
        ws.send(JSON.stringify({type: 'error', message: err.message}));
    });

    //receiving messages to forward to gRPC
    ws.on('message', (data) => {
        try {
            const {user, message} = JSON.parse(data);
            const now = new Date().toISOString();

            call.write ({
                cust_id: '20013000950104', //as explained earlier, customer ID is hardcoded
                user_message: message,
                message_time: now,
                user: user
            });
        }
        catch (err) {
            console.error('Invalid message:', err);
        }
    });

    ws.on('close', () => {
        console.log('Connection closed');
        call.end();
    });
});