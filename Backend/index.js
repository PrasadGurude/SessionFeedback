require("dotenv").config()
const express = require("express")
const { PrismaClient } = require("@prisma/client")
const cors = require("cors")

const authRoutes = require("./routes/authRoutes")
const sessionRoutes = require("./routes/sessionRoutes")
const questionRoutes = require("./routes/questionRoutes")
const analyticsRoutes = require("./routes/analyticsRoutes")
const feedbackRoutes = require("./routes/feedbackRoutes")
const contactRoutes = require("./routes/contactRoute") // Import contact routes


const prisma = new PrismaClient()
const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(express.json())
app.use(cors())

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/sessions", sessionRoutes)
app.use("/api/questions", questionRoutes)
app.use("/api/analytics", analyticsRoutes)
app.use("/api/feedback", feedbackRoutes)
app.use("/api/contact", contactRoutes) // Contact routes

// Basic health check
app.get("/", (req, res) => {
  res.send("Feedback Backend API is running!")
})

// Error handling middleware (optional, but good practice)
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send("Something broke!")
})

async function main() {
  try {
    await prisma.$connect()
    console.log("Connected to PostgreSQL database via Prisma!")
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  } catch (e) {
    console.error("Failed to connect to database or start server:", e)
    process.exit(1)
  }
}

main()

// Graceful shutdown
process.on("beforeExit", async () => {
  await prisma.$disconnect()
})
