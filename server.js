const { Sequelize } = require('sequelize')
const express = require('express')
const cors = require('cors')
const https = require('https');
const fs = require('fs');
const path = require('path');
const initRoute = require('./src/routes')
require('./passport')
require('dotenv').config()

// Define constants for certificate paths
const CERTIFICATE_DIR = path.resolve(__dirname, 'certificate');
const KEY_FILE = 'domain.key';
const CERT_FILE = 'domain.pem';

// Check if certificate files exist
if (!fs.existsSync(`${CERTIFICATE_DIR}/${KEY_FILE}`) ||!fs.existsSync(`${CERTIFICATE_DIR}/${CERT_FILE}`)) {
  console.error('Certificate or key file not found.');
  process.exit(1); // Exit the process if files are missing
}

// Read certificate files
const key = fs.readFileSync(`${CERTIFICATE_DIR}/${KEY_FILE}`);
const cert = fs.readFileSync(`${CERTIFICATE_DIR}/${CERT_FILE}`);

const options = { key, cert };

const app = express()

app.use(cors({
    origin: "*",
    credentials: false
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

const db_password = (process.env.DB_PASSWORD) ? `${process.env.DB_PASSWORD}` : null
const connection = new Sequelize(process.env.DB, process.env.DB_USERNAME, db_password, {
    port: process.env.DB_PORT,
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    ssl: {
        key: `${CERTIFICATE_DIR}/${KEY_FILE}`,
        cert: `${CERTIFICATE_DIR}/${CERT_FILE}`,
        ca: `${CERTIFICATE_DIR}/${CERT_FILE}`
    },
    logging: false,
    timezone: '+07:00',
})

const check_connection = new Promise(async (resolve, reject) => {
    try {
        await connection.authenticate()
        resolve()
    } catch (err) {
        reject(err)
    }
})

initRoute(app);
const server = https.createServer(options, app);

check_connection
    .then(() => {
        server.listen(process.env.PORT, () => {
            console.log("DB CONNECTED")
            console.log(`SERVER LISTENING ON PORT ${process.env.PORT}`)
        })
    })
    .catch((err) => {
        const err_code = err.code && err.code === 'ENOTFOUND'
        const err_hostname = err.hostname === process.env.REDIS_HOSTNAME
        console.log(err)
        if(err_code && err_hostname){
            server.listen(process.env.PORT, () => {
                console.log("DB CONNECTED")
                console.log(`SERVER LISTENING ON PORT ${process.env.PORT}`)
            }) 
        }
    })