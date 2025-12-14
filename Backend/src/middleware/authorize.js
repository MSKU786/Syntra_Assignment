const authorzie = (...allowedRoles) => {
  return (res, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: 'Authentication Required',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'Acess Dened. Insufficient Permission',
      });
    }

    next();
  };
};

module.exports = authorzie;
