module.exports = function requireLogin(req, res, next) {
  if (req.session && req.session.login) {
    return next();
  }
  res.redirect("/login");
};