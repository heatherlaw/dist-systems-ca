var grpc = require("@grpc/grpc-js")
var protoLoader = require("@grpc/proto-loader")

//loading and definiting chat proto
var CHAT_PROTO_PATH = __dirname + "/../../protos/chat.proto"
var chatPackageDefinition = protoLoader.loadSync(
    CHAT_PROTO_PATH
)

var chat_proto = grpc.loadPackageDefinition(chatPackageDefinition).chat

//implementing chat function
var clients = {

}

var messages = {

}

function chatService(call) {
    call.on('data', function(chat) {

        if(!(chat.name in clients)) {
            clients[chat.name] = {
                name: chat.name,
                call: call
            }
        }

        if(!(chat.name in messages)) {
            messages[chat.name] = 0
        }
    })
}

var server = new grpc.Server()
server.addService(chat_proto.ChatBot.service, {chatService:chatService})
server.bindAsync("0.0.0.0:40000", grpc.ServerCredentials.createInsecure(), function() {
    console.log(`Server running at http://0.0.0.0:40000`);
});