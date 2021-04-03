const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const redis = require("../redis/index");
const helper = require("../helper/index");

let privateKey = process.env.PRIVATE_KEY.replace(/\\n/g, '\n');
let publicKey = process.env.PUBLIC_KEY.replace(/\\n/g, '\n');

let accessTokenSignOptions = {
    issuer:  "KS",
    subject:  "jwt",
    audience:  "users",
    expiresIn: 900,
    algorithm:  "RS256"
};

let refreshTokenSignOptions = {
    issuer:  "KS",
    subject:  "jwt",
    audience:  "users",
    expiresIn: 3900,
    algorithm:  "RS256"
}

let refreshTokenVerifyOptions = {
    issuer:  "KS",
    subject:  "jwt",
    audience:  "users",
    expiresIn: 3900,
    algorithm:  ["RS256"]
}

const registerUser = async(req, res, next) => {
    try {
        let {username, email, password} = req.body;
        username = helper.sanitize(username);
        email = helper.sanitize(email);
        password = helper.sanitize(password);
        console.log(username, email, password);
        const foundUser = await User.findOne({where: {username}});
        if(foundUser) res.json("Username Already Exists");
        else {
            const existingUser = await User.findOne({where: {email}});
            if(existingUser) res.json("Email Already Exists");
            else {
                bcrypt.genSalt(10, (err, salt) => {
                    if(!err) 
                    {
                        bcrypt.hash(password, salt, async(err, hash) => {
                            if(err) res.json(next(err));
                            else 
                            {
                                password = hash;
                                const user = await User.create({username, email, password});
                                res.json(user);
                            }
                        });
                    }
                });
            }
        }
    }
    catch(error) {
        res.json(next(error));
    }
}

const loginUser = async(req, res, next) => {
    try {
        let { email, password } = req.body;
        email = helper.sanitize(email);
        password = helper.sanitize(password);
        const user = await User.findOne({where: {email}});
        if(user)
        {
            bcrypt.compare(password, user.dataValues.password)
            .then((isMatch) => {
                if(!isMatch) res.json("Password is not correct");
                else 
                {
                    const accessTokendata = {id: user.dataValues.id};
                    jwt.sign(accessTokendata, privateKey, accessTokenSignOptions, (err, accessToken) => {
                        if(err) console.log(err);
                        else 
                        {
                            const refreshTokenData = {id: user.dataValues.id};
                            jwt.sign(refreshTokenData, privateKey, refreshTokenSignOptions, (err, refreshToken) => {
                                if(err) console.log(err);
                                else 
                                {
                                    console.log("ACCESS TOKEN => ", accessToken);
                                    console.log("REFRESH TOKEN => ", refreshToken);
                                    redis.setAccessToken(accessToken, refreshToken);
                                    redis.setRefreshToken(refreshToken);
                                    res.cookie("jwtToken", accessToken, {
                                        httpOnly: true,
                                        sameSite: 'None',
                                        secure: true
                                    });
                                    res.json({username: user.dataValues.username, email});
                                }
                            });       
                        }
                    });
                }
            })
            .catch((error) => {
                res.json(next(error));
            })
        }
        else res.json("Account Doesn't Exists");
    }
    catch(error) {
        res.json(next(error));
    }
}

const checkAuth = async(req, res, next) => {
    try {
        if(req.user === null) {
            res.clearCookie("jwtToken");
            res.json("INVALID");
        }
        else {
            const refreshToken = await redis.getRefreshTokenFromAccessToken(req.accessToken);
            res.json({username: req.user.username, email: req.user.email, accessToken: req.accessToken, refreshToken});            
        }
    }
    catch(error) {
        res.json(next(error));
    }
}

const logoutUser = async(req, res, next) => {
    try {
        console.log("MIDDLEWARE USERNAME => ", req.user.username);
        console.log("WEBSITE USERNAME => ", req.body.username);
        const user = req.user;
        if(user === null || user.username !== req.body.username) {
            res.status(401).json({Error: "You Are Not Logged In"});
        }
        else {
            const accessToken = req.cookies.token;
            console.log("ACCESS TOKEN => ", accessToken);
            const refreshToken = await redis.getRefreshTokenFromAccessToken(accessToken);
            console.log("REFRESH TOKEN => ", refreshToken);
            redis.deleteToken(accessToken);
            redis.deleteToken(refreshToken);
            res.clearCookie("token");
            res.json("Successfully Logged Out");
        }
    }
    catch(err) {
        res.json(next(err));
    }
}

const renewAccessToken = async(req, res, next) => {
    try {
        console.log("MIDDLEWARE USERNAME => ", req.user.username);
        console.log("WEBSITE USERNAME => ", req.body.username);
        const user = req.user;
        if(user === null || user.username !== req.body.username || user === undefined) {
            res.status(401).json({Error: "You Are Not Logged In"});
        }
        else {
            const accessToken = req.cookies.token;
            console.log("OLD ACCESS TOKEN => ", accessToken);
            const refreshToken = await redis.getRefreshTokenFromAccessToken(accessToken);
            console.log("REFRESH TOKEN => ", refreshToken);
            jwt.verify(refreshToken, publicKey, refreshTokenVerifyOptions, async(err, payload) => {
                if(err) return err;
                else 
                {
                    const { id } = payload;
                    console.log("USER ID => ", id);
                    const accessTokendata = {id};
                    jwt.sign(accessTokendata, privateKey, accessTokenSignOptions, (err, newAccessToken) => {
                        if(err) console.log(err);
                        else 
                        {
                            console.log("NEW ACCESS TOKEN => ", newAccessToken);
                            redis.deleteToken(accessToken);
                            res.clearCookie("jwtToken");
                            redis.setAccessToken(newAccessToken, refreshToken);
                            res.cookie("jwtToken", newAccessToken, {
                                httpOnly: true,
                                sameSite: 'None',
                                secure: true
                            });
                            res.json({accessToken: newAccessToken});
                        }
                    });
                }
            });
        }
    }
    catch(err) {
        res.json(next(err));
    }
}

const changePassword = async(req, res, next) => {
    try {
        const user = req.user;
        res.json(req.cookies, req.user);
        // if(user === null || user.username !== req.body.username || user === undefined) {
        //     res.status(401).json({Error: "You Are Not Logged In"});
        // }
        // else {
            // let { newPassword } = req.body;
            // newPassword = helper.sanitize(newPassword);
            // let existingUser = await User.findOne({where: {username: user.username}});
            // bcrypt.genSalt(10, (err, salt) => {
            //     if(!err) 
            //     {
            //         bcrypt.hash(newPassword, salt, async(err, hash) => {
            //             if(err) res.json(next(err));
            //             else 
            //             {
            //                 existingUser.password = hash;
            //                 existingUser.save()
            //                 .then((response) => {
            //                     res.json(response);
            //                 })
            //             }
            //         });
            //     }
            // });
            // res.json({
            //     message: "Password Changed Successfully",
            //     token: 
            // });
        // }
    }
    catch(err) {
        res.json(next(err));
    }
}

const saveText = async(req, res, next) => {
    try {
        const user = req.user;
        if(user === null || user.username !== req.body.username || user === undefined) {
            res.status(401).json({Error: "You Are Not Logged In"});
        }
        else {
            let text = helper.sanitize(req.body.text);
            res.json(text);
        }
    }
    catch(err) {
        res.json(next(err));
    }
}

module.exports = { 
    registerUser, 
    loginUser, 
    checkAuth, 
    logoutUser, 
    renewAccessToken, 
    changePassword, 
    saveText 
}