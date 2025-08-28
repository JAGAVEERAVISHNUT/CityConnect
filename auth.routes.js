import { Router } from 'express';
import * as authController from './auth.controller.js';
import { validate } from '../../middleware/validate.js';
import { registerSchema } from './auth.validation.js';

const router = Router();

router.post('/register', validate(registerSchema), authController.register);

export default router;