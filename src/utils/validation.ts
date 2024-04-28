import Joi from 'joi';

const userValidationSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  picture: Joi.string().required(),
  password: Joi.string().required(),
});

const signInValidationSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(5).required(),
  });

export { userValidationSchema, signInValidationSchema };
