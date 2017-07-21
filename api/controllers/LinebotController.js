/**
 * LinebotController
 *
 * @description :: Server-side logic for managing linebots
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const https = require('https');
const crypto = require('crypto');

const HOST = 'api.line.me'; 
const REPLY_PATH = '/v2/bot/message/reply';//リプライ用
const CH_SECRET = process.env.CHANNEL_SECRET; //Channel Secretを指定
const CH_ACCESS_TOKEN = process.env.CHANNEL_ACCESS_TOKEN; //Channel Access Tokenを指定
const SIGNATURE = crypto.createHmac('sha256', CH_SECRET);

module.exports = {
    callback: function (req, res) {
        let body = '';

        req.on('data', (chunk) => {
            body += chunk;
        });

        req.on('end', () => {
            if(body === ''){
              console.log('bodyが空です。');
              return;
            }
    
            let WebhookEventObject = JSON.parse(body).events[0];

            console.log(WebhookEventObject);

            //メッセージが送られて来た場合
            if(WebhookEventObject.type === 'message'){
                let SendMessageObject;
                if(WebhookEventObject.message.type === 'text'){
                    SendMessageObject = [{
                        type: 'text',
                        text: WebhookEventObject.message.text
                    }];
                }
                client(WebhookEventObject.replyToken, SendMessageObject)
                .then((body)=>{
                    console.log(body);
                },(e)=>{console.log(e)});
            }

            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.end('su');
        });
    }
};

/**
 * httpリクエスト部分
 */
const client = (replyToken, SendMessageObject) => {    
    let postDataStr = JSON.stringify({ replyToken: replyToken, messages: SendMessageObject });
    let options = {
        host: HOST,
        port: 443,
        path: REPLY_PATH,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
            'X-Line-Signature': SIGNATURE,
            'Authorization': `Bearer ${CH_ACCESS_TOKEN}`,
            'Content-Length': Buffer.byteLength(postDataStr)
        }
    };

    return new Promise((resolve, reject) => {
        let req = https.request(options, (res) => {
                    let body = '';
                    res.setEncoding('utf8');
                    res.on('data', (chunk) => {
                        body += chunk;
                    });
                    res.on('end', () => {
                        resolve(body);
                    });
        });

        req.on('error', (e) => {
            reject(e);
        });
        req.write(postDataStr);
        req.end();
    });
};