var grpc = require("@grpc/grpc-js")
var protoLoader = require("@grpc/proto-loader")

//loading and definiting chat proto
var CHAT_PROTO_PATH = __dirname + "/../protos/chat.proto"
var chatPackageDefinition = protoLoader.loadSync(
    CHAT_PROTO_PATH
)

var chat_proto = grpc.loadPackageDefinition(chatPackageDefinition).chat

//loading and defining feedback proto
var FEEDBACK_PROTO_PATH = __dirname + "/../protos/feedback.proto"
var feedbackPackageDefinition = protoLoader.loadSync(
    FEEDBACK_PROTO_PATH
)
var feedback_proto = grpc.loadPackageDefinition(feedbackPackageDefinition).feedback

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

//implementing feedback function
var reviews = {

}

var ratings = {

}

var clients = {

}

var averageRating = 0
var message = null

function SubmitFeedback(call) {
    call.on('data', function(feedback) {

            if(!(feedback.name in clients)) {
                clients[feedback.name] = {
                    name: feedback.name, 
                    call: call    
                } 
            }

            if(!(feedback.name in reviews)) {
                reviews[feedback.name] = 0
            }

        reviews[feedback.name] += 1

        if(!(feedback.feedback == averageRating) || !message) {
            averageRating = (ratings+feedback)/reviews
            message = "Thank you, " + feedback.name + " for your feedback! The average rating of your reviews is " + feedback.averageRating
        }

        for(var client in clients) {
            clients[client].call.write(
                {
                    message: feedback.message
                }
            )
        }
    })

    call.on('end', function() {
        call.end()
    })

    call.on("error", function (e) {
        console.log(e)
    })
}

var server = new grpc.Server()
server.addService(chat_proto.ChatBot.service, {chatService:chatService})
server.addService(feedback_proto.FeedbackCollection.service, {SubmitFeedback:SubmitFeedback})
server.bindAsync("0.0.0.0:40000", grpc.ServerCredentials.createInsecure(), function() {
    server.start()
})