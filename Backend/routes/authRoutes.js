const express = require("express")
const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { authenticateToken } = require("../middleware/authMiddleware")

const router = express.Router()
const prisma = new PrismaClient()


//used
// Register Admin
router.post("/register-admin", async (req, res) => {
  const { name, email, password, mobileNumber, bio } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required" })
  }

  try {
    const existingAdmin = await prisma.admin.findUnique({ where: { email } })
    if (existingAdmin) {
      return res.status(409).json({ message: "Admin with this email already exists" })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const admin = await prisma.admin.create({
      data: {
        name,
        email,
        password: hashedPassword,
        mobileNumber,
        bio,
      },
    })

    // Generate token on signup
    const token = jwt.sign({ id: admin.id, email: admin.email }, process.env.JWT_SECRET, { expiresIn: "10h" })

    res.status(201).json({
      message: "Admin registered successfully",
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        bio: admin.bio,
        mobileNumber: admin.mobileNumber
      }
    })
  } catch (error) {
    console.error("Error registering admin:", error)
    res.status(500).json({ message: "Internal server error" })
  }
})

//used
// Login Admin
router.post("/login", async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" })
  }

  try {
    const admin = await prisma.admin.findUnique({ where: { email } })
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password)
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" })
    }  

    const token = jwt.sign({ id: admin.id, email: admin.email }, process.env.JWT_SECRET, { expiresIn: "10h" })

    res.status(200).json({
      message: "Login successful",
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        bio: admin.bio,
        mobileNumber: admin.mobileNumber
      }
    })
  } catch (error) {
    console.error("Error logging in admin:", error)
    res.status(500).json({ message: "Internal server error" })
  }
})

//used
// Change Password
router.put("/change-password", authenticateToken, async (req, res) => {
  const { oldPassword, newPassword } = req.body
  const adminId = req.adminId

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: "Old password and new password are required" })
  }

  try {
    const admin = await prisma.admin.findUnique({ where: { id: adminId } })
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" }) // Should not happen if token is valid
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, admin.password)
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid old password" })
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10)

    await prisma.admin.update({
      where: { id: adminId },
      data: { password: hashedNewPassword },
    })

    res.status(200).json({ message: "Password changed successfully" })
  } catch (error) {
    console.error("Error changing password:", error)
    res.status(500).json({ message: "Internal server error" })
  }
})


//used
// Get Admin Profile
router.get("/profile", authenticateToken, async (req, res) => {
  const adminId = req.adminId

  try {
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        name: true,
        email: true,
        mobileNumber: true,
        bio: true,
      },
    })

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" })
    }

    res.status(200).json(admin)
  } catch (error) {
    console.error("Error fetching admin profile:", error)
    res.status(500).json({ message: "Internal server error" })
  }
})

//used
// Update Admin Profile
router.put("/profile", authenticateToken, async (req, res) => {
  const adminId = req.adminId 
  const { name, email, mobileNumber, bio } = req.body
  if (!name || !email) {
    return res.status(400).json({ message: "Name and email are required" })
  }
  try {
    const updatedAdmin = await prisma.admin.update({
      where: { id: adminId },
      data: {
        name,
        email,
        mobileNumber,
        bio,
      },
      select: {
        id: true,
        name: true,
        email: true,
        mobileNumber: true,
        bio: true,
      },
    })

    res.status(200).json(updatedAdmin)
  } catch (error) {
    console.error("Error updating admin profile:", error)
    res.status(500).json({ message: "Internal server error" })
  }
})

module.exports = router
