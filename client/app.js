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
const chatClient = new chatPackage.ChatBot('localhost:3000', grpc.credentials.createInsecure());

//creating feedback client
const feedbackClient = new feedbackPackage.FeedbackCollection('localhost:3000', grpc.credentials.createInsecure());

//creating ticket client
const ticketClient = new ticketPackage.SupportTicket('localhost:3000', grpc.credentials.createInsecure());

//each customer would have a unique customer ID number, ideally, but hardcoding to ensure everything works properly
const cust_id = '20013000950104';

//user messages
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

//Function to call the chat service - Bidirectional Streaming
const startChat = () => {
    const call = chatClient.ChatService();

    //listening for staff messages from the server
    call.on('data', (message) => {
        console.log(`\n[Staff ${message.staff}] (${message.message_time}): ${message.staff_message}`);
    });

    call.on('end', () => {
        console.log('\n[Chat ended by support team]');
        process.exit(0);
    });

    //handling errors
    call.on('error', (e) => {
        console.error('Stream Error:', e.message);
    });

    call.write({user: '${user}', message: 'user_message'});
    call.write({user: '${staff}', message: '${staff_message}'});
    call.end();
};

// Prompt for user's name
rl.question("Enter your name: ", (user) => {
    console.log("Chat started - please type your message and press enter");

    rl.on('line', (input) => {
      const message = {
        cust_id: cust_id,
        user_message: input,
        message_time: new Date().toISOString(),
        user: user
      };
      call.write(message);
    });
});

//start chat
chatStream ();