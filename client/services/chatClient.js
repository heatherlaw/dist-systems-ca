var readlineSync = require('readline-sync');
var readline = require('readline');
var grpc = require("@grpc/grpc-js");
var protoLoader = require("@grpc/proto-loader");

//loading and definiting chat proto
var CHAT_PROTO_PATH = __dirname + "/../../protos/chat.proto"
var chatPackageDefinition = protoLoader.loadSync(
    CHAT_PROTO_PATH
);
var chat_proto = grpc.loadPackageDefinition(chatPackageDefinition).chat

//connecting to server
var client = new chat_proto.ChatBot('localhost:40000', grpc.credentials.createInsecure());

//getting user's name
var name = readlineSync.question("What is your name?");
var call = client.chatService();

call.on('data', function(resp) {
    console.log(`From ${resp.name} : ${resp.message}`)
});

call.on('end', function() {

});

call.on("error", function(e) {
    console.log ("Cannot connect to the chat server")
});

call.write ({
    name: name,
    message: name + " has joined the chat"
})

//creating readline interface
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.on("line", function(message) {
    if(message.toLowerCase() === "q") {
        call.write({
            name: name,       
            message: name + " has left the chat"            
        });
        call.end();
        rl.close();
    }

    else {
        call.write({
            message: message,
            name: name
        });
    }
});