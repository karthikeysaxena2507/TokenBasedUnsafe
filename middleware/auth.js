const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

let publicKey = process.env.PUBLIC_KEY.replace(/\\n/g, '\n');

let accessTokenVerifyOptions = {
    issuer:  "KS",
    subject:  "jwt",
    audience:  "users",
    expiresIn: 900,
    algorithm:  ["RS256"]
};

/**
 * FUNCTION TO VERIFY A JWT TOKEN 
 * @param {Object} req 
 * @param {Object} res 
 * @param {Function} next 
 */
module.exports = (req, res, next) => {
    const token = req.cookies.jwtToken;
    if(!token)
    {
        req.user = null;
        next();
    } 
    else 
    {
        jwt.verify(token, publicKey, accessTokenVerifyOptions, async(err, payload) => {
            if(err) req.user = null;
            else 
            {
                const { id } = payload;
                const user = await User.findOne({where: {id}});
                req.user = user.dataValues;
                req.accessToken = token;
            }
            next();
        });
    }
}