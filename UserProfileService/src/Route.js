const express = require("express");
const router = express.Router();
const { register, login, logout} = require("./Auth");
const { addUser, getUser, getUserWithId, getAllUsers, deleteUser, deleteUserWithId} = require("./Admin.js")
const {changePassword} = require("./Users.js");

// auth APIs
router.route("/auth/registerUser").post(register);
router.route("/auth/userLogin").post(login);
router.route("/auth/userLogout").post(logout);

// user APIs
router.route("/users/changePassword").post(changePassword);

// admin APIs
router.route("/admin/addUser").post(addUser);
router.route("/admin/getUser").get(getUser);
router.route("/admin/getUser/:userId").get(getUserWithId);
router.route("/admin/getAllUsers").get(getAllUsers);
router.route("/admin/deleteUser").delete(deleteUser);
router.route("/admin/deleteUser/:userId").delete(deleteUserWithId);

module.exports = router;