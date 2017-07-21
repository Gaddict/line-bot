/**
 * LinebotController
 *
 * @description :: Server-side logic for managing linebots
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const line = require('@line/bot-sdk');

const config = {
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.CHANNEL_SECRET
};

const client = new line.Client(config);

const middleware = line.middleware(config);

module.exports = {
    callback: function (req, res, err) {
        middleware(req, res, (req, res) => {
            Promise
            .all(req.body.events.map(handleEvent))
            .then((result) => res.json(result));
        })
    }
};

function handleEvent(event) {
    console.log(event);

    if (event.type !== 'message' && event.message.type !== 'text') {
        return Promise.resolve(null);
    }

    return client.replyMessage(event.replyToken, {
        type: 'text',
        text: event.message.text
    });
}

