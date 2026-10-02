const express = require("express");
const { z } = require("zod");
const fs = require("fs");

const requireAuth = require("../middleware/requireAuth");
const Note = require("../models/Note");

const router = express.Router();

const upload = require("../middleware/upload");

const noteSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    content: z.string().min(5, "Content must be at least 5 characters"),
    tags: z.array(z.string()).optional()
});

const updateNoteSchema = noteSchema.partial();


// GET /notes
router.get("/", requireAuth, async (req, res) => {
    try {
        const limit = Number(req.query.limit) || 10;
        const offset = Number(req.query.offset) || 0;

        const userId = Number(req.user.userId);

        const total = await Note.countDocuments({ userId });

        const userNotes = await Note.find({ userId })
            .skip(offset)
            .limit(limit);

        res.status(200).json({
            success: true,
            limit,
            offset,
            total,
            data: userNotes
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch notes",
            error: error.message
        });
    }
});


// GET /notes/stats
router.get("/stats", requireAuth, async (req, res) => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const stats = await Note.aggregate([
            {
                $facet: {

                    // 1. Total notes per user
                    totalNotesPerUser: [
                        {
                            $group: {
                                _id: "$userId",
                                totalNotes: { $sum: 1 }
                            }
                        },
                        {
                            $sort: {
                                totalNotes: -1
                            }
                        }
                    ],

                    // 2. Most-used tags - Top 10
                    mostUsedTags: [
                        {
                            $unwind: "$tags"
                        },
                        {
                            $group: {
                                _id: "$tags",
                                count: { $sum: 1 }
                            }
                        },
                        {
                            $sort: {
                                count: -1
                            }
                        },
                        {
                            $limit: 10
                        }
                    ],

                    // 3. Notes created per day for last 7 days
                    notesPerDay: [
                        {
                            $match: {
                                createdAt: {
                                    $gte: sevenDaysAgo
                                }
                            }
                        },
                        {
                            $group: {
                                _id: {
                                    $dateToString: {
                                        format: "%Y-%m-%d",
                                        date: "$createdAt"
                                    }
                                },
                                count: { $sum: 1 }
                            }
                        },
                        {
                            $sort: {
                                _id: 1
                            }
                        }
                    ]
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: stats[0]
        });

    } catch (error) {
        console.error("Stats error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to generate statistics"
        });
    }
});

// GET /notes/:id
router.get("/:id", requireAuth, async (req, res) => {
    try {
        const note = await Note.findOne({
            _id: req.params.id,
            userId: Number(req.user.userId)
        });

        if (!note) {
            return res.status(404).json({
                success: false,
                message: "Note not found"
            });
        }

        res.status(200).json({
            success: true,
            data: note
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch note",
            error: error.message
        });
    }
});


// POST /notes
router.post("/", requireAuth, async (req, res) => {
    try {
        const result = noteSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(422).json({
                success: false,
                message: "Validation failed",
                errors: result.error.issues
            });
        }

        const newNote = await Note.create({
            userId: Number(req.user.userId),
            title: result.data.title,
            content: result.data.content,
            tags: result.data.tags || []
        });

        res.status(201).json({
            success: true,
            data: newNote
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create note",
            error: error.message
        });
    }
});


// PATCH /notes/:id
router.patch("/:id", requireAuth, async (req, res) => {
    try {
        const result = updateNoteSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(422).json({
                success: false,
                message: "Validation failed",
                errors: result.error.issues
            });
        }

        const note = await Note.findOneAndUpdate(
            {
                _id: req.params.id,
                userId: Number(req.user.userId)
            },
            {
                $set: result.data
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!note) {
            return res.status(404).json({
                success: false,
                message: "Note not found"
            });
        }

        res.status(200).json({
            success: true,
            data: note
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update note",
            error: error.message
        });
    }
});


// DELETE /notes/:id
router.delete("/:id", requireAuth, async (req, res) => {
    try {
        const note = await Note.findOneAndDelete({
            _id: req.params.id,
            userId: Number(req.user.userId)
        });

        if (!note) {
            return res.status(404).json({
                success: false,
                message: "Note not found"
            });
        }

        res.status(204).send();
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete note",
            error: error.message
        });
    }
});


// POST /notes/:id/attachment
router.post(
    "/:id/attachment",
    requireAuth,
    upload.single("attachment"),
    async (req, res) => {
        try {
            const note = await Note.findOne({
                _id: req.params.id,
                userId: Number(req.user.userId)
            });

            if (!note) {
                if (req.file) {
                    fs.unlinkSync(req.file.path);
                }

                return res.status(404).json({
                    success: false,
                    message: "Note not found"
                });
            }

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: "Image is required"
                });
            }

            note.attachment = {
                filename: req.file.filename,
                path: req.file.path,
                mimetype: req.file.mimetype
            };

            await note.save();

            res.status(201).json({
                success: true,
                message: "Attachment uploaded successfully",
                attachment: note.attachment
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to upload attachment",
                error: error.message
            });
        }
    }
);


// GET /notes/:id/attachment
router.get(
    "/:id/attachment",
    requireAuth,
    async (req, res) => {
        try {
            const note = await Note.findOne({
                _id: req.params.id,
                userId: Number(req.user.userId)
            });

            if (!note) {
                return res.status(404).json({
                    success: false,
                    message: "Note not found"
                });
            }

            if (!note.attachment) {
                return res.status(404).json({
                    success: false,
                    message: "Attachment not found"
                });
            }

            if (!fs.existsSync(note.attachment.path)) {
                return res.status(404).json({
                    success: false,
                    message: "Attachment file not found"
                });
            }

            res.setHeader(
                "Content-Type",
                note.attachment.mimetype
            );

            const stream = fs.createReadStream(
                note.attachment.path
            );

            stream.pipe(res);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to fetch attachment",
                error: error.message
            });
        }
    }
);


module.exports = router;