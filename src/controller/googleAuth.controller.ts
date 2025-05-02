import axios from 'axios';
import oauth2client from '../utils/googleConfig';
import { Request, Response } from 'express';
import UserService from '../service/user.service';
import { UserRole } from '../enums/userRole.enum';
// src/controller/googleAuth.controller.ts
export default class googleController {
    static googleLogin = async (req: Request, res: Response): Promise<any> => {
        try {
            const { code } = req.query;
            if (!code) {
                return res.status(400).json({ message: 'Authorization code is required' });
            }
    
            const googleRes = await oauth2client.getToken(code as string);
            oauth2client.setCredentials(googleRes.tokens);
    
            const userRes = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`);
            console.log('Google user data:', userRes.data);
    
            const { email, given_name, family_name, id, picture } = userRes.data;
            const fullName = given_name + " " + family_name;
    
            // Check if user exists
            const existingUser = await UserService.findByEmail(email);
            console.log('Existing user:', existingUser);
    
            if (existingUser) {
                try {
                    // If user exists, log them in
                    console.log('Attempting login with:', { email, password: id });
                    const tokens = await UserService.login({
                        email: email,
                        password: id,
                        remember_me: false
                    });
                    console.log('Generated tokens:', tokens);
    
                    if (!tokens?.accessToken) {
                        throw new Error('No access token generated');
                    }
    
                    res.cookie('accessToken', tokens.accessToken, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === "production",
                        maxAge: 30 * 60 * 1000, // 30 minutes
                    });
    
                    res.cookie("refreshToken", tokens.refreshToken, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === "production",
                        maxAge: 24 * 60 * 60 * 1000, // 1 day
                    });
    
                    return res.json({ resultCode: 0 });
                } catch (loginError) {
                    console.error('Login error:', loginError);
                    return res.status(400).json({
                        message: 'Google login failed. Please try again or use regular login.'
                    });
                }
            } else {
                // If user doesn't exist, return Google data for profile completion
                return res.status(200).json({
                    resultCode: 1,
                    message: 'Profile completion required',
                    googleData: {
                        email,
                        full_name: fullName,
                        profile_image: picture,
                        temp_password: id
                    }
                });
            }
        } catch (error) {
            console.error('Google auth error:', error);
            return res.status(500).json({
                message: 'Internal server error'
            });
        }
    }

}