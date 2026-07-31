import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authenticate, validate } from '../../middleware';
import { registerSchema, loginSchema, changePasswordSchema } from './auth.schema';

const router = Router();

router.post('/register', validate(registerSchema), AuthController.register);
router.post('/login', validate(loginSchema), AuthController.login);
router.get('/me', authenticate, AuthController.me);
router.post('/change-password', authenticate, validate(changePasswordSchema), AuthController.changePassword);

export default router;
