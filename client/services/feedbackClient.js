var readlineSync = require('readline-sync');
var readline = require('readline');
var grpc = require("@grpc/grpc-js");
var protoLoader = require("@grpc/proto-loader");

//loading and defining feedback proto
var FEEDBACK_PROTO_PATH = (__dirname + "/../../protos/feedback.proto");
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

//variables
let call;
let name;

//starting the feedback session and getting user name
function startFeedback() {
    call = client.SubmitFeedback((err, response) => {
        if (err) {
            console.error("An error occurred: ", err.message);
        }
        else {
            console.log("Feedback session ended: ", response.message);
        }
        rl.close();
    });

    call.on("error", (e) => {
        console.error("Stream error: ", e.message);
        rl.close();
    });

    call.on("data", (resp) => {
        console.log(resp.message);
    });

    call.on("end", () => {
        console.log("Feedback session ended. Thank you for visiting!");
        rl.close();
    });

    namePrompt();
};

//prompting the user for their name
function namePrompt() {
    rl.question('What is your name? ', (userInput) => {
        //if name isn't valid
        if(!userInput || userInput.trim() ==="") {
            console.log("This name is not valid. Please try again. ");
            return namePrompt(); //ask for the name again
        }

        name = userInput.trim();
        console.log('How would you rate your experience today? Please enter a rating from 1-5 or enter q to quit.');
        rl.prompt();
    });
}

//Rating and review
rl.on('line', (input) => {
    if(!call) {
        startFeedback();
        return;
    }

    //if the user chooses to quit
    if(input.toLowerCase() === "q") { //ensures they can enter upper or lowercase Q to quit
        call.end();
        return;
    }

    const rating = parseInt(input, 10);

    //validating rating - must be number between 1 and 5
    if(isNaN(rating) || rating < 1 || rating > 5) {
        console.log("This is not a valid rating, please enter a number from 1-5 or enter q to quit.");
        rl.prompt();
        return;
    }

    rl.question('Any additional comments? ', (review) => {
        call.write({
            name: name,
            review: review,
            rating: rating,
        });
        console.log('Feedback sent! Thank you, your feedback is important to us. Enter Q to quit.');
        rl.prompt();
    });
});

//starting the feedback session
startFeedback();