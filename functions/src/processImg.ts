import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { ImgData } from "./interface";

admin.initializeApp();

// Firestore trigger function
export const processImg = functions.firestore
  .document("images/{imageId}")
  .onWrite(async (change, context) => {
    const imageDocBefore = change.before.data() as ImgData;
    const imageDocAfter = change.after.data() as ImgData;

    console.log("Image document before:", imageDocBefore);
    console.log("Image document after:", imageDocAfter);

    return null; // Can return a value or Promise here if needed
  });
