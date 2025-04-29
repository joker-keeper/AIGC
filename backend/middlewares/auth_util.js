const crypto = require('crypto');
const querystring = require('querystring');

/**
 * 生成随机字符串
 * @param {number} length - 字符串长度
 * @returns {string} 随机字符串
 */
function genNonce(length = 8) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * 生成规范化的查询字符串
 * @param {Object} params - 查询参数
 * @returns {string} 规范化的查询字符串
 */
function genCanonicalQueryString(params) {
    if (params) {
        const sortedKeys = Object.keys(params).sort();
        const pairs = sortedKeys.map(key => {
            const encodedKey = querystring.escape(key);
            const encodedValue = querystring.escape(String(params[key]));
            return `${encodedKey}=${encodedValue}`;
        });
        return pairs.join('&');
    }
    return '';
}

/**
 * 生成签名
 * @param {string} appSecret - 应用密钥
 * @param {string} signingString - 待签名字符串
 * @returns {string} 签名
 */
function genSignature(appSecret, signingString) {
    const hmac = crypto.createHmac('sha256', appSecret);
    hmac.update(signingString);
    return hmac.digest('base64');
}

/**
 * 生成签名头部
 * @param {string} appId - 应用ID
 * @param {string} appKey - 应用密钥
 * @param {string} method - HTTP方法
 * @param {string} uri - 请求URI
 * @param {Object} query - 查询参数
 * @returns {Object} 签名头部对象
 */
function genSignHeaders(appId, appKey, method, uri, query) {
    method = method.toUpperCase();
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonce = genNonce();
    const canonicalQueryString = genCanonicalQueryString(query);
    
    const signedHeadersString = `x-ai-gateway-app-id:${appId}\nx-ai-gateway-timestamp:${timestamp}\nx-ai-gateway-nonce:${nonce}`;
    
    const signingString = `${method}\n${uri}\n${canonicalQueryString}\n${appId}\n${timestamp}\n${signedHeadersString}`;
    
    const signature = genSignature(appKey, signingString);
    
    return {
        'X-AI-GATEWAY-APP-ID': appId,
        'X-AI-GATEWAY-TIMESTAMP': timestamp,
        'X-AI-GATEWAY-NONCE': nonce,
        'X-AI-GATEWAY-SIGNED-HEADERS': 'x-ai-gateway-app-id;x-ai-gateway-timestamp;x-ai-gateway-nonce',
        'X-AI-GATEWAY-SIGNATURE': signature
    };
}

module.exports = {
    genSignHeaders
}; 