const express = require("express");

const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
    createResource,
    getResources,
    getResourceById,
    updateResource,
    deleteResource
} = require("../controllers/resourceController");

const router = express.Router();

// Public routes
router.get("/", getResources);
router.get("/:id", getResourceById);

// Protected routes
router.post("/", protect, upload.single("image"), createResource);

router.put("/:id", protect, upload.single("image"), updateResource);

router.delete("/:id", protect, deleteResource);

module.exports = router;