module.exports = {
  requireLogin: (req, res, next) => {
    if (!req.session.userId) {
      if (req.xhr || req.headers.accept.indexOf('json') > -1) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      return res.redirect('/login');
    }
    next();
  }
};
