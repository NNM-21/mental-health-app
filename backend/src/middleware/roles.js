// roles.js — Role-Based Access Control (RBAC) middleware.
// This is a "middleware factory": it's a function that RETURNS a middleware
// function, pre-configured with the list of roles allowed for that route.
//
// Usage on a route:
//   router.delete('/posts/:id', authenticate, requireRole('moderator', 'admin'), deletePost)
//
// This MUST run after authenticate() — it depends on req.user already
// being set by the JWT check.

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      // Shouldn't happen if authenticate() ran first, but guard anyway.
      return res.status(401).json({ error: 'Not authenticated.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. This action requires one of: ${allowedRoles.join(', ')}.`,
      });
    }

    next();
  };
}

module.exports = requireRole;
