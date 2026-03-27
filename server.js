/**
 * @author Willow Bitter
 * @version 0.1
 * 
 * 
 * This is the server.js file that exists server-side to get functionallity to the clients.
*/

/**
 * App uses Express, which is just a Node.js web-application framework
 * 
 * @const express   imports express module
 */
const express = require('express')


/**
 * @const app       express application instance
 * @const PORT      The port that the server is running on
 */
const app = express()
const PORT = 8080

/**
 * These lines allow express to view static files. In short, this lets express use HTML, CSS, Javascrips, and Image files
 * in the ./views and ./public directories
 */
app.use(express.static('views'))
app.use(express.static('public'))


/**
 * gets the default root. On connection, client is sent to "[WEBHOST]/". This catches when someone asks for that default 
 * "/" root, and sends them index.html in response.
 */
app.get("/", (req, res) => {
    res.send('index.html')
})
/**
 * Starts the server listening on PORT, and logs to the console that server has successfully started on PORT
 */
app.listen(PORT, () => console.log("Server started on port: " + PORT))