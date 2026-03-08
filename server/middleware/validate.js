/**
 * Factory that returns an Express middleware which validates req.body
 * against the given Joi schema.  On failure it short-circuits with 400.
 *
 * Usage:
 *   router.post('/register', validate(registerSchema), register)
 */
export function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,   // collect ALL errors, not just the first
      stripUnknown: true,  // drop any fields not in the schema
    })

    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(d => d.message),
      })
    }

    req.body = value // use the sanitised/coerced value downstream
    next()
  }
}