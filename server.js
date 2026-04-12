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

function resolveTicketIdentity(ticketData) {
    const preferredColumns = ['ID', 'Id', 'id', 'TicketID', 'TicketId', 'ticketID', 'ticketId', 'TicketNumber', 'ticketNumber']

    for (const col of preferredColumns) {
        if (Object.prototype.hasOwnProperty.call(ticketData, col) && ticketData[col] != null) {
            return { column: col, value: ticketData[col] }
        }
    }

    const fallbackColumn = Object.keys(ticketData).find(k => /(^id$|ticket.?id|ticket.?number)/i.test(k) && ticketData[k] != null)
    if (fallbackColumn) {
        return { column: fallbackColumn, value: ticketData[fallbackColumn] }
    }

    return { column: null, value: null }
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

        const { data: accounts, error: accountLookupError } = await supabase
            .from('Accounts')
            .select('*')

        if (accountLookupError) {
            console.error('Error fetching accounts for user ticket enrichment:', accountLookupError)
            return res.status(500).json({ error: accountLookupError.message })
        }

        const accountById = {}
        for (const acc of accounts) {
            const id = resolveAccountId(acc)
            if (id != null) accountById[id] = acc
        }

        const enrichedTickets = data.map(t => ({
            ...t,
            AdminUsername: accountById[t.AdminID]?.Username || null,
            AdminEmail: accountById[t.AdminID]?.Email || null
        }))

        res.json({
            success: true,
            count: enrichedTickets.length,
            tickets: enrichedTickets
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
                    AdminID: null,
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

// Route to fetch all tickets enriched with usernames for admin view
app.get('/api/admin-all-tickets', async (req, res) => {
    try {
        const { data: tickets, error: ticketError } = await supabase
            .from('Tickets')
            .select('*')
            .order('DateCreated', { ascending: false })

        if (ticketError) {
            console.error('Error fetching tickets:', ticketError)
            return res.status(500).json({ error: ticketError.message })
        }

        // Collect all unique account IDs we need to resolve
        const { data: accounts, error: accountError } = await supabase
            .from('Accounts')
            .select('*')

        if (accountError) {
            console.error('Error fetching accounts for ticket enrichment:', accountError)
            return res.status(500).json({ error: accountError.message })
        }

        // Build ID -> Username lookup
        const usernameMap = {}
        for (const acc of accounts) {
            const id = resolveAccountId(acc)
            if (id != null) usernameMap[id] = acc.Username
        }

        const enriched = tickets.map(t => ({
            ...t,
            ResolvedTicketId: resolveTicketIdentity(t).value,
            ClientUsername: usernameMap[t.ClientID] || `ID:${t.ClientID}`,
            AdminUsername: usernameMap[t.AdminID] || null
        }))

        res.json({ success: true, count: enriched.length, tickets: enriched })
    } catch (err) {
        console.error('Server error:', err)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Route to fetch tickets claimed by a specific admin username
app.get('/api/admin-my-tickets', async (req, res) => {
    try {
        const { username } = req.query

        if (!username) {
            return res.status(400).json({ error: 'username is required.' })
        }

        const { data: adminAccount, error: adminError } = await supabase
            .from('Accounts')
            .select('*')
            .eq('Username', username)
            .single()

        if (adminError || !adminAccount) {
            console.error('Error finding admin account for claimed tickets:', adminError)
            return res.status(404).json({ error: 'Unable to find account for admin user.' })
        }

        const adminID = resolveAccountId(adminAccount)
        if (adminID == null) {
            return res.status(500).json({ error: 'Account ID column not found for AdminID mapping.' })
        }

        const { data: tickets, error: ticketError } = await supabase
            .from('Tickets')
            .select('*')
            .eq('AdminID', adminID)
            .order('DateCreated', { ascending: false })

        if (ticketError) {
            console.error('Error fetching claimed admin tickets:', ticketError)
            return res.status(500).json({ error: ticketError.message })
        }

        const { data: accounts, error: accountError } = await supabase
            .from('Accounts')
            .select('*')

        if (accountError) {
            console.error('Error fetching accounts for claimed ticket enrichment:', accountError)
            return res.status(500).json({ error: accountError.message })
        }

        const usernameMap = {}
        for (const acc of accounts) {
            const id = resolveAccountId(acc)
            if (id != null) usernameMap[id] = acc.Username
        }

        const enriched = tickets.map(t => ({
            ...t,
            ClientUsername: usernameMap[t.ClientID] || `ID:${t.ClientID}`,
            AdminUsername: usernameMap[t.AdminID] || null
        }))

        res.json({ success: true, count: enriched.length, tickets: enriched })
    } catch (err) {
        console.error('Server error:', err)
        res.status(500).json({ error: 'Internal server error' })
    }
})

app.post('/api/admin-close-ticket', async (req, res) => {
    try {
        const { username, ticketId, selector } = req.body

        if (!username) {
            return res.status(400).json({ error: 'username is required.' })
        }

        const { data: adminAccount, error: adminError } = await supabase
            .from('Accounts')
            .select('*')
            .eq('Username', username)
            .single()

        if (adminError || !adminAccount) {
            console.error('Error finding admin account for close ticket:', adminError)
            return res.status(404).json({ error: 'Unable to find account for admin user.' })
        }

        const adminID = resolveAccountId(adminAccount)
        if (adminID == null) {
            return res.status(500).json({ error: 'Account ID column not found for AdminID mapping.' })
        }

        const { data: adminTickets, error: ticketFetchError } = await supabase
            .from('Tickets')
            .select('*')
            .eq('AdminID', adminID)

        if (ticketFetchError) {
            console.error('Error fetching admin tickets before close:', ticketFetchError)
            return res.status(500).json({ error: ticketFetchError.message })
        }

        const matchedTicket = (adminTickets || []).find(t => {
            const identity = resolveTicketIdentity(t)
            return ticketId != null && ticketId !== '' && String(identity.value) === String(ticketId)
        }) || (adminTickets || []).find(t => {
            if (!selector) return false
            return (
                String(t.Title || '') === String(selector.Title || '') &&
                String(t.DateCreated || '') === String(selector.DateCreated || '') &&
                String(t.Description || '') === String(selector.Description || '')
            )
        })

        if (!matchedTicket) {
            return res.status(404).json({ error: 'Ticket not found for this admin.' })
        }

        const identity = resolveTicketIdentity(matchedTicket)
        const ticketIdColumn = identity.column
        const matchedTicketId = identity.value

        if (!ticketIdColumn || matchedTicketId == null) {
            return res.status(500).json({ error: 'Ticket ID column not found for ticket close mapping.' })
        }

        const currentStatus = (matchedTicket.Status || '').toString().toUpperCase()
        if (currentStatus === 'C' || currentStatus === 'CLOSED') {
            return res.json({ success: true, message: 'Ticket is already closed.' })
        }

        const { error: updateError } = await supabase
            .from('Tickets')
            .update({
                Status: 'C',
                CloseDate: new Date().toISOString()
            })
            .eq(ticketIdColumn, matchedTicketId)
            .eq('AdminID', adminID)

        if (updateError) {
            console.error('Error closing ticket:', updateError)
            return res.status(500).json({ error: updateError.message })
        }

        res.json({ success: true, message: 'Ticket closed successfully.' })
    } catch (err) {
        console.error('Server error while closing ticket:', err)
        res.status(500).json({ error: 'Internal server error' })
    }
})

/**
 * Starts the server listening on PORT, and logs to the console that server has successfully started on PORT
 */
app.listen(PORT, () => console.log("Server started on port: " + PORT))