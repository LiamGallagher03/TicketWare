/**
 * @author Willow Bitter
 * @version 0.1
 * 
 * 
 * This is the server.js file that exists server-side to get functionallity to the clients.
*/

const express = require('express');

const app = express();
const PORT = 8080;

app.use(express.static('public'));
app.use(express.static('views)'));

app.get("/", (res, req) => {
    res.send('index.html')
})

app.listen(PORT, () => console.log("Server started on port: " + PORT))