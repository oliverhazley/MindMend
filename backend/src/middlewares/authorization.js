export const authorizeSelf = (req, res, next) => {
  if (req.user && req.user.userId && req.params.userId) {
    // Changed req.user.id to req.user.userId
    if (req.user.userId.toString() === req.params.userId.toString()) {
      // Changed req.user.id to req.user.userId
      return next(); // User is authorized, proceed to the next handler
    }
  }
  return res
    .status(403)
    .json({message: 'Forbidden: You can only access your own data.'});
};
