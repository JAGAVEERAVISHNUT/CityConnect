export const validate = (schema) => async (req, res, next) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      const errorMessages = error.errors.map((e) => e.message).join(', ');
      return res.status(400).json({ message: 'Validation error', errors: errorMessages });
    }
  };