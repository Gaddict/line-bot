/**
 * LinebotController
 *
 * @description :: Server-side logic for managing linebots
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var request = require('request');
const crypto = require('crypto');

const HOST = 'api.line.me'; 
const REPLY_PATH = '/v2/bot/message/reply';//リプライ用
const CH_SECRET = process.env.CHANNEL_SECRET; //Channel Secretを指定
const CH_ACCESS_TOKEN = process.env.CHANNEL_ACCESS_TOKEN; //Channel Access Tokenを指定
const SIGNATURE = crypto.createHmac('sha256', CH_SECRET);

module.exports = {
    callback: function (req, res) {
        let WebhookEventObject = req.body.events[0];

        console.log('WebhookEventObject');
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

        return res.send('OK');
    }
};

/**
 * httpリクエスト部分
 */
const client = (replyToken, SendMessageObject) => {    
    let postDataStr = JSON.stringify({ replyToken: replyToken, messages: SendMessageObject });
    let options = {
        url: 'https://' + HOST + REPLY_PATH,
        port: 443,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
            'X-Line-Signature': SIGNATURE,
            'Authorization': `Bearer ${CH_ACCESS_TOKEN}`,
            'Content-Length': Buffer.byteLength(postDataStr)
        },
        body: postDataStr,
        json: true,
        proxy: process.env.FIXIE_URL
    };

    console.log('options');
    console.log(options);

    console.log('postDataStr');
    console.log(postDataStr);

    return new Promise((resolve, reject) => {
        // let req = https.request(options, (res) => {
        //             let body = '';
        //             res.setEncoding('utf8');
        //             res.on('data', (chunk) => {
        //                 body += chunk;
        //             });
        //             res.on('end', () => {
        //                 resolve(body);
        //             });
        // });

        request.post(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log(body);
            } else {
                console.log('error: '+ JSON.stringify(response));
            }
        });

        // req.on('error', (e) => {
        //     reject(e);
        // });
        // req.write(postDataStr);
        // req.end();
    });
};