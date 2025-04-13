const grpc = require('@grpc/grpc-js');
var readlineSync = require('readline-sync');
const readline = require("readline");
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

//loading chat proto definition
const packageDefinition = protoLoader.loadSync(
    'C:/Users/heath/dist-systems-ca/protos/chat.proto', 
    {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
    });

const chatProto = grpc.loadPackageDefinition(packageDefinition).chat;

//gRPC client
const client = new chatProto.ChatBot('localhost:3000', grpc.credentials.createInsecure());

//getting the user's name
const name = readlineSync.question("What is your name?");

//each customer would have a unique customer ID number, ideally, but hardcoding to ensure everything works properly
const cust_id = '20013000950104';

//starting the chat
const call = client.chatService();

//staff messages
call.on('data', (message) => {
    console.log(`${message.name}: [Staff ${message.staff_id}]: ${message.message} (${message.message_time})`);
});

call.on('end', () => {
    console.log('Chat ended by server.');
});

//handling errors
call.on('error', (e) => {
    console.error('Error:', e.message);
});

//user messages
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.on('line', (input) => {
    //getting message date variable
    const now = new Date().toISOString();

    const userMessage = {
        cust_id: cust_id,
        name: name,
        message: input,
        message_time: now,
    };
    call.write(userMessage);
});