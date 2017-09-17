module.exports = {
    "id": "f668fd90-1948-4012-8150-7a1558e373c0",
    "timestamp": "2017-09-17T03:20:38.081Z",
    "lang": "en",
    "result": {
        "source": "agent",
        "resolvedQuery": "game reset",
        "action": "startgame",
        "actionIncomplete": false,
        "parameters": {},
        "contexts": [
            {
                "name": "readytoplay",
                "parameters": {},
                "lifespan": 1
            },
            {
                "name": "ingame",
                "parameters": {},
                "lifespan": 1
            }
        ],
        "metadata": {
            "intentId": "d7e5f593-dfa0-4488-8bbf-98ba8c34b8c1",
            "webhookUsed": "true",
            "webhookForSlotFillingUsed": "false",
            "webhookResponseTime": 3443,
            "intentName": "Test Game Reset"
        },
        "fulfillment": {
            "speech": "Does it have long fur?",
            "source": "samuelli.net",
            "displayText": "Does it have long fur?",
            "messages": [
                {
                    "type": 0,
                    "speech": "Does it have long fur?"
                }
            ]
        },
        "score": 1
    },
    "status": {
        "code": 200,
        "errorType": "success"
    },
    "sessionId": "403f864b-3f12-4987-ad87-0377f2b6f5d4"
};