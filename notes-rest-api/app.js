const express = require("express");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(cookieParser());

const noteRoutes = require("./routes/noteRoutes");
const authRoutes = require("./routes/authRoutes");
const requireAuth = require("./middleware/requireAuth");

app.use("/notes", noteRoutes);
app.use("/auth", authRoutes);

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Notes API is running"
    });
});

app.get("/profile", requireAuth, (req, res) => {
    res.json({
        success: true,
        user: req.user
    });
});

module.exports = app;