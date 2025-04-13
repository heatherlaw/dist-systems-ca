const grpc = require('@grpc/grpc-js')
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

//loading proto file
const packageDefinition = protoLoader.loadSync(
    path.resolve('C:/Users/heath/dist-systems-ca/protos/chat.proto'), {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
    });

const chatProto = grpc.loadPackageDefinition(packageDefinition).chat;

//connecting clients
let connectedClients = [];

//chat service
function chatService(call) {
    console.log('New user connected');

    //add client to active streams
    connectedClients.push(call);

    //client messages
    call.on('data', (userMessage) => {
        console.log(`From ${userMessage.name} [${userMessage.cust_id}]: ${userMessage.message}`);
    });

    //ending call and error handling
    call.on('end', () => {
        console.log('User disconnected');
        connectedClients = connectedClients.filter((c) => c !== call); 
        call.end();
    });

    call.on('error', (err) => {
        console.error('Client stream error:', err);
    });
}

//starting the server
function main() {
    const server = new grpc.Server();
    server.addService(chatProto.ChatBot.service, { chatService });

    server.bindAsync('0.0.0.0:3000', grpc.ServerCredentials.createInsecure(), (err, port) => {
        if (err) {
            console.error('Server failed to start:', err);
            return;
        }
        console.log(`gRPC server running on port ${port}`);

        //readline for staff input
        const rl = Readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        //promting staff to enter message
        rl.on('line', (input) => {
            const now = new Date().toISOString();
            
            //defining staff message - hardcoding basic info for ease and consistency
            const staffMessage = {
                staff_id: 'HL10047',
                name: 'Customer Support',
                message: input,
                message_time: now,
            };

            connectedClients.forEach((clientCall) => {
                clientCall.write(staffMessage);
            });
        });
    });
}

main();