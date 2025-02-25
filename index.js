const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode");
const express = require("express");
const cron = require("node-cron");

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// Set up the web server
app.use(express.static("public"));
app.set("view engine", "ejs");

/**
 * Initialize WhatsApp client
 * @type {Client}
 */
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
    }
});

// Store the QR code data
let qrCodeData = null;

/**
 * Utility function to create a delay
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise<void>}
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Event listener for QR code generation
 * @param {string} qr - The QR code string
 */
client.on("qr", (qr) => {
    console.log("QR Code received. Scan it or visit http://localhost:3000/qr to see it in the browser");
    // Store the QR code value
    qrCodeData = qr;
});

/**
 * Event listener for client ready state
 */
client.on("ready", () => {
    console.log("Bot sudah aktif!");
    // Clear QR code data when client is ready
    qrCodeData = null;
});

/**
 * Event listener for incoming messages
 * @param {object} message - The message object
 */
client.on("message", async (message) => {
    console.log(`Pesan dari ${message.from}: ${message.body}`);
    if (message.body.toLowerCase() === "ping") {
        await client.sendPresenceAvailable();
        await client.sendTyping(message.from);
        await delay(2000); // 2 seconds delay
        message.reply("Pong!");
    }
    if (message.body.toLowerCase() === "/cron") {
        await client.sendPresenceAvailable();
        await client.sendTyping(message.from);
        await delay(2000); // 2 seconds delay
        message.reply("Cron job dijadwalkan, Anda akan menerima pesan dalam 2 menit.");
        cron.schedule('*/2 * * * *', () => {
            client.sendMessage(message.from, "Ini adalah pesan dari cron job setelah 2 menit.");
        }, {
            scheduled: true,
            timezone: "Asia/Jakarta"
        });
    }
});

/**
 * Route to display the QR code
 * @name /qr
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
app.get("/qr", (req, res) => {
    if (qrCodeData) {
        // Generate QR code image and send it to the browser
        qrcode.toDataURL(qrCodeData, (err, url) => {
            if (err) {
                res.status(500).send("Error generating QR code");
                return;
            }
            res.render("qr", { qrCodeUrl: url });
        });
    } else {
        res.render("qr", { qrCodeUrl: null });
    }
});

/**
 * Home route
 * @name /
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
app.get("/", (req, res) => {
    res.send("WhatsApp Bot is running. Visit http://localhost:3000/qr to see the QR code.");
});

// Initialize WhatsApp client
client.initialize();

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});