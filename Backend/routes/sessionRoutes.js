const express = require("express")
const { PrismaClient } = require("@prisma/client")
const { authenticateToken } = require("../middleware/authMiddleware")

const router = express.Router()
const prisma = new PrismaClient()

router.get("/admin/:adminId", authenticateToken, async (req, res) => {
  const { adminId } = req.params;
  try {
    const sessions = await prisma.session.findMany({
      where: { adminId },
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: { questions: true, responses: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    res.status(200).json(sessions);
  } catch (error) {
    console.error("Error fetching sessions by adminId:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


// Get Analytics for a Session (Admin Protected)
router.get("/analytics/:sessionId", authenticateToken, async (req, res) => {
  const { sessionId } = req.params;
  const adminId = req.adminId;
  try {
    // Verify session ownership
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { admin: true },
    });
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }
    if (session.admin.id !== adminId) {
      return res.status(403).json({ message: "Unauthorized: You can only view analytics for your own sessions" });
    }

    // Fetch all questions for the session
    const questions = await prisma.question.findMany({
      where: { sessionId },
      orderBy: { createdAt: "asc" },
    });

    // Fetch all feedback responses for the session, including their answers
    const feedbackResponses = await prisma.feedbackResponse.findMany({
      where: { sessionId },
      include: { answers: true },
    });
    const totalResponses = feedbackResponses.length;

    // Build analytics
    const analytics = {
      sessionId: session.id,
      sessionTitle: session.title,
      totalFeedbackResponses: totalResponses,
      questionAnalytics: [],
    };

    for (const question of questions) {
      const questionData = {
        questionId: question.id,
        questionText: question.text,
        questionType: question.type,
        totalAnswers: 0,
        details: {},
      };
      const answersForThisQuestion = feedbackResponses.flatMap((response) =>
        response.answers.filter((answer) => answer.questionId === question.id)
      );
      questionData.totalAnswers = answersForThisQuestion.length;

      if (question.type === "YES_NO") {
        const yesCount = answersForThisQuestion.filter((a) => a.selectedOption === true).length;
        const noCount = answersForThisQuestion.filter((a) => a.selectedOption === false).length;
        questionData.details = {
          yes: yesCount,
          no: noCount,
          unanswered: questionData.totalAnswers - (yesCount + noCount),
        };
      } else if (question.type === "RATING") {
        const ratings = answersForThisQuestion
          .map((a) => a.rating)
          .filter((val) => typeof val === "number" && !isNaN(val));
        const ratingCounts = {};
        for (let i = 1; i <= 5; i++) {
          ratingCounts[i] = ratings.filter((r) => r === i).length;
        }
        questionData.details = {
          distribution: ratingCounts,
          average: ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2) : null,
          count: ratings.length,
        };
      } else if (question.type === "TEXT") {
        const textResponses = answersForThisQuestion
          .map((a) => a.responseText)
          .filter((text) => text && text.trim() !== "");
        questionData.details = {
          responses: textResponses,
          count: textResponses.length,
        };
      } else {
        questionData.details = { message: "Unsupported question type for analytics" };
      }
      analytics.questionAnalytics.push(questionData);
    }
    res.status(200).json(analytics);
  } catch (error) {
    console.error("Error fetching session analytics:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Create Session (Admin Protected)
// Create Session (Admin Protected, with optional questions)
router.post("/", authenticateToken, async (req, res) => {
  const { title, description, date, questions } = req.body;
  const adminId = req.adminId; // From authMiddleware

  if (!title || !description || !date) {
    return res.status(400).json({ message: "Title, description, and date are required" });
  }

  // Validate questions if provided
  let questionsData = [];
  if (questions && Array.isArray(questions)) {
    const validTypes = ["TEXT", "YES_NO", "RATING"];
    for (const q of questions) {
      if (!q.text || !q.type) {
        return res.status(400).json({ message: "Each question must have text and type" });
      }
      if (!validTypes.includes(q.type.toUpperCase())) {
        return res.status(400).json({ message: `Invalid question type: ${q.type}` });
      }
      questionsData.push({
        text: q.text,
        type: q.type.toUpperCase(),
        isRequired: q.isRequired !== undefined ? q.isRequired : true,
      });
    }
  }

  try {
    const session = await prisma.session.create({
      data: {
        title,
        description,
        date: new Date(date),
        adminId,
        questions: questionsData.length > 0 ? { create: questionsData } : undefined,
      },
      include: {
        questions: true,
      },
    });
    res.status(201).json({ message: "Session created successfully", session });
  } catch (error) {
    console.error("Error creating session:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


// Get All Sessions (Admin Protected)
router.get("/", authenticateToken, async (req, res) => {
  try {
    const sessions = await prisma.session.findMany({
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: { questions: true, responses: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })
    res.status(200).json(sessions)
  } catch (error) {
    console.error("Error fetching sessions:", error)
    res.status(500).json({ message: "Internal server error" })
  }
})

// Get Session by ID (Admin Protected)
router.get("/:sessionId", authenticateToken, async (req, res) => {
  const { sessionId } = req.params
  try {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        questions: true, // Include questions associated with the session
        responses: {
          include: {
            answers: {
              include: {
                question: true
              }
            }
          }
        },
      },
    })

    if (!session) {
      return res.status(404).json({ message: "Session not found" })
    }
    res.status(200).json(session)
  } catch (error) {
    console.error("Error fetching session by ID:", error)
    res.status(500).json({ message: "Internal server error" })
  }
})



module.exports = router
