const express = require("express")
const { PrismaClient } = require("@prisma/client")
const { authenticateToken } = require("../middleware/authMiddleware")

const router = express.Router()
const prisma = new PrismaClient()

// Admin protected routes

// Add one or multiple questions to a session
router.post("/:sessionId", authenticateToken, async (req, res) => {
  const { sessionId } = req.params;
  const adminId = req.adminId; // From authMiddleware
  let questions = req.body.questions || req.body;

  // Support both single and multiple question(s)
  if (!Array.isArray(questions)) {
    questions = [questions];
  }

  const validTypes = ["TEXT", "YES_NO", "RATING"];

  try {
    // Verify that the session exists and belongs to the admin
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }
    if (session.adminId !== adminId) {
      return res.status(403).json({ message: "Unauthorized: You can only add questions to your own sessions" });
    }

    // Validate all questions
    for (const q of questions) {
      if (!q.text || !q.type) {
        return res.status(400).json({ message: "Each question must have text and type" });
      }
      if (!validTypes.includes(q.type.toUpperCase())) {
        return res.status(400).json({ message: `Invalid question type. Must be one of: ${validTypes.join(", ")}` });
      }
    }

    // Bulk create questions
    const createdQuestions = await prisma.$transaction(
      questions.map(q =>
        prisma.question.create({
          data: {
            text: q.text,
            type: q.type.toUpperCase(),
            isRequired: q.isRequired !== undefined ? q.isRequired : true,
            sessionId,
          },
        })
      )
    );
    res.status(201).json({ message: "Questions added successfully", questions: createdQuestions });
  } catch (error) {
    console.error("Error adding questions:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/:questionId", authenticateToken, async (req, res) => {
  const { questionId } = req.params
  const adminId = req.adminId // From authMiddleware

  try {
    // Find the question and its associated session to check admin ownership
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        session: true,
      },
    })

    if (!question) {
      return res.status(404).json({ message: "Question not found" })
    }

    if (question.session.adminId !== adminId) {
      return res.status(403).json({ message: "Unauthorized: You can only remove questions from your own sessions" })
    }

    // Delete associated answers first due to foreign key constraints
    await prisma.answer.deleteMany({
      where: { questionId: questionId },
    })

    await prisma.question.delete({
      where: { id: questionId },
    })

    res.status(200).json({ message: "Question removed successfully" })
  } catch (error) {
    console.error("Error removing question:", error)
    res.status(500).json({ message: "Internal server error" })
  }
}) // Remove a question

// Public routes (or can be protected if only admins should see questions)
router.get("/:sessionId", async (req, res) => {
  const { sessionId } = req.params;
  try {
    // Fetch questions and include options if any (future-proof for option model)
    const questions = await prisma.question.findMany({
      where: { sessionId },
      // No orderBy, since 'createdAt' does not exist on Question
      // If you add an Option model, add: include: { options: true }
    });

    if (questions.length === 0) {
      return res.status(404).json({ message: "No questions found for this session or session does not exist" });
    }

    // For YES_NO and RATING, add options in the response
    const questionsWithOptions = questions.map(q => {
      let options = undefined;
      if (q.type === "YES_NO") {
        options = ["Yes", "No"];
      } else if (q.type === "RATING") {
        options = [1, 2, 3, 4, 5]; // Example: 1-5 rating
      }
      return { ...q, options };
    });

    res.status(200).json(questionsWithOptions);
  } catch (error) {
    console.error("Error fetching questions by session:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router
