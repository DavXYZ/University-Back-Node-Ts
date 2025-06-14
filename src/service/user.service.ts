//src/service/user.service.ts

import { AppDataSource } from "../data-source";
import User from "../entities/user.entity";
import { generateTokens } from "../utils/crypto.util";
import { hashPassword, comparePassword } from "../utils/password";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from 'uuid';
import mailService from "./mail.service";
import { DeepPartial, MoreThan } from "typeorm";
import redisClient from "../config/redis";
import { Gender } from "../enums/gender.enum";
import { UserRole } from "../enums/userRole.enum";
import { verifyEmail } from "../utils/verifyEmail";


const userRepository = AppDataSource.getRepository(User);

interface UserData {
 email: string;
      full_name: string;
      password: string;
      confirm_password: string;
      phone_number?: string;
      role?: UserRole;
      profile_image?: string;
      social_link?: string;
      date_of_birth?: string;
      gender?: Gender;
      country?: string;
      city?: string;
      published_articles?: string;
      thematic_focus_of_articles?: string;
      past_conferences_or_meetings?: string;
      membership_in_scientific_team?: string;
      university?: string;
      academic_degree?: string;
      academic_title?: string;
      profession?: string;
      position?: string;
      level_of_education?: string;
      data_processing_consent:boolean;
}

export default class UserService {

    static async register(userData: UserData) {
      try {
        const {
          email,
          full_name,
          password,
          confirm_password,
          role,
          gender,
        } = userData;
  
        console.log("Received User Data:", userData);
  
        // Validate required fields
        if (!email || !full_name || !password || !confirm_password) {
          console.warn("Missing required fields:", { email, full_name, password, confirm_password });
          return { status: 400, resultCode: 1, message: "Required fields are missing" };
        }
  
        // Validate email format and existence
        const isRealEmail = await verifyEmail(email);
        if (!isRealEmail) {
          return { status: 400, resultCode: 2, message: "The provided email is not valid or does not exist" };
        }
  
        // Check password confirmation
        if (password !== confirm_password) {
          return { status: 400, resultCode: 3, message: "Passwords do not match" };
        }
  
        // Validate email domain for non-author roles
        if (role && role !== UserRole.AUTHOR) {
          const polytechnicEmailRegex = /^[a-zA-Z0-9._%+-]+@polytechnic\.am$/;
          if (!polytechnicEmailRegex.test(email)) {
            return {
              status: 400,
              resultCode: 4,
              message: "Email must end with @polytechnic.am for non-AUTHOR roles",
            };
          }
        }
  
        // Validate role and gender if provided
        if (!role) {
          return { status: 400, resultCode: 5, message: "Invalid role provided" };
        }
  
        if (!gender ) {
          return { status: 400, resultCode: 6, message: "Invalid gender provided" };
        }
  
        // Check if email already exists
        const existingUser = await userRepository.findOne({ where: { email } });
        if (existingUser) {
          console.warn("User already exists:", email);
          return { status: 400, resultCode: 7, message: "Email already exists" };
        }
  
        // Hash password
        const hashedPassword = await hashPassword(password);
        const activationLink = uuidv4();
        console.log("Generated Activation Link:", activationLink);
  
        // Try to send activation email
        try {
          await mailService.sendActivationMail(
            email,
            `${process.env.API_URL}/auth/activate/${activationLink}`
          );
        } catch (emailError) {
          console.error("Error sending activation email:", emailError);
          return {
            status: 500,
            resultCode: 8,
            message: "Failed to send activation email",
          };
        }
  
        // Prepare data for DB
        const userDataForDB: DeepPartial<User> = {
          email,
          full_name,
          password: hashedPassword,
          activation_link: activationLink,
          is_activated: false,
          role: role || UserRole.AUTHOR,  // Direct assignment
          gender: gender,
          phone_number: userData.phone_number,
          profile_image: userData.profile_image,
          social_link: userData.social_link,
          date_of_birth: userData.date_of_birth,
          country: userData.country,
          city: userData.city,
          published_articles: userData.published_articles,
          thematic_focus_of_articles: userData.thematic_focus_of_articles,
          past_conferences_or_meetings: userData.past_conferences_or_meetings,
          membership_in_scientific_team: userData.membership_in_scientific_team,
          university: userData.university,
          academic_degree: userData.academic_degree,
          academic_title: userData.academic_title,
          profession: userData.profession,
          position: userData.position,
          level_of_education: userData.level_of_education,
          data_processing_consent:userData.data_processing_consent
        };
  
        // Save user
        try {
          const user = userRepository.create(userDataForDB);
          await userRepository.save(user);
          console.log("User registered successfully:", user);
          return { status: 201, resultCode: 0, message: "User registered successfully" };
        } catch (dbError) {
          console.error("Database Save Error:", dbError);
          return { status: 500, resultCode: 9, message: "Error saving user to the database" };
        }
        
  
      } catch (error) {
        console.error("Unexpected Registration Error:", error);
        return {
          status: 500,
          resultCode: 10,
          message: "Internal Server Error",
        };
      }
    }
  



