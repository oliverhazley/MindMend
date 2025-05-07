export const authorizeSelf = (req, res, next) => {
  if (req.user && req.user.id && req.params.userId) {
    if (req.user.id.toString() === req.params.userId.toString()) {
      return next(); // User is authorized, proceed to the next handler
    }
  }
  return res
    .status(403)
    .json({message: 'Forbidden: You can only access your own data.'});
};
