const express = require('express');
const path = require('path');
const app = express ();
const WebSocket = require('ws');

//setting view to ejs
 app.set('view engine', 'ejs');
 app.set('views', path.join(__dirname, 'views'));

 //static files
app.use('/public', express.static(path.join(__dirname, 'public')));

 //render index page
app.get('/', (req, res) => {
    res.render('index'); 
 });

 //render staff page
 app.get('/', (req, res) => {
    res.render('staff'); 
 });

//starting server
app.listen(3001, () => {
    console.log(`Express server running at http://localhost:3001`);
});

app.listen(3002, () => {
    console.log(`Express server running at http://localhost:3002`);
});