import express from 'express';
import googleLogin from '../controller/googleAuth.controller';
import googleController from '../controller/googleAuth.controller';
const router = express.Router();

router.get('/google',googleController.googleLogin)


export default router;






