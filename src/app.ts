import express, { Request, Response, NextFunction } from "express";
import http from "node:http";
import cors from "cors";
import { AppDataSource } from "./data-source";
import authRoutes from "./routes/auth.routes";
import dotenv from "dotenv";
import path from "node:path";
import logger from "morgan";
import cookieParser from "cookie-parser";
import createError from "http-errors";
import googleAuthRouter from './routes/googleAuth.routes'
import translationRouter from './routes/translation.routes';


const app = express();
const server = http.createServer(app);

dotenv.config();

const corsOptions = {
  origin: 'http://localhost:5173',  
  methods: ['GET', 'POST','DELETE','PUT'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(logger("dev"));

// Body parsers
app.use(
  express.json({
    verify: (req: Request, res: Response, buf: Buffer) => {
      (req as any).rawBody = buf.toString();
    },
  })
);

app.use(express.urlencoded({ extended: false }));

// Serve static files (e.g., for frontend)
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));


app.use("/auth", authRoutes);
app.use('/auth', googleAuthRouter);
app.use('/translate', translationRouter);

// Catch 404 errors
app.use(function (req, res, next) {
  next(createError(404));
});


app.use(function (err: any, req: Request, res: Response, next: any) {
  console.error(err);
  res.status(err.status || 500);
  res.json({ message: err.message });
});

// Initialize database connection and start the server
AppDataSource.initialize()
  .then(() => {
    console.log("Database connected");
    server.listen(process.env.PORT || 5000, () =>
      console.log("Server running on port", process.env.PORT || 5000)
    );
  })
  .catch((err) => {
    console.error("Database connection failed", err);
  });
