import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { ImageAnnotatorClient } from "@google-cloud/vision";
import axios from "axios";
import { ImgData } from "./interface";

admin.initializeApp();
const vision = new ImageAnnotatorClient();
const fastapiServiceUrl = "https://fastapi-service-mkmjmbqdoa-de.a.run.app/";

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
    await change.after.ref.update({
      status: "extracting_text",
    });
    const text = await extract_text(img);
    await change.after.ref.update({
      text: text.replace("\n", "//"),
      status: "predicting_category",
    });

    // predicting category
    const category_response = await axios.get(`${fastapiServiceUrl}/category`, {
      params: {
        text: text,
      },
    });
    const category = category_response.data.category;
    await change.after.ref.update({
      category: category,
      status: "structurized_text",
    });

    if (category == "unknown") {
      await change.after.ref.update({
        status: "failed",
      });
      return null;
    }

    // structruizing text
    const structurized_response = await axios.get(
      `${fastapiServiceUrl}/structurize_text`,
      {
        params: {
          text: text,
          category: category,
        },
      }
    );
    let structurized_text = structurized_response.data.structurized_text;
    if (category == "events") {
      structurized_text = {
        title: structurized_text.title,
        location: structurized_text.location,
        time: structurized_text.time,
        description: structurized_text.description.replace("\n", "//"),
      };
    } else if (category == "notes") {
      structurized_text = {
        title: structurized_text.title,
        summary: structurized_text.summary.replace("\n", "//"),
      };
    }
    await change.after.ref.update({
      structurized_text: structurized_text,
      status: category == "unknown" ? "fail" : "success",
    });

    return null;
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
