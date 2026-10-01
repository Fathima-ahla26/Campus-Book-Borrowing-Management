const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
    createBorrowing,
    getBorrowingById,
    getMyBorrowings,
    getOwnerRequests,
    updateBorrowing,
    deleteBorrowing
} = require("../controllers/borrowingController");

const router = express.Router();

// Create borrowing request
router.post("/", protect, createBorrowing);

// Specific routes MUST come before /:id
router.get("/my", protect, getMyBorrowings);
router.get("/owner-requests", protect, getOwnerRequests);

// Single borrowing
router.get("/:id", protect, getBorrowingById);

// Update status / meeting details
router.put("/:id", protect, updateBorrowing);

// Delete pending request
router.delete("/:id", protect, deleteBorrowing);

module.exports = router;