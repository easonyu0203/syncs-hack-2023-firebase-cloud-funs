// User data interface
export interface UserData {
  email: string;
  displayName: string;
  photoURL: string;
  firstTimeLogin: boolean;
}

// Image data interface
export interface ImgData {
  userId: string;
  imgUrl: string | null;
  gsUrl: string | null;
  uploadTime: number;
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
