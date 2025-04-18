const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

// Load proto
const chatProtoPath = path.join(__dirname, 'protos/chat.proto');
const chatProtoDef = protoLoader.loadSync(chatProtoPath);
const chatPackage = grpc.loadPackageDefinition(chatProtoDef).chat;

let clients = [];

const server = new grpc.Server();

//Implementing chat service
server.addService(chatPackage.ChatBot.service, {
    chatService: (call) => {
        grpcClient = call; // Store the gRPC call reference

        call.on('data', (message) => {
            console.log(`[User ${message.user}] (${message.message_time}): ${message.user_message}`);

            // Send response back to client
            const response = {
                staff_id: '050194',
                staff: 'Heather',
                staff_message: `Thanks for your message, ${message.user}. We'll get back to you shortly.`,
                message_time: new Date().toISOString()
            };
            call.write(response);
        });

        call.on('end', () => {
            console.log('End of chat');
            grpcClient = null;
            call.end();
        });

        call.on('error', (err) => {
            console.error('Error with client:', err);
            grpcClient = null;
        });
    }
});

const PORT = '3001';
server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(), () => {
    console.log(`gRPC Chat server running at http://localhost:${PORT}`);
    server.start();
});