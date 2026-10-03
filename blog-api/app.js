const express = require("express");
require("dotenv").config();

const postRoutes = require("./routes/postRoutes");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Blog API is running"
    });
});

app.use("/posts", postRoutes);

module.exports = app;