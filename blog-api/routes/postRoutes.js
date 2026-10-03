const express = require("express");
const Post = require("../models/Post");
const User = require("../models/User");

const router = express.Router();


// Create a user - only for testing
router.post("/users", async (req, res) => {
    try {
        const { name, email } = req.body;

        const user = await User.create({
            name,
            email
        });

        res.status(201).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Failed to create user",
            error: error.message
        });
    }
});


// Create a post
router.post("/", async (req, res) => {
    try {
        const { title, body, author } = req.body;

        const user = await User.findById(author);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Author not found"
            });
        }

        const post = await Post.create({
            title,
            body,
            author
        });

        res.status(201).json({
            success: true,
            data: post
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Failed to create post",
            error: error.message
        });
    }
});


// GET /posts - list posts with author name only
router.get("/", async (req, res) => {
    try {
        const posts = await Post.find()
            .populate("author", "name");

        res.status(200).json({
            success: true,
            data: posts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch posts",
            error: error.message
        });
    }
});

// Get all users
router.get("/users", async (req, res) => {
    try {
        const users = await User.find();

        res.status(200).json({
            success: true,
            data: users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch users",
            error: error.message
        });
    }
});

// GET /posts/:id - get one post with author and comment authors populated
router.get("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate("author", "name")
            .populate("comments.author", "name");

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }

        res.status(200).json({
            success: true,
            data: post
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Failed to fetch post",
            error: error.message
        });
    }
});

router.post("/:id/comments", async (req, res) => {
    try {
        const { author, body } = req.body;

        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }

        const user = await User.findById(author);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Comment author not found"
            });
        }

        post.comments.push({
            author,
            body
        });

        await post.save();

        const updatedPost = await Post.findById(req.params.id)
            .populate("author", "name")
            .populate("comments.author", "name");

        res.status(201).json({
            success: true,
            data: updatedPost
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Failed to add comment",
            error: error.message
        });
    }
});
module.exports = router;