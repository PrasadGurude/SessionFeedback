
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


//used
// GET /api/contact/:adminId
router.get('/:adminId', async (req, res) => {
  const { adminId } = req.params;
  try {
    const contacts = await prisma.contacted.findMany({
      where: { adminId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(contacts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//used
// POST /api/contact/:sessionId
router.post('/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  const { name, email, mobile, description } = req.body;

  try {
    // Get the session to find the adminId
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      select: { adminId: true },
    });
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const alreadyContacted = await prisma.contacted.findFirst({
      where: {
        sessionId,
        email,
      },
    });

    if (alreadyContacted) {
      return res.status(400).json({ error: 'You have already contacted us.' });
    }

    // Create the Contacted row
    const contacted = await prisma.contacted.create({
      data: {
        name,
        email,
        mobile,
        description,
        adminId: session.adminId,
        sessionId,
      },
    });

    res.status(201).json(contacted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
