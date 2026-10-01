const mongoose = require("mongoose");

const borrowingSchema = new mongoose.Schema(
    {
        resourceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Resource",
            required: true
        },

        borrowerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        requestDate: {
            type: Date,
            default: Date.now
        },

        startDate: {
            type: Date,
            required: true
        },

        requestedReturnDate: {
            type: Date,
            required: true
        },

        approvedReturnDate: {
            type: Date,
            default: null
        },

        status: {
            type: String,
            enum: [
                "Pending",
                "Approved",
                "Rejected",
                "Returned",
                "Cancelled"
            ],
            default: "Pending"
        },

        meetingDetails: {
            type: String,
            default: "",
            trim: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Borrowing", borrowingSchema);