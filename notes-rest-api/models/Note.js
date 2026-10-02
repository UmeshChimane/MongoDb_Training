const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Title is required"],
            minlength: [3, "Title must be at least 3 characters"],
            trim: true
        },

        content: {
            type: String,
            required: [true, "Content is required"],
            minlength: [5, "Content must be at least 5 characters"]
        },

        tags: {
            type: [String],
            default: []
        },

        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Owner is required"]
        }
    },
    {
        timestamps: true
    }
);


// Trim title before saving
noteSchema.pre("save", async function () {
    if (this.title) {
        this.title = this.title.trim();
    }
});


module.exports = mongoose.model("Note", noteSchema);