  static async activate(activationLink: string): Promise<void> {
    const user = await userRepository.findOneBy({ activation_link:activationLink });

    if (!user) {
      throw new Error("Неккоректная ссылка активации");
    }

    user.is_activated = true;
    await userRepository.save(user);
  }

  // // Login User
  static async login(userData: { email: string, password: string, remember_me: boolean }) {
    try {
      const { email, password, remember_me } = userData;
      console.log(userData);
      
      if (!email) {
        throw new Error("Email is required");
      }
    
      const user = await userRepository.findOne({ where: { email } });
    
      if (!user) {
        throw new Error("Invalid email or password");
      }
    
      const isPasswordValid = await comparePassword(password, user.password!);
      if (!isPasswordValid) {
        throw new Error("Invalid email or password");
      }
    
      // Update remember_me in DB if it changed
      if (remember_me && !user.remember_me) {
        await userRepository.update(user.id, { remember_me: true });
        user.remember_me = true; // so payload is accurate
      }
    
      const payload = {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        is_activated: false,
        role: user.role,
        gender: user.gender,
        phone_number: user.phone_number,
        profile_image: user.profile_image,
        social_link: user.social_link,
        date_of_birth: user.date_of_birth,
        country: user.country,
        city: user.city,
        published_articles: user.published_articles,
        thematic_focus_of_articles: user.thematic_focus_of_articles,
        past_conferences_or_meetings: user.past_conferences_or_meetings,
        membership_in_scientific_team: user.membership_in_scientific_team,
        university: user.university,
        academic_degree: user.academic_degree,
        academic_title: user.academic_title,
        profession: user.profession,
        position: user.position,
        level_of_education: user.level_of_education,
        data_processing_consent: user.data_processing_consent
      };
    
      const { accessToken, refreshToken } = generateTokens(payload, remember_me);
    
      const redisExpiry = remember_me ? 30 * 24 * 60 * 60 : 24 * 60 * 60; // seconds
      await redisClient.set(`refreshToken:${user.id}`, refreshToken, 'EX', redisExpiry);
    
      return { accessToken, refreshToken };
      
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle specific error types if needed
      if (error instanceof Error) {
        // Re-throw validation/authentication errors
        if (error.message === "Email is required" || 
            error.message === "Invalid email or password") {
          throw error;
        }
      }
      
      // Throw generic error for other cases
      throw new Error("Login failed. Please try again later.");
    }
  }
  

  // // Logout User (Invalidate refresh token)
  static async logout(refreshToken: string) {
    try {
      // Verify the refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!);
      if (!decoded) {
        throw new Error("Invalid or expired refresh token");
      }

      // Extract user ID from token payload
      const userId = (decoded as any).id;

      // Find the user in the database
      const user = await userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new Error("User not found");
      }

      // Find and delete the refresh token from the database

      return { message: "Token invalidated successfully" };
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error("Invalid or expired refresh token");
      }
      throw error;
    }
  }
  static async forgotPassword(email: string): Promise<void> {
    const user = await userRepository.findOne({ where: { email } });

    if (!user) {
      throw new Error("User with this email does not exist");
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit code
    const verificationCodeExpires = new Date(Date.now() + 300000); // Code expires in 5 minutes

    user.verification_code = verificationCode;
    user.verification_code_expires = verificationCodeExpires;
    await userRepository.save(user);

    // Send the verification code to the user's email
    await mailService.sendVerificationCodeMail(email, verificationCode); // Email service to send the code
  }
  static async verifyCode(email: string, verificationCode: string): Promise<void> {
    const user = await userRepository.findOne({ where: { email } });

    if (!user) {
      throw new Error("User with this email does not exist");
    }


    // Check if the code matches and is not expired
    if (
      user.verification_code !== verificationCode ||
      !user.verification_code_expires ||
      user.verification_code_expires < new Date()
    ) {
      throw new Error("Invalid or expired verification code");
    }


    // Clear the verification code after successful verification
    user.verification_code = undefined;
    user.verification_code_expires = undefined;
    const resetToken = uuidv4(); // Generate a unique token
    const resetTokenExpires = new Date(Date.now() + 3600000); // Token valid for 1 hour

    user.reset_password_token = resetToken;
    user.reset_password_expires = resetTokenExpires;
    await userRepository.save(user);

    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
    await mailService.sendResetPasswordMail(email, resetLink);
  }


  static async resetPassword(resetToken: string, newPassword: string): Promise<void> {
    const user = await userRepository.findOne({
      where: { reset_password_token: resetToken, reset_password_expires: MoreThan(new Date()) },
    });

    if (!user) {
      throw new Error("Invalid or expired reset token");
    }

    user.password = await hashPassword(newPassword);
    user.reset_password_token = undefined;
    user.reset_password_expires = undefined;
    await userRepository.save(user);
  }

  static async findByEmail(email: string): Promise<boolean> {
    console.log(email);

    const user = await userRepository.findOne({
      where: { email }
    })
    return user?true:false;
  }

  static async getAuthorByEmail(email:string){
    const user = await userRepository.findOne({
      where:{email,role:UserRole.AUTHOR}
    })
    if(user){
    return {
      email:user.email,
      full_name:user.full_name,
    }
    }

    
  }

}

