const User = require("../model/User")
const Utils = require("./Utils")
const bcrypt = require("bcryptjs")

// user change password
exports.changePassword = async (req, res, next) => {
    const username = req.body.username;
    const oldPassword = req.body.oldPassword;
    const newPassowrd = req.body.newPassowrd;

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
            const userSessionInfo = Utils.verifyJWT(sessionToken);

            if (userSessionInfo.username === username && user.logincount === userSessionInfo.version) {
                // validate old password
                const result = await bcrypt.compare(oldPassword, user.password);
                if (result) {
                    if (newPassowrd.length > 7) {
                        const newHash = await bcrypt.hash(newPassowrd, 10);
                        const filter = { username: username };
                        const update = { 
                            $set: { password: newHash},
                            $inc: { logincount: 1 }
                        };

                        await User.findOneAndUpdate(filter, update);
                        res.status(200).json({
                            status: true,
                            message: "Change of password is successful. Please login again",
                            username: user.username
                        })
                    } else {
                        res.status(401).json({
                            status: false,
                            message: "New password needs to be minimum of 8 characters"
                        });
                    }
                } else {
                    res.status(401).json({
                        status: false,
                        message: "Old password is incorrect"
                    });
                }

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