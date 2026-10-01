const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        category: {
            type: String,
            required: true,
            enum: [
                "Book",
                "Novel",
                "Past Paper",
                "Notes",
                "Study Material",
                "Other"
            ]
        },

        type: {
            type: String,
            required: true,
            enum: [
                "Book",
                "Novel",
                "Academic",
                "Personal",
                "Past Paper",
                "Notes",
                "Study Material",
                "Other"
            ]
        },

        image: {
            type: String,
            default: ""
        },

        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        contactInfo: {
            type: String,
            required: true,
            trim: true
        },

        mode: {
            type: String,
            required: true,
            enum: ["Lend", "Sell"]
        },

        status: {
            type: String,
            enum: ["Available", "Lent", "Sold"],
            default: "Available"
        },

        price: {
            type: Number,
            default: 0,
            min: 0
        },

        availableFrom: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Resource", resourceSchema);