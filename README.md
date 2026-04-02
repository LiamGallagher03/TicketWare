# Ticketware

## Description

A web based ticket handling app for IT departments and Computer Repair. Uses Node.js for server functionality. WIP!!!

## Installation

Once Node.js has been installed on a computer intended to run the server, the dependencies need to be installed. If `package.json` is present and functioning, this should be possible by opening the directory in a terminal and running the following command:

```bash
npm install
```

If this doesn't function, the dependancies can be installed manually with the following commands:
```bash
npm install express
```

## Usage

The server can be started in a terminal by using any __*one*__ of the following commands:
```bash
npm start #if and only if package.json is present and properly functioning

node server
```

The server can also be started in testing mode, which will automatically restart the server upon saving new changes to any of the relevant files. This can be done by using any __*one*__ of the following commands:
```bash
npm test #if and only if package.json is present and properly functioning

npx nodemon server.js
```

Once the server is up and running on a computer, for individual testing purposes that server can be connected to with any web browser at localhost:`PORT`. By default `PORT` should be 8080, but check `server.js` to verify if localhost:8080 doesn't work.