var grpc = require("@grpc/grpc-js")
var protoLoader = require("@grpc/proto-loader")

//loading and defining feedback proto
var FEEDBACK_PROTO_PATH = __dirname + "/../../protos/feedback.proto"
var feedbackPackageDefinition = protoLoader.loadSync(
    FEEDBACK_PROTO_PATH
)
var feedback_proto = grpc.loadPackageDefinition(feedbackPackageDefinition).feedback

//implementing feedback function - Client streaming RPC
var averageRating = 0
var message = null

function SubmitFeedback(call, callback) {
    let totalRating = 0;
    let count = 0;
    let name = null;
    let errorOccurred = false; //for managing errors during validation checks

    call.on('data', function(feedback) {
        console.log("Received feedback: ", feedback);

        //Validations

        //if name left blank
        if(!feedback.name || feedback.name.trim() === "") {
            errorOccurred = true;
            callback({
                code: grpc.status.INVALID_ARGUMENT,
                message: "Name must not be empty. Please enter your name."
            });
            call.end();
            return;
        }

        //if invalid rating entered
        if(feedback.rating < 1 || feedback.rating > 5 || isNaN(feedback.rating)) {
            errorOccurred = true;
            callback({
                code: grpc.status.INVALID_ARGUMENT,
                message: "Invalid rating entered. Please enter a rating between 1 and 5."
            });
            call.end();
            return;
        }

        if(!name) {
            name = feedback.name;
        }

        totalRating += feedback.rating;
        count +=1;
    });

    call.on('end', function() {
        if (errorOccurred) return; //if the function ended early due to an error rather than ending due to completion

        const averageRating = (count === 0 ) ? 0: (totalRating/count).toFixed(2);
        const message = `Thank you, ${name}! You have submitted ${count} feedback forms. Average rating: ${averageRating}`;

        callback(null, { message: message });
    })

    call.on("error", function (e) {
        console.error("An error occurred: ", e);
    })
}

var server = new grpc.Server()
server.addService(feedback_proto.FeedbackCollection.service, {SubmitFeedback:SubmitFeedback})
server.bindAsync("0.0.0.0:40000", grpc.ServerCredentials.createInsecure(), function() {
    console.log(`Server running at http://0.0.0.0:40000`);
});