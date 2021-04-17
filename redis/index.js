const redis = require("redis");
const bluebird = require("bluebird");
bluebird.promisifyAll(redis);

/** CREATING A REDIS CLIENT */
const redisClient = redis.createClient(process.env.REDIS_URL, {
    no_ready_check: true,
    auth_pass: process.env.REDIS_PASSWORD
});

/** CONNECTING TO REDIS CACHE */
redisClient.on("connect", (err) => {
    if(err) console.log(err);    
    else console.log("Redis cluster connected Successfully");    
});

/**
 * FUNCTION TO PRINT ALL CACHE DATA
 */
const printAllTokens = () => {
    redisClient.keys("*", (err, keys) => {
        if(err) console.log(err);
        else 
        {
            keys.map((key) => {
                redisClient.get(key, (err, value) => {
                    if(err) console.log(err);
                    else console.log("Key => ", key , "VALUE => ", value);
                });
            })
        }
    });
};

/**
 * FUNCTION TO DELETE EVERYTHING FROM CACHE
 */
const deleteAllTokens = () => {
    redisClient.flushall((err, res) => {
        if(err) console.log(err);
        else  console.log(res);
    });
}

/**
 * FUNCTION TO DELETE A PARTICULAR TOKEN
 * @param {String} token 
 */
const deleteToken = (token) => {
    redisClient.del(token, (err, response) => {
        if(err) console.log(err);
        else console.log(response);
    });
}

/**
 * FUNCTION TO INSERT ACCESS TOKEN IN CACHE
 * @param {String} token 
 * @param {String} value 
 */
const setAccessToken = (token, value) => {
    redisClient.setex(token, 600, value);
}

/**
 * FUNCTION TO INSERT REFRESH TOKEN IN CACHE 
 * @param {String} token 
 */
const setRefreshToken = (token) => {
    redisClient.setex(token, 3600, "1");
}

/**
 * FUNCTION TO GET REFRESH TOKEN FROM ACCESS TOKEN
 * @param {String} accessToken 
 * @returns refresh token from access token
 */
const getRefreshTokenFromAccessToken = async(accessToken) => {
    const refreshToken = await redisClient.getAsync(accessToken);
    return refreshToken;
}

module.exports = { 
    printAllTokens,
    deleteAllTokens,
    deleteToken,
    setAccessToken,
    setRefreshToken,
    getRefreshTokenFromAccessToken
};