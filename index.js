const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode");
const express = require("express");
const axios = require("axios");

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
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});

// Store the QR code data
let qrCodeData = null;

/**
 * Utility function to create a delay
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise<void>}
 */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Memecah pesan panjang menjadi beberapa pesan pendek
 * @param {string} text - The text to split into multiple messages
 * @returns {string[]} - Array of message strings
 */
function splitIntoMessages(text) {
  // Membagi berdasarkan titik, tanda tanya, atau tanda seru diikuti spasi
  const rawSplits = text.split(/(?<=[.!?])\s+/);

  const messages = [];
  let currentMessage = "";

  for (const split of rawSplits) {
    // Jika pesan sudah cukup panjang atau ada emoji tertentu, pisahkan
    if (
      currentMessage.length > 0 &&
      (currentMessage.length + split.length > 50 ||
        split.includes("😊") ||
        split.includes("🙈") ||
        Math.random() > 0.7)
    ) {
      messages.push(currentMessage);
      currentMessage = split;
    } else {
      currentMessage += (currentMessage ? " " : "") + split;
    }

    // Batasi jumlah pesan menjadi 2-3
    if (messages.length >= 2) {
      break;
    }
  }

  if (currentMessage && messages.length < 3) {
    messages.push(currentMessage);
  }

  return messages;
}

/**
 * Event listener for QR code generation
 * @param {string} qr - The QR code string
 */
client.on("qr", (qr) => {
  console.log(
    "QR Code received. Scan it or visit http://localhost:3000/qr to see it in the browser"
  );
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
    await delay(2000); // 2 seconds delay
    message.reply("Pong!");
  } else {
    // Interact with GPT4o-Turbo-based conversational AI
    try {
      await delay(2000); // Beri jeda awal sebelum mulai membalas

      const response = await axios.get(
        "https://fastrestapis.fasturl.cloud/aillm/gpt-4o-turbo",
        {
          params: {
            ask: message.body,
            sessionId: message.from,
            style:
              "Jawab dengan gaya cowok yang sedang PDKT ke cewek. Buat beberapa kalimat pendek yang terpisah. Gunakan bahasa santai, sedikit malu-malu tapi percaya diri. Gunakan emoji sesekali. Tunjukkan ketertarikan dengan bertanya balik. Jangan terlalu formal atau terkesan menggurui.",
          },
        }
      );

      // Parsing respons menjadi beberapa pesan
      const result =
        response.data.result || "Hai, maaf aku lagi bingung nih...";
      const messages = splitIntoMessages(result);

      // Mengirim pesan satu per satu dengan jeda
      for (const msg of messages) {
        await message.reply(msg);
        await delay(Math.floor(Math.random() * 1500) + 1000); // Jeda 1-2.5 detik antara pesan
      }
    } catch (error) {
      message.reply("Error interacting with AI: " + error.message);
    }
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
  res.send(
    "WhatsApp Bot is running. Visit http://localhost:3000/qr to see the QR code."
  );
});

// Initialize WhatsApp client
client.initialize();

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
