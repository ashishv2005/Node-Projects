// middleware/role.js

const permit =
  (...allowed) =>
  (req, res, next) => {
    const { role } = req.user || {};
    if (!role || !allowed.includes(role))
      return res.status(403).json({ error: "Forbidden" });
    next();
  };

export default permit;
