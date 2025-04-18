const grpc = require('@grpc/grpc-js');
var readlineSync = require('readline-sync');
const readline = require("readline");
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
var axios = require('axios');

//loading proto files
const chatProto = protoLoader.loadSync(path.join(__dirname, '../protos/chat.proto'));
const feedbackProto = protoLoader.loadSync(path.join(__dirname, '../protos/feedback.proto'));
const ticketProto = protoLoader.loadSync(path.join(__dirname, '../protos/ticket.proto'));

//gRPC package definitions
const chatPackage = grpc.loadPackageDefinition(chatProto).ChatBot;
const feedbackPackage = grpc.loadPackageDefinition(feedbackProto).FeedbackCollection;
const ticketPackage = grpc.loadPackageDefinition(ticketProto).SupportTicket;

//creating chat client
const chatClient = new chatPackage('localhost:3000', grpc.credentials.createInsecure());

//creating feedback client
const feedbackClient = new feedbackPackage('localhost:3000', grpc.credentials.createInsecure());

//creating ticket client
const ticketClient = new ticketPackage('localhost:3000', grpc.credentials.createInsecure());

//Function to call the chat service - Bidirectional Streaming
const chatStream = () => {
    const call = chatClient.ChatStream();

    call.on('data', (staff_message) => {
            console.log('Support Team Response: ', staff_message);
    });

    call.on('end', () => {
        console.log('Chat ended');
    });

    //handling errors
    call.on('error', (e) => {
        console.error('Error:', e.message);
    });
};

//start chat
chatStream ();





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