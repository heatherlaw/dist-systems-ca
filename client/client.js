var readlineSync = require('readline-sync');
var readline = require('readline');
var grpc = require("@grpc/grpc-js");
var protoLoader = require("@grpc/proto-loader");

//loading and defining feedback proto
var FEEDBACK_PROTO_PATH = (__dirname + "/../protos/feedback.proto");
var feedbackPackageDefinition = protoLoader.loadSync(
    FEEDBACK_PROTO_PATH
);
var feedback_proto = grpc.loadPackageDefinition(feedbackPackageDefinition).feedback;
var client = new feedback_proto.FeedbackCollection("0.0.0.0:40000", grpc.credentials.createInsecure());

//implementing submit feedback function
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

//get the user's name
rl.question('What is your name? ', (user) => {
    //get the user's rating
    console.log('How would you rate your experience today? Please enter a rating from 1-5 or enter q to quit.');

    const call = client.SubmitFeedback();

    call.on('data', function(resp) {
    console.log(resp.message);
    });

    //if function is ended
    call.on('end', function() {
        console.log("Feedback session ended. Thank you for visiting!");
    });

    //in case of error
    call.on("error", function(e) {
        console.log("An error occurred", e);
    });

    rl.on('line', (input) => {
        //if the user opts to quit
        if(input === "q" || input ==="Q") {
            call.end();
            rl.close();
            return;
        }
    
        const rating = parseInt(input);

        //if rating is invalid
        if (isNaN(rating) || rating < 0 || rating > 5) {
            console.log("This is not a valid rating, please enter a number from 1-5 or enter q to quit.");
            return;
        }

        //written review
        rl.question('Any additional comments? ', (review) => {
            call.write({
                name: user,
                review: review,
                rating: rating,
            });
            console.log('You can enter further ratings and comments or enter q to quit.');
        });
    });
});