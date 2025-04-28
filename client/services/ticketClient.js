var grpc = require("@grpc/grpc-js");
var protoLoader = require("@grpc/proto-loader");
var readline = require("readline");

//loading ticket proto
var TICKET_PROTO_PATH = __dirname + "/../../protos/ticket.proto"
var ticketPackageDefinition = protoLoader.loadSync(
    TICKET_PROTO_PATH, 
    {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    }
);
var ticket_proto = grpc.loadPackageDefinition(ticketPackageDefinition).ticket;

//connecting to the server
var client = new ticket_proto.SupportTicket("localhost:40000", grpc.credentials.createInsecure());

//creating readline interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

//function to ask questions
function ask(question) {
    return new Promise((resolve) => rl.question(question, resolve));
}

//creating a new ticket
function createTicket(cust_id, staff_id, content) {
    return new Promise((resolve, reject) => {
        client.create({ cust_id, staff_id, content }, (err, response) => {
            if (err) {
                reject('Error creating ticket ', err);
            }
            else {
                resolve(response.ticket_id);
            }
        });
    });
}

//update existing ticket
function updateTicket(ticket_id, ticket_update) {
    return new Promise((resolve, reject) => {
        client.update({ ticket_id, ticket_update }, (err, response) => {
            if (err) {
                reject('Error updating ticket', err);
            }
            else {
                resolve(response.update_confirmation);
            }
        });
    });
}

//delete a ticket
function deleteTicket(ticket_id, staff_id) {
    return new Promise((resolve, reject) => {
        client.delete({ ticket_id, staff_id }, (err, response) => {
            if (err) {
                reject('Error deleting ticket ', err);
            }
            else {
                resolve(response.delete_confirmation);
            }
        });
    });
}

//return all tickets for a customer
function getTickets(cust_id) {
    return new Promise((resolve, reject) => {
        var tickets = [];
        var stream = client.get({ cust_id });

        stream.on("data", (ticketList) => {
            ticketList.tickets.forEach(ticketId => {
                tickets.push(ticketId); 
            });
        });

        stream.on("end", () => {
            resolve(tickets);
        });

        stream.on("error", (err) => {
            reject(err);
        });
    });
}

//basic menu
async function mainMenu() {
    while (true) {
        //menu options
        console.log(`
            Select an option:
            1. Create Ticket
            2. Update Ticket
            3. Delete Ticket
            4. Get Tickets
            5. Exit
        `);

        var choice = await ask("Enter choice: ");
        switch (choice.trim()) {
            case "1":
                var cust_id = await ask("Customer ID: ");
                var staff_id = await ask("Staff ID: ");
                var content = await ask("Ticket Content: ");
                try {
                    var ticketId = await createTicket(cust_id, staff_id, content);
                    console.log(`Ticket created with ID: ${ticketId}`);
                } catch (err) {
                    console.error("Error creating ticket:", err.message);
                }
                break;

            case "2":
                var ticketIdToUpdate = await ask("Ticket ID to Update: ");
                var updateContent = await ask("Update Content: ");
                try {
                    var updateMsg = await updateTicket(ticketIdToUpdate, updateContent);
                    console.log(updateMsg);
                } catch (err) {
                    console.error("Error updating ticket:", err.message);
                }
                break;

            case "3":
                var ticketIdToDelete = await ask("Ticket ID to Delete: ");
                var staffIdToDelete = await ask("Staff ID: ");
                try {
                    var deleteMsg = await deleteTicket(ticketIdToDelete, staffIdToDelete);
                    console.log(deleteMsg);
                } catch (err) {
                    console.error("Error deleting ticket:", err.message);
                }
                break;

            case "4":
                var custIdForTickets = await ask("Customer ID to fetch tickets for: ");
                try {
                    var tickets = await getTickets(custIdForTickets);
                    console.log("Tickets:");
                    console.table(tickets);
                } catch (err) {
                    console.error("Error fetching tickets:", err.message);
                }
                break;

            case "5":
                console.log("Goodbye!");
                rl.close();
                process.exit(0);

            default:
                console.log("Invalid choice. Please select a valid option.");
        }
    }
}

//to start menu
mainMenu();