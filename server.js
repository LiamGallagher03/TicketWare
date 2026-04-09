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
require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')
const bcrypt = require('bcrypt')


/**
 * @const app       express application instance
 * @const PORT      The port that the server is running on
 */
const app = express()
const PORT = 8080

// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)

/**
 * These lines allow express to view static files. In short, this lets express use HTML, CSS, Javascrips, and Image files
 * in the ./views and ./public directories
 */
app.use(express.static('views'))
app.use(express.static('public'))
app.use(express.json())
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

app.post('/login', async (req, res) => {
    const { 'login-identifier': identifier, 'login-password': password } = req.body;
    const normalizedIdentifier = (identifier || '').trim();
    
    if (!normalizedIdentifier || !password) {
        return res.redirect('/?error=missing_login_fields');
    }
    
    try {
        const { data, error } = await supabase
            .from('Accounts')
            .select('Username, Password, IsAdmin')
            .or(`Username.eq.${normalizedIdentifier},Email.eq.${normalizedIdentifier}`)
            .single();
        
        if (error || !data) {
            return res.redirect('/?error=invalid_credentials');
        }
        
        const isValidPassword = await bcrypt.compare(password, data.Password);
        
        if (!isValidPassword) {
            return res.redirect('/?error=invalid_credentials');
        }
        
        // Successful login
        const destination = data.IsAdmin ? 'admin-landing.html' : 'user-landing-page.html';
        res.redirect(`/${destination}?username=${encodeURIComponent(data.Username)}`);
    } catch (err) {
        console.error('Server error during login:', err);
        res.redirect('/?error=server_error');
    }
})

app.post('/signup', async (req, res) => {
    const { 'signup-firstname': firstName, 'signup-lastname': lastName, 'signup-email': email, 'signup-username': username, 'signup-password': password, 'confirm-password': confirmPassword } = req.body;
    
    if (!firstName || !lastName || !email || !username || !password || !confirmPassword) {
        return res.redirect('/?error=missing_fields');
    }
    
    if (password !== confirmPassword) {
        return res.redirect('/?error=password_mismatch');
    }
    
    if (!validatePassword(password)) {
        return res.redirect('/?error=password_invalid');
    }
    
    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        const fullName = `${firstName.trim()} ${lastName.trim()}`;
        const emailUpdates = req.body['email-updates'] === 'on';
        const { data, error } = await supabase
            .from('Accounts')
            .insert([
                { Username: username, Password: hashedPassword, Email: email, Name: fullName, EmailUpdate: emailUpdates, IsAdmin: false }
            ]);
        
        if (error) {
            console.error('Error inserting account:', error);
            return res.redirect('/?error=signup_failed');
        }
        
        // If all checks pass, redirect to user landing page
        res.redirect(`/user-landing-page.html?username=${encodeURIComponent(username)}`);
    } catch (err) {
        console.error('Server error during signup:', err);
        res.redirect('/?error=server_error');
    }
})

// Test route to fetch all accounts from Supabase
app.get('/api/test-accounts', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('Accounts')
            .select('*')
        
        if (error) {
            console.error('Error fetching accounts:', error)
            return res.status(500).json({ error: error.message })
        }
        
        res.json({
            success: true,
            count: data.length,
            accounts: data
        })
    } catch (err) {
        console.error('Server error:', err)
        res.status(500).json({ error: 'Internal server error' })
    }
})

function resolveAccountId(accountData) {
    return (
        accountData.ID ??
        accountData.Id ??
        accountData.id ??
        accountData.AccountID ??
        accountData.AccountId ??
        accountData.accountID ??
        accountData.accountId ??
        accountData.ClientID ??
        accountData.ClientId ??
        accountData.clientID ??
        accountData.clientId
    )
}

app.get('/api/user-tickets', async (req, res) => {
    try {
        const { username } = req.query

        if (!username) {
            return res.status(400).json({ error: 'username is required.' })
        }

        const { data: accountData, error: accountError } = await supabase
            .from('Accounts')
            .select('*')
            .eq('Username', username)
            .single()

        if (accountError || !accountData) {
            console.error('Error finding account for user tickets:', accountError)
            return res.status(404).json({ error: 'Unable to find account for user.' })
        }

        const clientID = resolveAccountId(accountData)

        if (clientID == null) {
            return res.status(500).json({ error: 'Account ID column not found for ClientID mapping.' })
        }

        const { data, error } = await supabase
            .from('Tickets')
            .select('*')
            .eq('ClientID', clientID)
            .order('DateCreated', { ascending: false })

        if (error) {
            console.error('Error fetching user tickets:', error)
            return res.status(500).json({ error: error.message })
        }

        res.json({
            success: true,
            count: data.length,
            tickets: data
        })
    } catch (err) {
        console.error('Server error:', err)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Route to create a new ticket
app.post('/api/create-ticket', async (req, res) => {
    try {
        const {
            username,
            title,
            description,
            hardwareName,
            serialNumber,
            dateCreated
        } = req.body;

        if (!username || !title || !description) {
            return res.status(400).json({ error: 'Missing required ticket fields.' });
        }

        const { data: accountData, error: accountError } = await supabase
            .from('Accounts')
            .select('*')
            .eq('Username', username)
            .single();

        if (accountError || !accountData) {
            console.error('Error finding account for ticket creation:', accountError);
            return res.status(400).json({ error: 'Unable to find account for ticket creation.' });
        }

        const clientID = resolveAccountId(accountData);

        if (clientID == null) {
            return res.status(500).json({ error: 'Account ID column not found for ClientID mapping.' });
        }

        const { data, error } = await supabase
            .from('Tickets')
            .insert([
                {
                    ClientID: clientID,
                    AdminID: 1,
                    Title: title,
                    Description: description,
                    Hardware: hardwareName || null,
                    SerialNumber: serialNumber || null,
                    Status: 'O',
                    DateCreated: dateCreated || new Date().toISOString(),
                    CloseDate: null
                }
            ])
        
        if (error) {
            console.error('Error creating ticket:', error)
            return res.status(500).json({ error: error.message })
        }
        
        res.json({
            success: true,
            message: 'Ticket created successfully',
            ticket: data
        })
    } catch (err) {
        console.error('Server error:', err)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Route to fetch all tickets
app.get('/api/tickets', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('Tickets')
            .select('*')
        
        if (error) {
            console.error('Error fetching tickets:', error)
            return res.status(500).json({ error: error.message })
        }
        
        res.json({
            success: true,
            count: data.length,
            tickets: data
        })
    } catch (err) {
        console.error('Server error:', err)
        res.status(500).json({ error: 'Internal server error' })
    }
})

/**
 * Starts the server listening on PORT, and logs to the console that server has successfully started on PORT
 */
app.listen(PORT, () => console.log("Server started on port: " + PORT))