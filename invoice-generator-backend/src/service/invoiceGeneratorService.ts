import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { writeFileSync, existsSync, mkdirSync, readFileSync } from "fs";
import { join } from "path";
import { invoiceJsonRequest } from "../types/invoiceJsonRequest";
import { text } from "express";
import { FileModelTypegoose } from "../repository/fileModelTypegoose";
import { v4 as uuidv4 } from "uuid";
import { promises as fsPromises } from "fs";
async function createHelloWorldPDF() {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();

  // Add "Hello, World!" text at the middle top like a heading
  const { width } = page.getSize();
  const fontSize = 18; // Adjusted font size
  const text = "Hello, World!";
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const textWidth = font.widthOfTextAtSize(text, fontSize);

  page.drawText(text, {
    x: (width - textWidth) / 2,
    y: page.getHeight() - 50, // Adjusted vertical position
    font,
    size: fontSize,
    color: rgb(0, 0, 0), // Black color
  });

  // Create tmp folder if it doesn't exist
  const tmpFolderPath = join(process.cwd(), "tmp");
  if (!existsSync(tmpFolderPath)) {
    mkdirSync(tmpFolderPath);
  }

  // Save the PDF to the tmp folder
  const pdfBytes = await pdfDoc.save();
  const pdfPath = join(tmpFolderPath, "hello_world.pdf");
  writeFileSync(pdfPath, pdfBytes);
}

//createHelloWorldPDF();

export async function createInvoice(
  invoiceJsonRequest: invoiceJsonRequest,
  userEmail: string
) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.276, 841.89]);

  const { height, width } = page.getSize();

  // Corrected the parentheses placement
  {
    const fontSize = 30; // Adjusted font size
    const text = invoiceJsonRequest.heading;
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const textWidth = font.widthOfTextAtSize(text, fontSize);

    page.drawText(text, {
      x: (width - textWidth) / 2, // Centered horizontally
      y: height - 50, // Adjusted for top middle placement
      font,
      size: fontSize,
      color: rgb(1, 0, 0),
    });
  }

  {
    const fontSize = 15; // Adjusted font size
    const text = "GST number :: " + invoiceJsonRequest.gstNumber;
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const textWidth = font.widthOfTextAtSize(text, fontSize);

    page.drawText(text, {
      x: (width - textWidth) / 2, // Centered horizontally
      y: height - 80, // Adjusted for top middle placement
      font,
      size: fontSize,
      color: rgb(0, 0, 1),
    });
  }
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontSize = 10;

  const itemList = invoiceJsonRequest.itemList;
  const startY = height - 120; // Adjusted starting Y coordinate

  for (let i = 0; i < itemList.length; i++) {
    const item = itemList[i];

    const itemName = item.name;
    const itemNameWidth = font.widthOfTextAtSize(itemName, fontSize);
    page.drawText(itemName, {
      x: 50, // Adjusted X coordinate for name on the left
      y: startY - i * 20, // Adjusted Y coordinate for each item
      font,
      size: fontSize,
      color: rgb(0, 0, 0),
    });

    const itemPrice = `Rs ${item.price}`; // Assuming price is a number
    const itemPriceWidth = font.widthOfTextAtSize(itemPrice, fontSize);
    page.drawText(itemPrice, {
      x: width - 50 - itemPriceWidth, // Adjusted X coordinate for price on the right
      y: startY - i * 20, // Same Y coordinate as the name
      font,
      size: fontSize,
      color: rgb(0, 0, 0),
    });
  }
  const documentCount = await FileModelTypegoose.countDocuments({
    userEmailId: userEmail,
  });

  if (documentCount > 5) {
    const oldDocuments = await FileModelTypegoose.find({
      userEmailId: userEmail,
    })
      .sort({ createdAt: 1 })
      .limit(documentCount - 5);

    const oldFileIds = oldDocuments.map((doc) => doc.fileId);

    let filePaths: string[] = [];

    oldFileIds.forEach((fileId) => {
      const path = join(process.cwd(), "tmp", userEmail, fileId.concat(".pdf"));
      filePaths.push(path);
    });
    deleteFiles(filePaths);

    const query = await FileModelTypegoose.deleteMany({
      userEmailId: userEmail,
      createdAt: { $lt: oldDocuments[oldDocuments.length - 1].createdAt },
    });
  }

  const filePath = new FileModelTypegoose({
    userEmailId: userEmail,
    fileName: invoiceJsonRequest.heading,
    fileId: uuidv4(),
  });
  filePath.save();

  const userEmailId = filePath.userEmailId.toString();
  const fileId = filePath.fileId.toString();

  const tmpFolderPath = join(process.cwd(), "tmp", `${userEmailId}`);
  if (!existsSync(tmpFolderPath)) {
    mkdirSync(tmpFolderPath, { recursive: true }); // Add recursive option to create nested directories if needed
  }

  // Save the PDF to the tmp folder
  const pdfBytes = await pdfDoc.save();

  const pdfPath = join(tmpFolderPath, `${fileId}.pdf`);
  writeFileSync(pdfPath, pdfBytes);
  return readFileSync(pdfPath);
}

async function deleteFiles(paths: string[]): Promise<void> {
  for (const path of paths) {
    try {
      await fsPromises.unlink(path);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        // File not found, continue to the next file

      } else {
        // Other error, log and handle accordingly
        console.error(`Error deleting file ${path}:`, (error as Error).message);
      }
    }
  }
}
