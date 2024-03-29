const axios = require('axios');
const { StatusCodes } = require('http-status-codes');
const { v4: uuidv4 } = require('uuid');

const PROMPT = {
    PING: {
        id: uuidv4(),
        name: 'PING',
        prompt: '!ping',
        query: 'equals',
        description: 'Reply \'ping\' to sender\'s message',
        run: (msg) => {
            msg.reply('pong');
        },
    },
    QUOTE: {
        id: uuidv4(),
        name: 'QUOTE',
        prompt: '!quote',
        query: 'equals',
        description: 'Send quote from Quotable (https://github.com/lukePeavey/quotable)',
        run: async (msg) => {
            const response = await axios.get('https://api.quotable.io/quotes/random');
            if (response.status !== StatusCodes.OK) {
                throw Error('Something went wrong while getting quotes')
            }
            const quote = response.data[0] || null;
            msg.reply(`"${quote?.content}"\n- ${quote?.author}`);
        },
    },
    STICKER: {
        id: uuidv4(),
        name: 'STICKER',
        prompt: '!sticker',
        query: 'equals',
        description: 'Create sticker from quoted message or image sent by sender',
        run: async (msg) => {
            let messageMedia = msg;
            if (msg.hasQuotedMsg) {
                const quotedMsg = await msg.getQuotedMessage();
                messageMedia = quotedMsg;
            }
            if (!messageMedia.hasMedia || messageMedia.type != 'image') {
                throw Error('Message media should be an image!');
            }
            const media = await messageMedia.downloadMedia();
            msg.reply(media, null, { sendMediaAsSticker: true });
        },
    },
    SPAM: {
        id: uuidv4(),
        name: 'SPAM',
        prompt: '!spam',
        query: 'startsWith',
        description: 'Spam a number with message',
        run: async (msg, client) => {
            const messageArray = msg.body.split(' ');
            const rep = messageArray[1];
            const number = messageArray[2];
            const messageIndex = msg.body.indexOf(number) + number.length;
            const message = msg.body.slice(messageIndex, msg.body.length);
            for (let i = 0; i < rep; i++) {
                setTimeout(function(){
                    client.sendMessage(`${number}@c.us`, message);
                }, 100 * i)
            }
            msg.reply(`Number has been spammed ${rep} times`);
        }
    },
    DELETE: {
        id: uuidv4(),
        name: 'DELETE',
        prompt: '!delete',
        query: 'equals',
        description: 'Delete chat or quoted message by sender',
        run: async (msg) => {
            if (msg.hasQuotedMsg) {
                const quotedMsg = await msg.getQuotedMessage();
                quotedMsg.delete(quotedMsg.fromMe);
            } else {
                const chat = await msg.getChat();
                chat.delete();
            }
        },
    },
    CLEAR: {
        id: uuidv4(),
        name: 'CLEAR',
        prompt: '!clear',
        query: 'equals',
        description: 'Clear message history of current chat',
        run: async (msg) => {
            const chat = await msg.getChat();
            chat.clearMessages();
        },
    },
    HELP: {
        id: uuidv4(),
        name: 'HELP',
        prompt: '!help',
        query: 'equals',
        description: 'Send list of prompts available',
        run: async (msg) => {
            let reply = 'List of Prompts:';
            Object.values(PROMPT).forEach((value) => {
                reply = reply.concat(`\n - ${value.prompt}: ${value.description}`);
            });
            msg.reply(reply);
        },
    }
};

module.exports = PROMPT;