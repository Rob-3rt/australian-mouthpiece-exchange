const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = async (req, res, next) => {
  if (!req.user || !req.user.userId) {
    return res.status(401).json({ error: 'Not authenticated.' });
  }
  const user = await prisma.user.findUnique({ where: { user_id: req.user.userId } });
  if (!user || !user.is_admin) {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  next();
}; 