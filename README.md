# Ticketware

## Authors

Project created by Jacob Bitter, Liam Gallagher, Dylan McLaughlin, and Spencer Perry 

Major project for EECS 3550:001 Software Engineering, Spring 2026

## Description

Ticketware is a web based ticket handling app for IT departments and Computer Repair.

## Functionality

This webapp serves as a ticketing software for an IT department or hardware repair group. It has the following basic functionalities:
- Creating accounts
- Logging in to existing accounts (for both clients and admins)
- Creating a Ticket (clients)
- Checking All Tickets (Admin)
- Checking your own ticket status (client and admin)
- Updating/changing tichets (client and admin)
- Recieving Email Updates about ticket status (client and admin)

Upon connecting, a user will be sent to the Login/Signup page. When logging in, if logged in to an admin account they will be sent to teh admin landing where they can check all tickets or their currently claimed tickets. Otherwise, they will be sent to the client landing page where they can create a new ticket or check on existing tickets.

## Installation

Once Node.js has been installed on a computer intended to run the server, the dependencies need to be installed. If `package.json` is present and functioning, this should be possible by opening the directory in a terminal and running the following command:

```bash
npm install
```

If this doesn't function, the dependancies can be installed manually with the following commands:
```bash
npm install express dotenv postgres @supabase/supabase-js @sendgrid/mail bcrypt
```

## Usage

The server can be started in a terminal by using any of the following commands:
```bash
npm start 

node server
```

The server can also be started in testing mode, which will automatically restart the server upon saving new changes to any of the relevant files. This can be done by using any of the following commands:
```bash
npm test 

npx nodemon server.js
```

Once the server is up and running on a computer, for individual testing purposes that server can be connected to with any web browser at localhost:`PORT`. By default `PORT` should be 8080, but check `server.js` to verify if localhost:8080 doesn't work.

## Cloudflare Turnstile

Login and signup support Cloudflare Turnstile.

Add these variables to `.env` to enable it:

```env
CLOUDFLARE_TURNSTILE_SITE_KEY=your_site_key
CLOUDFLARE_TURNSTILE_SECRET_KEY=your_secret_key
```

Without both variables present, the login and signup forms continue to work without CAPTCHA so local development does not break.

## Technologies
Project is primarily made with HTML/CSS/Javascript. The following external/third party tecchnologies are used:

**Node.js/Express** 

Node.js and it's Express package are used for basic server functionality and communication.

**dotenv** 

The dotenv module for Node.js is used to handle and maintain environment variables, particularly API keys.

**PostgreSQL and Supabase** 

Supabase was used to create and maintain a PostgreSQL Database for the project, storing all of the relevant information

**Sendgrid** 

Sendgrid is an external API System used for sending users email updates about the status of their existing tickets

**Cloudflare Turnstile** 

Used as a simple alternative to a traditional captcha to ensure security and account integrity

## Project Examples
The login/signup page when users first connect.
![login/signup page](/examples/login-signup.png)

The client landing page after user first logs in.
![client landing page](/examples/client-landing.png)

The client's "Create Ticket" page for creating new tickets,
![create ticket page](/examples/client-create-ticket.png)

And the client's "My Tickets" page to view existing tickets.
![client my tickets page](/examples/client-my-tickets.png)

The admin landing page after an admin logs in.
![admin landing page](/examples/admin-landing.png)

The admin view of all tickets,
![all tickets page](/examples/admin-all-tickets.png)

And the admin's "My Tickets" page to view claimed tickets
![admin my tickets page](/examples/admin-my-tickets.png)