const express = require("express")
const { PrismaClient } = require("@prisma/client")
const { authenticateToken } = require("../middleware/authMiddleware")

const router = express.Router()
const prisma = new PrismaClient()


//used
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

//used
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

//used
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
