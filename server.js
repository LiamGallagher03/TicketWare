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
app.use(express.urlencoded({ extended: true }))


/**
 * gets the default root. On connection, client is sent to "[WEBHOST]/". This catches when someone asks for that default 
 * "/" root, and sends them index.html in response.
 */
app.get("/", (req, res) => {
    res.send('index.html')
})

function validatePassword(password) {
    if (password.length < 8 || password.length > 64) return false;
    if (!/[A-Z]/.test(password)) return false;
    if (!/[a-z]/.test(password)) return false;
    if (!/[0-9]/.test(password)) return false;
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false;
    return true;
}

app.post('/login', (req, res) => {
    // Ignore verification for now
    res.redirect('/user-landing-page.html')
})

app.post('/signup', (req, res) => {
    const { 'signup-email': email, 'signup-username': username, 'signup-password': password, 'confirm-password': confirmPassword } = req.body;
    
    if (!email || !username || !password || !confirmPassword) {
        return res.redirect('/?error=missing_fields');
    }
    
    if (password !== confirmPassword) {
        return res.redirect('/?error=password_mismatch');
    }
    
    if (!validatePassword(password)) {
        return res.redirect('/?error=password_invalid');
    }
    
    // If all checks pass, redirect to user landing page
    res.redirect('/user-landing-page.html')
})

/**
 * Starts the server listening on PORT, and logs to the console that server has successfully started on PORT
 */
app.listen(PORT, () => console.log("Server started on port: " + PORT))