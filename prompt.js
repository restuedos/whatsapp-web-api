const { v4: uuidv4 } = require('uuid');

const PROMPT = {
    PING: {
        id: uuidv4(),
        name: 'PING',
        prompt: '!ping',
        description: 'Reply \'ping\' to sender\'s message',
        function: (msg) => {
            msg.reply('pong');
        },
    },
    STICKER: {
        id: uuidv4(),
        name: 'STICKER',
        prompt: '!sticker',
        description: 'Create sticker from quoted message or image sent by sender',
        function: async (msg) => {
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
    DELETE: {
        id: uuidv4(),
        name: 'DELETE',
        prompt: '!delete',
        description: 'Delete chat or quoted message by sender',
        function: async (msg) => {
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
        description: 'Clear message history of current chat',
        function: async (msg) => {
            const chat = await msg.getChat();
            chat.clearMessages();
        },
    },
    HELP: {
        id: uuidv4(),
        name: 'HELP',
        prompt: '!help',
        description: 'Send list of prompts available',
        function: async (msg) => {
            let reply = 'List of Prompts:';
            Object.values(PROMPT).forEach((value) => {
                reply = reply.concat(`\n - ${value.prompt}: ${value.description}`);
            });
            msg.reply(reply);
        },
    }
};

module.exports = PROMPT;