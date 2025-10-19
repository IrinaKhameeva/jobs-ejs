const express = require("express");
const router = express.Router();
const jobsController = require("../controllers/jobs");

// All jobs
router.get("/", jobsController.getAllJobs);

// Job creation form
router.get("/new", jobsController.getNewJobForm);

// Create new job
router.post("/", jobsController.createJob);

// Edit job form
router.get("/edit/:id", jobsController.getEditJobForm);

// Update job
router.post("/update/:id", jobsController.updateJob);

// Delete job
router.post("/delete/:id", jobsController.deleteJob);

module.exports = router;

