import express from 'express';
import { signIn, signUp, signOut, refreshToken } from '../controllers/user.js';

const router = express.Router();

router.post('/signin', signIn);
router.post('/signup', signUp);
router.delete('/signout', signOut);
router.post('/token', refreshToken);

export default router;
