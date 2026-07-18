require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");
const revisionRoutes = require("./routes/revisionRoutes");
const progressRoutes = require("./routes/progressRoutes");
const rescheduleRoutes = require("./routes/rescheduleRoutes");

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(",") : "*",
  })
);
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({ message: "StudySync API is running" });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/revisions", revisionRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/reschedule", rescheduleRoutes);

// Error handling (must be last)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`StudySync server running on port ${PORT}`);
});
