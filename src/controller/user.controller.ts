// src/controller/user.controller.ts
import { NextFunction, Request, Response } from "express";
import UserService from "../service/user.service";
import { generateTokens, refreshTokens, verifyAccessToken, verifyRefreshToken } from "../utils/crypto.util";
import redisClient from "../config/redis";

export default class UserController {
  // Register User
  static async register(req: Request, res: Response): Promise<any> {
    try {
      // Handle profile image URL
      //`${process.env.SERVER_URL}/uploads/profile_images/${req.file.filename}`
       const {profile_image} = req.body;
       let profileImageUrl;
       if(profile_image){
        profileImageUrl=profile_image
       }
       else{
        profileImageUrl = req.file
        ? `uploads/profile_images/${req.file.filename}`
        : undefined;
       }
       
      // Destructure user input
      const {
        email,
        full_name,
        password,
        confirm_password,
        phone_number,
        role,
        social_link,
        date_of_birth,
        gender,
        country,
        city,
        published_articles,
        thematic_focus_of_articles,
        past_conferences_or_meetings,
        membership_in_scientific_team,
        university,
        academic_degree,
        academic_title,
        profession,
        position,
        level_of_education,
        data_processing_consent
      } = req.body;

      // Basic required field validation (you can expand this)
      if (!email || !full_name || !password || !confirm_password) {
        return res.status(400).json({
          message: "Required fields missing: email, full_name, password, or confirm_password",
          resultCode: 1,
        });
      }
      console.log(password);
      console.log(confirm_password);
      
      
      if (password !== confirm_password) {
        return res.status(400).json({
          message: "Passwords do not match",
          resultCode: 2,
        });
      }

      // Call UserService to register the user
      const result = await UserService.register({
        email,
        profile_image: profileImageUrl,
        full_name,
        password,
        confirm_password,
        phone_number,
        role,
        social_link,
        date_of_birth,
        gender,
        country,
        city,
        published_articles,
        thematic_focus_of_articles,
        past_conferences_or_meetings,
        membership_in_scientific_team,
        university,
        academic_degree,
        academic_title,
        profession,
        position,
        level_of_education,
        data_processing_consent
      });

      // Handle service response
      if (result.status === 201) {
        return res.status(201).json({
          message: result.message,
          resultCode: 0,
        });
      }

      return res.status(result.status).json({
        message: result.message,
        resultCode: result.resultCode ?? 1, // default error code if not provided
      });

    } catch (error) {
      console.error("Register error:", error);

      if (error instanceof Error) {
        return res.status(500).json({
          message: error.message,
          resultCode: 500,
        });
      }

      return res.status(500).json({
        message: "An unknown error occurred",
        resultCode: 500,
      });
    }
  }



  static async login(req: Request, res: Response): Promise<any> {
    const { email, password, remember_me } = req.body;

    try {
      const { accessToken, refreshToken } = await UserService.login({ email, password, remember_me });

      // Set access token (still short-lived)
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 60 * 1000, // 30 minutes
      });

