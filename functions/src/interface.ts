// User data interface
export interface UserData {
  email: string;
  displayName: string;
  photoUrl: string;
}

// Image data interface
export interface ImgData {
  userId: string;
  imgUrl: string | null;
  uploadTime: string;
  status:
    | "uploading"
    | "unprocess"
    | "extracting_text"
    | "predicting_category"
    | "structurized_text"
    | "success"
    | "failed";
  text: string | null;
  structurized_text: string | null;
  category: string | null;
}
