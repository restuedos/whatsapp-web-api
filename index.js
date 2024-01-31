require('dotenv').config();

const cliProgress = require('cli-progress');
const fs = require('fs');
const mime = require('mime');
const PROMPT = require('./prompt');
const qrcode = require('qrcode-terminal');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const winston = require('winston');

if (typeof localStorage === "undefined" || localStorage === null) {
    var LocalStorage = require('node-localstorage').LocalStorage;
    if (!fs.existsSync('./local_storage')){
        fs.mkdirSync('./local_storage', { recursive: true });
    }
    localStorage = new LocalStorage('./local_storage');
}

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: process.env.PROJECT_ID },
    transports: [
      //
      // - Write all logs with importance level of `error` or less to `error.log`
      // - Write all logs with importance level of `info` or less to `combined.log`
      //
      new winston.transports.File({ filename: 'error.log', level: 'error' }),
      new winston.transports.File({ filename: 'combined.log' }),
    ],
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple(),
    }));
}

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        executablePath: process.env.CHROME_PATH,
    }
});

const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
client.on('loading_screen', (percent, message) => {
    if (percent === 0) {
        progressBar.start(100, 0);
    }
    progressBar.update(percent);
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    progressBar.stop();
    console.log('Client is ready!');
});

client.on('message_revoke_everyone', async (after, before) => {
    try {
        if (before && !before.fromMe && !messageIsPrompt(before.body)) {
            const sender = await before.getContact();
            if (before.hasMedia) {
                const uniqueId = `msg-${sender.number}`;
                const filePath = localStorage.getItem(uniqueId);
                const attachmentData = filePath ? MessageMedia.fromFilePath(filePath) : null;
                if (!attachmentData) {
                    throw new Error('Message media is empty!');
                }

                client.sendMessage(`${process.env.CHAT_LOG_ID}@c.us`, attachmentData, {
                    caption: `\+${sender.number} (${sender.pushname}): ${before.body}`
                });
            } else {
                client.sendMessage(`${process.env.CHAT_LOG_ID}@c.us`, `\+${sender.number} (${sender.pushname}): ${before.body}`);
            }
        }
    } catch (error) {
        logger.error(error.message);
    }
});

client.on('message', async (msg) => {
    try {
        if (messageIsPrompt(msg.body)) {
            const prompt = getPrompt(msg.body);
            prompt.function(msg);
        } else if (msg.hasMedia && !msg.fromMe) {
            const sender = await msg.getContact();
            const uniqueId = `msg-${sender.number}`;
            const attachmentData = await msg.downloadMedia();
            const filePath = uploadMessageMedia(uniqueId, attachmentData);
            localStorage.setItem(uniqueId, filePath);
        }
    } catch (error) {
        logger.error(error.message);
    }
});

const messageIsPrompt = (message) => {
    const prompt = Object.values(PROMPT).find((value) => {
        return message.body === value.prompt;
    });
    return prompt !== undefined;
}

const getPrompt = (prompt) => {
    return Object.values(PROMPT).find((value) => {
        return prompt === value.prompt;
    });
}

const uploadMessageMedia = (name, messageMedia) => {
    const extension = mime.getExtension(messageMedia.mimetype);
    const fileName = `${name}.${extension}`;
    const dir = `storage/${messageMedia.mimetype}`;
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }
    const filePath = `${dir}/${fileName}`;
    fs.writeFileSync(filePath, messageMedia.data, 'base64', (error) => {
        if (error) {
            throw error;
        }
    });
    return filePath;
}

client.initialize();
 