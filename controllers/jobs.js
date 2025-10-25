const Job = require("../models/Job");

// All jobs
exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ createdBy: req.user._id });
    res.render("jobs", { jobs });
  } catch (err) {
    res.status(500).render("error", { message: err.message });
  }
};

// new job form
exports.getNewJobForm = (req, res) => {
  res.render("job-form", { job: {}, action: "/jobs", buttonText: "Create Job",_csrf: req.csrfToken(), });
};

// Create new job
exports.createJob = async (req, res) => {
  try {
    await Job.create({
      company: req.body.company,
      position: req.body.position,
      status: req.body.status,
      createdBy: req.user._id,
    });
    res.redirect("/jobs");
  } catch (err) {
    res.status(500).render("error", { message: err.message });
  }
};

// update job form
exports.getEditJobForm = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!job) {
      return res.status(404).render("error", { message: "Job not found" });
    }
    res.render("job-form", {
      job,
      action: `/jobs/update/${job._id}`,
      buttonText: "Update Job",
      _csrf: req.csrfToken(),
    });
  } catch (err) {
    res.status(500).render("error", { message: err.message });
  }
};

// Update job
exports.updateJob = async (req, res) => {
  try {
    await Job.updateOne(
      { _id: req.params.id, createdBy: req.user._id },
      {
        company: req.body.company,
        position: req.body.position,
        status: req.body.status,
      }
    );
    res.redirect("/jobs");
  } catch (err) {
    res.status(500).render("error", { message: err.message });
  }
};

// delete job
exports.deleteJob = async (req, res) => {
  try {
    await Job.deleteOne({ _id: req.params.id, createdBy: req.user._id });
    res.redirect("/jobs");
  } catch (err) {
    res.status(500).render("error", { message: err.message });
  }
};

