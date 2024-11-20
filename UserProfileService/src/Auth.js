const User = require("../model/User")
const Utils = require("./Utils")
const bcrypt = require("bcryptjs")
const moment = require('moment');

// user registration API

// user registration is in the format. All fields are required
// {
//     userInfo: {
//         name: 'full name',
//         email: 'abcd@gmail.com',
//         password: 'qwerty', // password should be a min of 8 characters
//         username: 'my_user_name'
//     }
// }

exports.register = async (req, res, next) => {
    const {userInfo} = req.body;
    const fullName = userInfo.name;
    const email = userInfo.email;
    const username = userInfo.username;
    let password = userInfo.password;

    if (!password || password.length < 8) {
        return res.status(400).json({ message: "Password less than 8 characters" });
    }

    try {
        const hash = await bcrypt.hash(password, 10);
        password = null;

        const user = await User.create({
            username,
            password: hash,
            name: fullName,
            email
        });

        res.status(200).json({
            status: true,
            message: "User successfully created",
            user: {
                username: user.username,
                email: user.email
            }
        });
    } catch (err) {
        res.status(401).json({
            status: false,
            message: "User creation failed",
            error: err.message
        });
    }
}

// user login API

// user login input format
// {
//     username: 'my_username',
//     password: 'qwerty'
// }

exports.login = async (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;
    
    if (!username || !password) {
        return res.status(400).json({
            status: false,
            message: "Username or password not present"
        })
    }

    try {
        const user = await User.findOne({username});

        // user not found
        if (!user) {
            res.status(401).json({
                status: false,
                message: "user not found"
            });
        } else {
            const result = await bcrypt.compare(password, user.password);
            if (result) {
                const logincount = user.logincount + 1;
                const token = Utils.generateJWT({username: user.username, version: logincount});
                const refreshExpiry = moment().utc().add(3, 'days').endOf('day').format('X')
                const refreshtoken = Utils.generateJWT({ exp: parseInt(refreshExpiry), data: user.username })

                delete user.password;

                const filter = { username };
                const update = { $inc: { logincount: 1}};
                const userUpdated = await User.findOneAndUpdate(filter, update);

                res.status(200).json({
                    status: true,
                    message: "Login successful",
                    user: user.username,
                    token,
                    refresh: refreshtoken
                });
            } else {
                res.status(401).json({
                    status: false,
                    message: "Password entered is invalid",
                });
            }
        }
    } catch (error) {
        res.status(400).json({
            status: false,
            message: "An unknown error occurred",
            error: error.message
        });
    }
}

// user logout API
exports.logout = async (req, res, next) => {
    const username = req.body.username;
    const sessionExpiryErr = {
        status: false,
        message: "Session has expired"
    };
    
    if (!username) {
        return res.status(400).json({
            status: false,
            message: "Username not sent"
        })
    }

    try {
        const sessionToken = req.headers['authorization'];
        if(!sessionToken) {
            return res.status(403).send(sessionExpiryErr);
        }

        const user = await User.findOne({username});
        // user not found
        if (!user) {
            res.status(401).json({
                status: false,
                message: "User not found"
            });
        } else {
            const userInfo = Utils.verifyJWT(sessionToken);

            if (userInfo.username === username && user.logincount === userInfo.version) {
                // invalidate session token
                const filter = {username};
                const update = {$inc: {logincount: 1}}
                const result = await User.findOneAndUpdate(filter, update);
                res.status(200).json({
                    status: true,
                    message: "Logout successful",
                    user
                });
            } else {
                res.status(403).json(sessionExpiryErr);
            }
        }
    } catch (error) {
        res.status(400).json({
            status: false,
            message: "An unknown error occurred",
            error: error.message
        });
    }
}