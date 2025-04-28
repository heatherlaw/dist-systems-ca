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
app.listen(40000, () => {
    console.log(`Express server running at http://localhost:40000`);
});

app.listen(40000, () => {
    console.log(`Express server running at http://localhost:40000`);
});