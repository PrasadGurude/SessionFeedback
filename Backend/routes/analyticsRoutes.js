const express = require("express")
const { PrismaClient } = require("@prisma/client")
const { authenticateToken } = require("../middleware/authMiddleware")

const router = express.Router()
const prisma = new PrismaClient()


// GET /sessions/:sessionId/questions
router.get("/sessions/:sessionId/questions", authenticateToken, async (req, res) => {
  const { sessionId } = req.params
  const adminId = req.adminId

  try {
    // Step 1: Validate session ownership
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { admin: true }
    })

    if (!session) return res.status(404).json({ message: "Session not found" })

    if (session.admin.id !== adminId) {
      return res.status(403).json({ message: "Unauthorized access to session" })
    }

    // Step 2: Fetch questions with answers
    const questions = await prisma.question.findMany({
      where: { sessionId },
      include: { answers: true },
      orderBy: { id: "asc" }
    })

    const result = questions.map((question) => {
      const answers = question.answers
      const data = {
        questionId: question.id,
        text: question.text,
        type: question.type,
        totalAnswers: answers.length,
        analysis: {}
      }

      switch (question.type) {
        case "YES_NO": {
          const yes = answers.filter(a => a.selectedOption === true).length
          const no = answers.filter(a => a.selectedOption === false).length
          const unanswered = answers.length - yes - no
          data.analysis = { yes, no, unanswered }
          break
        }

        case "RATING": {
          const ratings = answers.map(a => a.rating).filter(r => typeof r === "number")
          const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
          ratings.forEach(r => {
            if (counts[r] !== undefined) counts[r]++
          })
          data.analysis = {
            average: ratings.length > 0 ? (ratings.reduce((a, b) => a + b) / ratings.length).toFixed(2) : null,
            min: ratings.length > 0 ? Math.min(...ratings) : null,
            max: ratings.length > 0 ? Math.max(...ratings) : null,
            distribution: counts
          }
          break
        }

        case "TEXT": {
          const texts = answers.map(a => a.responseText).filter(t => t && t.trim() !== "")
          data.analysis = {
            count: texts.length,
            responses: texts
          }
          break
        }

        default:
          data.analysis = { message: "Unsupported question type" }
      }

      return data
    })

    res.status(200).json({
      sessionId,
      sessionTitle: session.title,
      questionCount: result.length,
      questions: result
    })
  } catch (err) {
    console.error("Error fetching questions:", err)
    res.status(500).json({ message: "Internal server error", error: err.message })
  }
})

module.exports = router