      // Set refresh token with conditional expiry
      const refreshTokenExpiry = remember_me
        ? 30 * 24 * 60 * 60 * 1000  // 30 days
        : 24 * 60 * 60 * 1000;     // 1 day

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: refreshTokenExpiry,
      });

      res.json({ resultCode: 0 });
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  }




  static async activate(req: Request, res: Response, next: NextFunction) {
    try {
      const activationLink = req.params.link;
      await UserService.activate(activationLink);

      if (process.env.CLIENT_URL) {
        return res.redirect(process.env.CLIENT_URL);
      }

    } catch (e) {
      next(e);
    }
  }
  static async refresh(req: Request, res: Response): Promise<any> {
    try {
      const { refreshToken } = req.cookies;
      if (!refreshToken) return res.status(400).send('Refresh token required');

      // Use your helper function
      const newTokens = await refreshTokens(refreshToken);

      if (!newTokens) {
        return res.status(403).send('Invalid or expired refresh token');
      }

      const { accessToken: newAccessToken, refreshToken: newRefreshToken, remember_me, id } = newTokens;

      // Store refresh token in Redis with appropriate expiration
      const redisExpiration = remember_me ? 30 * 24 * 60 * 60 : 24 * 60 * 60; // 30 days or 1 day
      await redisClient.set(`refreshToken:${id}`, newRefreshToken, 'EX', redisExpiration);

      // Set cookies
      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 60 * 1000, // 30 min
      });

      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: remember_me ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000, // 30 days or 1 day
      });

      res.status(200).json({ message: 'Tokens refreshed successfully' });

    } catch (error) {
      console.error('Error refreshing token:', error);
      res.status(500).send('Error refreshing token');
    }
  }


  static authenticate(req: Request, res: Response): void {
    // Retrieve the access token from the cookies (it should have been set earlier in the login process)
    const accessToken = req.cookies.accessToken;
    console.log(accessToken);
    
    if (!accessToken) {

      res.status(401).json({
        resultCode: 1,
        messages: ["Access token is missing or expired"],
      });
      return
    }

    try {
      // Verify the access token (decodes the JWT and retrieves the user data)
      const decoded = verifyAccessToken(accessToken);

      if (!decoded) {
        res.status(401).json({
          resultCode: 1,
          messages: ["Invalid or expired access token"],
        });
        return;
      }

      // Attach the decoded user info to the response
      const {
        id,
        role,
        email,
        full_name,
        is_activated,
        gender,
        phone_number,
        profile_image,
        social_link,
        date_of_birth,
        country,
        city,
        published_articles,
        thematic_focus_of_articles,
        past_conferences_or_meetings,
        membership_in_scientific_team,
        university,
        academic_degree,
        academic_title,
        profession,
        position,
        level_of_education,
        data_processing_consent
      } = decoded;

      res.status(200).json({
        resultCode: 0,
        data: {
          id, role, email, full_name,
          is_activated,
          gender,
          phone_number,
          profile_image,
          social_link,
          date_of_birth,
          country,
          city,
          published_articles,
          thematic_focus_of_articles,
          past_conferences_or_meetings,
          membership_in_scientific_team,
          university,
          academic_degree,
          academic_title,
          profession,
          position,
          level_of_education,
          data_processing_consent,
           message: "Authenticated"
        },
      });
      return;
    } catch (error) {
      console.error("Error verifying token:", error);
      res.status(500).json({
        resultCode: 1,
        messages: ["Error verifying the access token"],
      });
      return;
    }
  }

  // // Logout User
  static async logout(req: Request, res: Response): Promise<any> {
    const accessToken = req.cookies.accessToken; // Get access token from cookie

    if (!accessToken) {
      return res.status(400).send("Access token is required for logout");
    }

    try {
      const decoded = verifyAccessToken(accessToken); // Verify access token
      if (!decoded) {
        return res.status(401).send("Invalid or expired access token");
      }

      // Delete refresh token from Redis using user ID
      await redisClient.del(`refreshToken:${decoded.id}`);

      // Clear access token cookie
      res.clearCookie("accessToken", { httpOnly: true, secure: true, sameSite: "strict" });
      res.clearCookie("refreshToken", { httpOnly: true, secure: true, sameSite: "strict" });

      return res.status(200).json({ message: "Logged out successfully", resultCode: 0 });
    } catch (error) {
      console.error("Logout error:", error);
      return res.status(500).send("Logout failed");
    }
  }

  static async forgotPassword(req: Request, res: Response) {
    const { email } = req.body;

    try {
      await UserService.forgotPassword(email); // Sends verification code to email
      res.status(200).json({ message: "Verification code sent to your email", resultCode: 0 });
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "An unknown error occurred" });
    }
  }

  static async verifyCode(req: Request, res: Response) {
    const { email, verificationCode } = req.body;

    try {
      await UserService.verifyCode(email, verificationCode); // Verifies the code
      res.status(200).json({ message: "Code verified successfully", resultCode: 0 });
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid verification code or expired" });
    }
  }

  static async resetPassword(req: Request, res: Response) {
    const { resetToken, newPassword } = req.body;

    try {
      await UserService.resetPassword(resetToken, newPassword); // Resets the password
      res.status(200).json({ message: "Password reset successful", resultCode: 0 });
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "An unknown error occurred" });
    }
  }



}
