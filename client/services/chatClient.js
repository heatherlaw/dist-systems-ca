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
var client = new chat_proto.ChatService('localhost:40000', grpc.credentials.createInsecure());

//getting user's name
var name = readlineSync.question("What is your name?");
var call = client.sendMessage();

call.on('data', function(resp) {
    console.log(resp.name + ": " + resp.message)
});

call.on('end', function() {

});

call.on("error", function(e) {
    console.log ("Cannot connect to the chat server")
});

call.write ({
    message: name + " has joined the chat",
    name: name
})

//creating readline interface
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.on("line", function(message) {
    if(message.toLowerCase() === "q") {
        call.write({
            message: name + " has left the chat",
            name: name
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