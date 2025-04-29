const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { genSignHeaders } = require('./auth_util');

// 请替换APP_ID、APP_KEY
const APP_ID = '2025855835';
const APP_KEY = 'LyTxQWAmjwFLqoju';
const URI = '/vivogpt/completions';
const DOMAIN = 'api-ai.vivo.com.cn';
const METHOD = 'POST';

async function syncLanxingpt(prompt) {
    const params = {
        'requestId': uuidv4()
    };
    // console.log('requestId:', params.requestId);

    const data = {
        'prompt': prompt,
        'model': 'vivo-BlueLM-TB-Pro',
        'sessionId': uuidv4(),
        'extra': {
            'temperature': 0.9
        }
    };

    const headers = genSignHeaders(APP_ID, APP_KEY, METHOD, URI, params);
    headers['Content-Type'] = 'application/json';

    // const startTime = Date.now();
    const url = `https://${DOMAIN}${URI}`;

    try {
        const response = await axios.post(url, data, {
            headers: headers,
            params: params
        });

        if (response.status === 200) {
            const resObj = response.data;
            // console.log('response:', resObj);
            if (resObj.code === 0 && resObj.data) {
                const content = resObj.data.content;
                // console.log('final content:\n', content);
                return content;
            }
        }

        
    } catch (error) {
        console.error('Error:', error.response ? error.response.status : error.message);
        if (error.response) {
            console.error(error.response.data);
        }
    }
    return "ERROR";
    // const endTime = Date.now();
    // const timeCost = (endTime - startTime) / 1000;
    // console.log(`请求耗时: ${timeCost.toFixed(2)}秒`);
}

module.exports = {
    syncLanxingpt
};
