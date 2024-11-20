const User = require("../model/User")
const Utils = require("./Utils")
const bcrypt = require("bcryptjs")
const fs = require('fs')
const path = require('path')

const jsonData = fs.readFileSync(path.join(__dirname, './admincredentials.json'), 'utf8')
const adminCredentials = JSON.parse(jsonData);

// validate Admin
const validateAdmin = async (username, password) => {
    if (username === adminCredentials.username) {
        const match = await bcrypt.compare(password, adminCredentials.password);
        return match;
    }
    return false;
};

// admin API - add user
exports.addUser = async (req, res, next) => {
    const { username, password, name, email, role, adminUsername, adminPassword} = req.body;

    // Validate Admin Credentials
    const isAdminValid = await validateAdmin(adminUsername, adminPassword);
    if (!isAdminValid) {
        return res.status(403).json({
            status: false,
            error: 'Invalid admin credentials'
        });
    }

    try {
        const hash = await bcrypt.hash(password, 10);
        password = null;

        const user = await User.create({
            username,
            password: hash,
            name,
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

// Admin API - get user
exports.getUser = async (req, res, next) => {
    const userInfo = req.body.user;
    const {adminUsername, adminPassword} = req.body;

    if (!userInfo.username && !userInfo.email) {
        return res.status(401).json({
            status: false,
            message: "Specify username or email id",
        });
    }

    // Validate Admin Credentials
    const isAdminValid = await validateAdmin(adminUsername, adminPassword);
    if (!isAdminValid) {
        return res.status(403).json({
            status: false,
            error: 'Invalid admin credentials'
        });
    }
    
    try {
        let filter = null;
        if (userInfo.username) {
            filter = {username: userInfo.username};
        } else if(userInfo.email) {
            filter = {email: userInfo.email};
        }

        const user = await User.findOne(filter);
        
        if (!user) { 
            return res.status(404).json({ 
                status: false,
                error: 'User not found'
            });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(400).json({
            status: false,
            message: "An unknown error occurred",
            error: error.message
        });
    }
}

// Admin API - get user with userId
exports.getUserWithId = async (req, res, next) => {
    const { id } = req.params;
    const { adminUsername, adminPassword } = req.body;

    // Validate Admin Credentials
    const isAdminValid = await validateAdmin(adminUsername, adminPassword);
    if (!isAdminValid) {
        return res.status(403).json({ error: 'Invalid admin credentials' });
    }
 
    try {
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ 
                status: false,
                error: 'User not found'
            });
        }
        
        res.status(200).json(user);
    } catch (error) {
        res.status(401).json({
            status: false,
            message: "An unknown error occurred",
            error: error.message
        });
    }
}

// Admin API - get all users
exports.getAllUsers = async (req, res, next) => {
    const { adminUsername, adminPassword } = req.body;

    // Validate Admin Credentials
    const isAdminValid = await validateAdmin(adminUsername, adminPassword);
    if (!isAdminValid) {
        return res.status(403).json({ error: 'Invalid admin credentials' });
    }

    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(400).json({
            status: false,
            message: "An unknown error occurred",
            error: error.message
        });
    }
}

// Admin API - delete user
exports.deleteUser = async (req, res, next) => {
    const userInfo = req.body.user;
    const {adminUsername, adminPassword} = req.body;

    if (!userInfo.username && !userInfo.email) {
        return res.status(401).json({
            status: false,
            message: "Specify username or email id",
        });
    }

    // Validate Admin Credentials
    const isAdminValid = await validateAdmin(adminUsername, adminPassword);
    if (!isAdminValid) {
        return res.status(403).json({
            status: false,
            error: 'Invalid admin credentials'
        });
    }
    
    try {
        let filter = null;
        if (userInfo.username) {
            filter = {username: userInfo.username};
        } else if(userInfo.email) {
            filter = {email: userInfo.email};
        }

        const user = await User.findOneAndDelete(filter);
        
        if (!user) {
            return res.status(404).json({
                status: false,
                error: 'User not found'
            });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(400).json({
            status: false,
            message: "An unknown error occurred",
            error: error.message
        });
    }
}

// Admin API - delete user with id
exports.deleteUserWithId = async (req, res, next) => {
    const { id } = req.params;
    const { adminUsername, adminPassword } = req.body;

    // Validate Admin Credentials
    const isAdminValid = await validateAdmin(adminUsername, adminPassword);
    if (!isAdminValid) {
        return res.status(403).json({ error: 'Invalid admin credentials' });
    }

    try {
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(400).json({
            status: false,
            message: "An unknown error occurred",
            error: error.message
        });
    }
}