/**
 * LinebotController
 *
 * @description :: Server-side logic for managing linebots
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    callback: function (req, res) {
        const line = require('@line/bot-sdk');

        const config = {
            channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
            channelSecret: process.env.CHANNEL_SECRET
        };

        Promise
        .all(req.body.events.map(handleEvent))
        .then((result) => res.json(result));

        const client = new line.Client(config);
        function handleEvent(event) {
            if (event.type !== 'message' || event.message.type !== 'text') {
                return Promise.resolve(null);
            }
      
            return client.replyMessage(event.replyToken, {
                type: 'text',
                text: event.message.text
            });
        }
    },
};
