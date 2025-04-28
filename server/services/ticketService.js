var grpc = require("@grpc/grpc-js");
var protoLoader = require("@grpc/proto-loader");

//loading and definiting ticket proto
var TICKET_PROTO_PATH = __dirname + "/../../protos/ticket.proto"
var ticketPackageDefinition = protoLoader.loadSync(
    TICKET_PROTO_PATH
);
var ticket_proto = grpc.loadPackageDefinition(ticketPackageDefinition).ticket;

//variables for storing tickets
var tickets = [];
var idCounter = 1;

//ticket service
var ticketService = {
    //create ticket
    create: (call, callback) => {
        var {cust_id, staff_id, content} = call.request;
        var newTicket = {
            ticket_id: idCounter,
            cust_id,
            staff_id,
            content,
            updates: []
        };
        tickets.push(newTicket);
        idCounter++;
        callback(null, {ticket_id: newTicket.ticket_id});
    },

    //update ticket
    update: (call, callback) => {
        var {ticket_id, ticket_update} = call.request;
        var ticket = tickets.find(t => t.ticket_id === ticket_id);
        if(ticket) {
            ticket.updates.push(ticket_update);
            callback(null, {update_confirmation: `Ticket ${ticket_id} updated.`});
        }
        else {
            callback({
                code: grpc.status.NOT_FOUND,
                details: "Ticket not found."
            });
        }
    },

    //delete ticket
    delete: (call, callback) => {
        var { ticket_id, staff_id } = call.request;
        var index = tickets.findIndex(t => t.ticket_id === ticket_id);
        if (index !== -1) {
            tickets.splice(index, 1);
            callback(null, { delete_confirmation: `Ticket ${ticket_id} deleted by staff ${staff_id}.` });
        } else {
            callback({
                code: grpc.status.NOT_FOUND,
                details: "Ticket not found."
            });
        }
    },

    //get tickets
    get: (call) => {
        var { cust_id } = call.request;
        var customerTickets = tickets.filter(t => t.cust_id === cust_id);
        customerTickets.forEach(ticket => {
            call.write({ tickets: [ticket.ticket_id] });
        });
        call.end();
    }
};

//starting server
function main() {
    var server = new grpc.Server();
    server.addService(ticket_proto.SupportTicket.service, ticketService);
    
    server.bindAsync("0.0.0.0:40000", grpc.ServerCredentials.createInsecure(), function() {
        console.log('Server running on 0.0.0.0:40000');
    })
};

main();