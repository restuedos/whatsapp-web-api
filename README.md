<p align="center">
<a href="https://laravel.com" target="_blank">
<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Node.js_logo_2015.svg/2560px-Node.js_logo_2015.svg.png" width="400">
</a>
</p>

<p align="center">
Node.js® is a JavaScript runtime built on <a href="https://v8.dev/">Chrome's V8 JavaScript engine</a>.
</p>

## About Whatsapp Web API

Whatsapp Web API is a Simple Bot for Whatsapp, you can create a sticker, spam chat, send quotes & receive deleted messages from your contacts

## How To

Configure `.env` file,  
set the `PROJECT_ID` with your project name (`ex:whatsapp-web-api`),  
set the `CHAT_LOG_ID` with your phone number (starts with country code, `ex:6281234567890`),  
set the `CHROME_PATH` with your chrome application path (puppeteer needs Chrome to send video & audio via Whatsapp Web, `ex:C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe`),

then run this command:  
`npm install`  
then use:  
`npm run start:dev` or `npm run start`

Now just scan the QR Code via your Whatsapp, and now you can send prompt to that number.  
Use `!help` to list available prompt to use,
enjoy!

## Security

For information on reporting security vulnerabilities in Whatsapp Web API, please contact <a href="mailto:restuedosetiaji@gmail.com">restuedosetiaji@gmail.com</a>.

## License

Node.js is available under the <a href="https://opensource.org/licenses/MIT" rel="nofollow">MIT license</a>. Node.js also includes external libraries that are available under a variety of licenses. See <a href="https://github.com/nodejs/node/blob/HEAD/LICENSE">LICENSE</a> for the full license text.
