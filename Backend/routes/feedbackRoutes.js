const express = require("express")
const { PrismaClient } = require("@prisma/client")
const { authenticateToken } = require("../middleware/authMiddleware")

const router = express.Router()
const prisma = new PrismaClient()
// Get all feedbacks for a session (Admin Protected)
router.get("/:sessionId", authenticateToken, async (req, res) => {
  const { sessionId } = req.params;
  try {
    // Find all feedback responses for the session, including answers and question info
    const feedbacks = await prisma.feedbackResponse.findMany({
      where: { sessionId },
      include: {
        answers: {
          include: {
            question: true
          }
        }
      }
    });
    res.status(200).json(feedbacks);
  } catch (error) {
    console.error("Error fetching feedbacks for session:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Submit Feedback for a Session (Public)
router.post("/:sessionId", async (req, res) => {
  const { sessionId } = req.params
  const { answers } = req.body // answers is an array of { questionId: string, value: any }

  if (!Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({ message: "Answers array is required and cannot be empty" })
  }

  try {
    // 1. Verify session exists and fetch its questions
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { questions: true },
    })

    if (!session) {
      return res.status(404).json({ message: "Session not found" })
    }

    const sessionQuestions = session.questions

    // 2. Validate submitted answers against session questions
    for (const question of sessionQuestions) {
      const submittedAnswer = answers.find((a) => a.questionId === question.id)

      if (question.isRequired && !submittedAnswer) {
        return res.status(400).json({ message: `Required question '${question.text}' was not answered.` })
      }

      if (submittedAnswer) {
        // Validate answer type based on question type
        switch (question.type) {
          case "YES_NO":
            if (typeof submittedAnswer.value !== "boolean") {
              return res.status(400).json({
                message: `Answer for question '${question.text}' (ID: ${question.id}) must be a boolean for YES_NO type.`,
              })
            }
            break
          case "RATING":
            const rating = Number(submittedAnswer.value)
            if (isNaN(rating) || !Number.isInteger(rating)) {
              return res.status(400).json({
                message: `Answer for question '${question.text}' (ID: ${question.id}) must be an integer for RATING type.`,
              })
            }
            break
          case "TEXT":
            if (typeof submittedAnswer.value !== "string") {
              return res.status(400).json({
                message: `Answer for question '${question.text}' (ID: ${question.id}) must be a string for TEXT type.`,
              })
            }
            break
        }
      }
    }

    // 3. Create FeedbackResponse and associated Answers in a transaction
    const feedbackResponse = await prisma.$transaction(async (tx) => {
      const newFeedbackResponse = await tx.feedbackResponse.create({
        data: {
          sessionId: sessionId,
        },
      })

      const answerCreations = answers.map((answer) => {
        const question = sessionQuestions.find((q) => q.id === answer.questionId)
        if (!question) {
          // This case should ideally be caught by initial validation, but as a safeguard
          throw new Error(`Question with ID ${answer.questionId} not found in session.`)
        }

        const answerData = {
          questionId: answer.questionId,
          feedbackId: newFeedbackResponse.id,
        }

        // Map value to correct field based on question type
        switch (question.type) {
          case "YES_NO":
            answerData.selectedOption = answer.value
            break
          case "RATING":
            answerData.rating = Number(answer.value) // Save as integer
            break
          case "TEXT":
            answerData.responseText = String(answer.value)
            break
          default:
            // Should not happen if question types are validated
            throw new Error(`Unsupported question type: ${question.type}`)
        }
        return tx.answer.create({ data: answerData })
      })

      await Promise.all(answerCreations)

      return newFeedbackResponse
    })

    res.status(201).json({ message: "Feedback submitted successfully", feedbackResponseId: feedbackResponse.id })
  } catch (error) {
    console.error("Error submitting feedback:", error)
    res.status(500).json({ message: "Internal server error", error: error.message })
  }
})

module.exports = router
