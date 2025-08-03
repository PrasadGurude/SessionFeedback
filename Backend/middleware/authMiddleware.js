const jwt = require("jsonwebtoken")

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1] // Bearer TOKEN

  if (token == null) {
    return res.status(401).json({ message: "Authentication token required" })
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, admin) => {
    if (err) {
      console.error("JWT verification error:", err)
      return res.status(403).json({ message: "Invalid or expired token" })
    }
    req.adminId = admin.id // Attach admin ID to request
    next()
  })
}

module.exports = { authenticateToken }
