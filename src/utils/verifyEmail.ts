import axios from "axios";

export const verifyEmail = async (email: string): Promise<boolean> => {
  const API_KEY = process.env.HUNTER_IO_API; // Replace with your actual API key
  try {
    const response = await axios.get(`https://api.hunter.io/v2/email-verifier?email=${email}&api_key=${API_KEY}`);
    const verificationResult = response.data.data.result;
    // "deliverable" means the email is valid and exists
    return verificationResult === 'deliverable';
  } catch (error) {
    console.error("Error verifying email:", error);
    return false;
  }
};