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

//creating readline interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

//getting user's name
var name ="";

function namePrompt() {
    rl.question('What is your name? ', (userInput) => {
        //if name isn't valid
        if(!userInput || userInput.trim() ==="") {
            console.log("This name is not valid. Please try again. ");
            return namePrompt(); //ask for the name again
        }

        name = userInput.trim();
        startChat();
    });
}

//starting chat
function startChat () {
    var call = client.chatService((err, response) => {
        if (err) {
            console.error("An error occurred: ", err.message);
        }
        else {
            console.log("Chat session ended: ", response.message);
        }
        rl.close();
    });

    call.on('data', function (resp) {
        console.log(`From ${resp.name} : ${resp.message}`)
    });
    
    call.on('end', function() {
        console.log("Chat session ended. Thank you!");
        rl.close();
    });
    
    call.on("error", function(e) {
        console.log ("Cannot connect to the chat server");
        rl.close();
    });

    call.write ({
        name: name,
        message: name + " has joined the chat"
    })

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
}

//starting chat session
namePrompt();