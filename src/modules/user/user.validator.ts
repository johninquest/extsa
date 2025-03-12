import Joi from 'joi';

export const userSchema = Joi.object({
  id: Joi.string().length(21).optional(),
  firebaseUid: Joi.string().required(),
  email: Joi.string().email().required(),
  displayName: Joi.string().optional().allow(null),
  photoURL: Joi.string().uri().optional().allow(null),
  provider: Joi.string().optional().allow(null),
  role: Joi.string().valid('admin', 'user').default('admin'),
  lastLogin: Joi.date().optional().allow(null),
}); 

export const validateUser = (user: any) => {
    return userSchema.validate(user, { abortEarly: false });
  };