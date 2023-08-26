import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { ImageAnnotatorClient } from "@google-cloud/vision";
import { ImgData } from "./interface";

admin.initializeApp();
const vision = new ImageAnnotatorClient();

// Firestore trigger function
export const processImg = functions.firestore
  .document("images/{imageId}")
  .onWrite(async (change, context) => {
    const img = change.after.data() as ImgData;

    // check if should prcoess the image
    const shouldStartProcessing =
      img.imgUrl != null && img.status == "unprocess";
    if (!shouldStartProcessing) {
      return null;
    }

    // extract text from image
    const text = await extract_text(img);
    console.log("Extracted text:", text);

    return null; // Can return a value or Promise here if needed
  });

const extract_text = async (img: ImgData): Promise<string> => {
  try {
    const [result] = await vision.textDetection(img.gsUrl!);

    // Extract the text annotations from the result
    const textAnnotations = result.textAnnotations;
    if (textAnnotations && textAnnotations.length > 0) {
      const extractedText = textAnnotations[0].description;
      return extractedText!;
    } else {
      return "No text found in the image.";
    }
  } catch (error) {
    console.error("Error extracting text from image:", error);
    throw error;
  }
};
