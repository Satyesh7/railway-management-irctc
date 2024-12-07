const adminMiddleware = async (req, res, next) => {
    const apiKey = req.header('X-API-KEY');
  
    if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
      return res.status(403).json({ error: 'Admin access denied' });
    }
  
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
  
    next();
  };
  
  module.exports = adminMiddleware;