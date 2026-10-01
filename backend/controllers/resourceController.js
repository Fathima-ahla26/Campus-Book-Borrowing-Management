const Resource = require("../models/Resource");

// CREATE RESOURCE
const createResource = async (req, res) => {
    try {
        const {
            title,
            description,
            category,
            type,
            contactInfo,
            mode,
            price
        } = req.body;

        if (
            !title ||
            !description ||
            !category ||
            !type ||
            !contactInfo ||
            !mode
        ) {
            return res.status(400).json({
                success: false,
                message: "Please fill in all required fields"
            });
        }

        if (!["Lend", "Sell"].includes(mode)) {
            return res.status(400).json({
                success: false,
                message: "Mode must be Lend or Sell"
            });
        }

        const parsedPrice = Number(price || 0);

        if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
            return res.status(400).json({
                success: false,
                message: "Price must be a valid non-negative number"
            });
        }

        // Lending resources cannot have a selling price
        if (mode === "Lend" && parsedPrice !== 0) {
            return res.status(400).json({
                success: false,
                message: "Lent resources must have a price of 0"
            });
        }

        const image = req.file
            ? `/uploads/${req.file.filename}`
            : "";

        const resource = await Resource.create({
            title,
            description,
            category,
            type,
            image,
            ownerId: req.user._id,
            contactInfo,
            mode,
            price: mode === "Sell" ? parsedPrice : 0,
            status: "Available"
        });

        res.status(201).json({
            success: true,
            message: "Resource created successfully",
            resource
        });

    } catch (error) {
        console.error("Create resource error:", error);

res.status(400).json({
    success: false,
    message: error.message || "Failed to create resource",
    error: error
});
    }
};


// GET ALL RESOURCES
const getResources = async (req, res) => {
    try {
        const { category, mode, search } = req.query;

        const filter = {};

        if (category) {
            filter.category = category;
        }

        if (mode) {
            filter.mode = mode;
        }

        if (search) {
            filter.$or = [
                {
                    title: {
                        $regex: search,
                        $options: "i"
                    }
                },
                {
                    description: {
                        $regex: search,
                        $options: "i"
                    }
                }
            ];
        }

        const resources = await Resource.find(filter)
            .populate("ownerId", "name studentId")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: resources.length,
            resources
        });

    } catch (error) {
        console.error("Get resources error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve resources"
        });
    }
};


// GET SINGLE RESOURCE
const getResourceById = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id)
            .populate("ownerId", "name studentId");

        if (!resource) {
            return res.status(404).json({
                success: false,
                message: "Resource not found"
            });
        }

        res.status(200).json({
            success: true,
            resource
        });

    } catch (error) {
        console.error("Get resource error:", error);

        res.status(400).json({
            success: false,
            message: "Invalid resource ID"
        });
    }
};


// UPDATE RESOURCE
const updateResource = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);

        if (!resource) {
            return res.status(404).json({
                success: false,
                message: "Resource not found"
            });
        }

        // Only the owner can update the resource
        if (
            resource.ownerId.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "You can only update your own resources"
            });
        }

        const allowedFields = [
            "title",
            "description",
            "category",
            "type",
            "contactInfo",
            "mode",
            "price"
        ];

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                resource[field] = req.body[field];
            }
        });

        // Update image if a new image was uploaded
        if (req.file) {
            resource.image = `/uploads/${req.file.filename}`;
        }

        // Validate mode
        if (!["Lend", "Sell"].includes(resource.mode)) {
            return res.status(400).json({
                success: false,
                message: "Mode must be Lend or Sell"
            });
        }

        // Lending resources must have price 0
        if (resource.mode === "Lend") {
            resource.price = 0;
        }

        if (
            !Number.isFinite(resource.price) ||
            resource.price < 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid price"
            });
        }

        await resource.save();

        res.status(200).json({
            success: true,
            message: "Resource updated successfully",
            resource
        });

    } catch (error) {
        console.error("Update resource error:", error);

        res.status(400).json({
            success: false,
            message: error.message || "Failed to update resource"
        });
    }
};


// DELETE RESOURCE
const deleteResource = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);

        if (!resource) {
            return res.status(404).json({
                success: false,
                message: "Resource not found"
            });
        }

        // Only the owner can delete
        if (
            resource.ownerId.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "You can only delete your own resources"
            });
        }

        // Do not allow deletion while being borrowed
        if (resource.status === "Lent") {
            return res.status(400).json({
                success: false,
                message: "A lent resource cannot be deleted"
            });
        }

        await resource.deleteOne();

        res.status(200).json({
            success: true,
            message: "Resource deleted successfully"
        });

    } catch (error) {
        console.error("Delete resource error:", error);

        res.status(400).json({
            success: false,
            message: "Failed to delete resource"
        });
    }
};


module.exports = {
    createResource,
    getResources,
    getResourceById,
    updateResource,
    deleteResource
};