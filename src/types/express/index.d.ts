// src/types/express/index.d.ts
import { User } from "../entities/user.entity"; // import your User entity

declare global {
  namespace Express {
    interface Request {
      user?: User; // Define user as an optional property
    }
  }
}
