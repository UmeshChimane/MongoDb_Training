const mongoose = require("mongoose");const noteSchema = new mongoose.Schema(
    {
        userId: {
            type: Number,
            required: true
        },
        title: {
            type: String,
            required: true,
            minlength: 3
        },
        content: {
            type: String,
            required: true,
            minlength: 5
        },
        tags: {
            type: [String],
            default: []
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Note", noteSchema);