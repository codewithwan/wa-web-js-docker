const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const cron = require("node-cron");

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"] 
    }
});

client.on("qr", (qr) => {
    console.log("Scan QR ini:");
    qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
    console.log("Bot sudah aktif!");
});

client.on("message", async (message) => {
    console.log(`Pesan dari ${message.from}: ${message.body}`);
    if (message.body.toLowerCase() === "ping") {
        message.reply("Pong!");
    }
    if (message.body.toLowerCase() === "/cron") {
        message.reply("Cron job dijadwalkan, Anda akan menerima pesan dalam 2 menit.");
        cron.schedule('*/2 * * * *', () => {
            client.sendMessage(message.from, "Ini adalah pesan dari cron job setelah 2 menit.");
        }, {
            scheduled: true,
            timezone: "Asia/Jakarta"
        });
    }
});

client.initialize();
