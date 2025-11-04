const roleAuth = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Access denied. No user authenticated.' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: `Access denied. Role '${req.user.role}' not authorized.` });
    }
    
    next();
  };
};

module.exports = roleAuth;