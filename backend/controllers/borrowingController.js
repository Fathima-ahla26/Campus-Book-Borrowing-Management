const Borrowing = require("../models/Borrowing");
const Resource = require("../models/Resource");

// CREATE BORROWING REQUEST
const createBorrowing = async (req, res) => {
    try {
        const {
            resourceId,
            startDate,
            requestedReturnDate,
            meetingDetails
        } = req.body;

        if (!resourceId || !startDate || !requestedReturnDate) {
            return res.status(400).json({
                success: false,
                message: "Resource, start date and return date are required"
            });
        }

        const resource = await Resource.findById(resourceId);

        if (!resource) {
            return res.status(404).json({
                success: false,
                message: "Resource not found"
            });
        }

        if (resource.mode !== "Lend") {
            return res.status(400).json({
                success: false,
                message: "Only lending resources can be borrowed"
            });
        }

        if (resource.status !== "Available") {
            return res.status(400).json({
                success: false,
                message: "This resource is currently unavailable"
            });
        }

        if (
            resource.ownerId.toString() === req.user._id.toString()
        ) {
            return res.status(400).json({
                success: false,
                message: "You cannot borrow your own resource"
            });
        }

        const start = new Date(startDate);
        const returnDate = new Date(requestedReturnDate);

        if (
            Number.isNaN(start.getTime()) ||
            Number.isNaN(returnDate.getTime()) ||
            returnDate <= start
        ) {
            return res.status(400).json({
                success: false,
                message: "Return date must be after the start date"
            });
        }

        const existingRequest = await Borrowing.findOne({
            resourceId,
            borrowerId: req.user._id,
            status: { $in: ["Pending", "Approved"] }
        });

        if (existingRequest) {
            return res.status(400).json({
                success: false,
                message: "You already have an active request for this resource"
            });
        }

        const borrowing = await Borrowing.create({
            resourceId,
            borrowerId: req.user._id,
            startDate: start,
            requestedReturnDate: returnDate,
            meetingDetails: meetingDetails || "",
            status: "Pending"
        });

        res.status(201).json({
            success: true,
            message: "Borrowing request submitted",
            borrowing
        });

    } catch (error) {
        console.error("Create borrowing error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create borrowing request"
        });
    }
};

// GET SINGLE BORROWING
const getBorrowingById = async (req, res) => {
    try {
        const borrowing = await Borrowing.findById(req.params.id)
            .populate("resourceId")
            .populate("borrowerId", "name studentId email");

        if (!borrowing) {
            return res.status(404).json({
                success: false,
                message: "Borrowing request not found"
            });
        }

        const isBorrower =
            borrowing.borrowerId._id.toString() === req.user._id.toString();

        const resource = await Resource.findById(borrowing.resourceId._id);

        const isOwner =
            resource &&
            resource.ownerId.toString() === req.user._id.toString();

        if (!isBorrower && !isOwner) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to view this borrowing request"
            });
        }

        res.status(200).json({
            success: true,
            borrowing
        });

    } catch (error) {
        console.error("Get borrowing error:", error);

        res.status(400).json({
            success: false,
            message: "Invalid borrowing ID"
        });
    }
};

// GET MY BORROWING REQUESTS
const getMyBorrowings = async (req, res) => {
    try {
        const borrowings = await Borrowing.find({
            borrowerId: req.user._id
        })
            .populate("resourceId")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: borrowings.length,
            borrowings
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve borrowing requests"
        });
    }
};

// GET REQUESTS FOR MY RESOURCES
const getOwnerRequests = async (req, res) => {
    try {
        const myResources = await Resource.find({
            ownerId: req.user._id
        }).select("_id");

        const resourceIds = myResources.map((resource) => resource._id);

        const borrowings = await Borrowing.find({
            resourceId: { $in: resourceIds }
        })
            .populate("resourceId")
            .populate("borrowerId", "name studentId email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: borrowings.length,
            borrowings
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve owner requests"
        });
    }
};

// UPDATE BORROWING STATUS
const updateBorrowing = async (req, res) => {
    try {
        const { status, meetingDetails } = req.body;

        const borrowing = await Borrowing.findById(req.params.id);

        if (!borrowing) {
            return res.status(404).json({
                success: false,
                message: "Borrowing request not found"
            });
        }

        const resource = await Resource.findById(
            borrowing.resourceId
        );

        if (!resource) {
            return res.status(404).json({
                success: false,
                message: "Associated resource not found"
            });
        }

        const isOwner =
            resource.ownerId.toString() === req.user._id.toString();

        const isBorrower =
            borrowing.borrowerId.toString() === req.user._id.toString();

if (meetingDetails !== undefined) {
    if (!isOwner) {
        return res.status(403).json({
            success: false,
            message: "Only the resource owner can update meeting details"
        });
    }

    borrowing.meetingDetails = meetingDetails;
}

        if (status === "Cancelled") {
            if (!isBorrower || borrowing.status !== "Pending") {
                return res.status(403).json({
                    success: false,
                    message: "Only the requester can cancel a pending request"
                });
            }

            borrowing.status = "Cancelled";
        } else if (status === "Approved" || status === "Rejected") {
            if (!isOwner) {
                return res.status(403).json({
                    success: false,
                    message: "Only the resource owner can decide this request"
                });
            }

            if (borrowing.status !== "Pending") {
                return res.status(400).json({
                    success: false,
                    message: "Only pending requests can be approved or rejected"
                });
            }

            if (status === "Approved") {
                if (resource.status !== "Available") {
                    return res.status(400).json({
                        success: false,
                        message: "Resource is no longer available"
                    });
                }

                borrowing.status = "Approved";
                borrowing.approvedReturnDate =
                    borrowing.requestedReturnDate;

                resource.status = "Lent";
                resource.availableFrom =
                    borrowing.requestedReturnDate;

                await resource.save();
            } else {
                borrowing.status = "Rejected";
            }

        } else if (status === "Returned") {
            if (!isOwner) {
                return res.status(403).json({
                    success: false,
                    message: "Only the owner can confirm the return"
                });
            }

            if (borrowing.status !== "Approved") {
                return res.status(400).json({
                    success: false,
                    message: "Only approved borrowings can be returned"
                });
            }

            borrowing.status = "Returned";
            resource.status = "Available";
            resource.availableFrom = null;

            await resource.save();

        } else if (status !== undefined) {
            return res.status(400).json({
                success: false,
                message: "Invalid borrowing status"
            });
        }

        await borrowing.save();

        res.status(200).json({
            success: true,
            message: "Borrowing updated successfully",
            borrowing,
            resourceStatus: resource.status
        });

    } catch (error) {
        console.error("Update borrowing error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update borrowing"
        });
    }
};

// DELETE / CANCEL PENDING REQUEST
const deleteBorrowing = async (req, res) => {
    try {
        const borrowing = await Borrowing.findById(req.params.id);

        if (!borrowing) {
            return res.status(404).json({
                success: false,
                message: "Borrowing request not found"
            });
        }

        if (
            borrowing.borrowerId.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "You can only delete your own request"
            });
        }

        if (borrowing.status !== "Pending") {
            return res.status(400).json({
                success: false,
                message: "Only pending requests can be deleted"
            });
        }

        await borrowing.deleteOne();

        res.status(200).json({
            success: true,
            message: "Borrowing request deleted"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete borrowing request"
        });
    }
};

module.exports = {
    createBorrowing,
    getBorrowingById,
    getMyBorrowings,
    getOwnerRequests,
    updateBorrowing,
    deleteBorrowing
};