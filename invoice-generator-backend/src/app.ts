import express, { Express, Request, Response, NextFunction } from "express";
import { logger } from "./config/logger";
import { validateSignupRequest } from "./middleware/requestValidator";
import { addRequestId } from "./middleware/addRequestId";
import { signupUser, generateJwt } from "./service/userService";
import { User } from "./types/user";
import { invoiceJsonRequest } from "./types/invoiceJsonRequest";
import { createInvoice } from "./service/invoiceGeneratorService";
import multer from "multer";
import csvParser from "csv-parser";
import { Readable } from "stream";
import { invoiceItem } from "./types/invoiceItem";
import { authenticate } from "./middleware/requestValidator";
import { FileModelTypegoose } from "./repository/fileModelTypegoose";
import { join } from "path";
import cors from 'cors';

const app: Express = express();
const port = 4000;

import { connectDB } from "./config/typegoose";
connectDB();

app.use(express.json());
app.use(cors());

app.get("/", (req: Request, res: Response) => {
  res.send("Healthy");
});

app.post(
  "/signup",
  addRequestId,
  validateSignupRequest,
  async (req: Request, res: Response) => {
    const { username, email, password, role } = req.body;

    const createdUser = await signupUser(username, email, password, role);
    if (!createdUser) {
      res.send("Account Not created. Email already exists");
      return;
    }

    res.send("Account created successfully");
  }
);

app.post(
  "/login",
  addRequestId,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const jwtKey = await generateJwt(email, password);
      res.status(200).send(jwtKey);
    } catch (error) {
      return res.status(401).json({ error: "Authentication failed" });
    }
  }
);

interface CustomRequest extends Request {
  user?: User; // Change 'any' to the type you expect for the user property
}

app.post(
  "/createInvoiceJson",
  addRequestId,
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
      const invoiceJsonRequest: invoiceJsonRequest = req.body;
      const userEmail = "abcd@gmail.com";
      console.log("invoice request is ",JSON.stringify(invoiceJsonRequest))

      var data = await createInvoice(invoiceJsonRequest, userEmail!);
      res.contentType("application/pdf");
      res.status(200).send(data);
    } catch (error) {
      console.log("error is ",error)
      return res.status(500).send();
    }
  }
);

const storage = multer.memoryStorage();
const maxFileSize = 2 * 1024 * 1024;
const upload = multer({
  storage: storage,
  limits: { fileSize: maxFileSize },
  fileFilter: (req, file, callback) => {
    const filetypes = /csv/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(file.originalname.toLowerCase());

    if (mimetype && extname) {
      return callback(null, true);
    }

    callback(
      new Error("Error: File upload only supports the following filetypes - ")
    );
  },
});

app.post(
  "/createInvoiceCsv",
  upload.single("csvFile"),
  addRequestId,
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return res.status(400).send("No file uploaded.");
      }
      let invoiceItems: invoiceItem[] = [];
      const gstNumber: string = req.headers.gst as string;
      const heading = req.headers.heading as string;
      const fileStream = Readable.from(req.file.buffer);
      fileStream
        .pipe(csvParser({ headers: false }))
        .on("data", (row) => {
          const invoiceItem = {
            name: row[0],
            price: row[1],
          };
          console.log("invoice item is ", invoiceItem);
          invoiceItems.push(invoiceItem);
        })
        .on("end", () => {});
      const userEmail = "abcd@gmail.com";
      const invoiceJsonRequest: invoiceJsonRequest = {
        heading: heading,
        gstNumber: gstNumber,
        itemList: invoiceItems,
      };

      var data = await createInvoice(invoiceJsonRequest, userEmail!);
      res.contentType("application/pdf");
      res.send(data);
    } catch (error) {
      console.log("error", error);
      return res.status(500).send();
    }
  }
);

app.get(
  "/getLast5Documents",
  authenticate,
  addRequestId,
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
      const userEmail = req.user?.email;

      const last5Documents = await FileModelTypegoose.find({
        userEmailId: userEmail,
      })
        .sort({ createdAt: -1 })
        .limit(5);

      const documentInfo = last5Documents.map((doc) => ({
        fileId: doc.fileId,
        fileName: doc.fileName,
      }));

      res.send(documentInfo);
    } catch (error) {
      res.status(500).send("Internal Error");
    }
  }
);

app.get(
  "/downloadDocumentById",
  authenticate,
  addRequestId,
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const userEmail = req.user?.email as string;
    const filename = req.query.fileName as string;
    const path = join(process.cwd(), "tmp", userEmail, filename.concat(".pdf"));

    res.download(path, (err) => {
      if (err) {
        console.error("Error downloading file:", err);
        res.status(500).send("Internal Server Error");
      }
    });
  }
);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
