
import { API } from "./api.js";

// =====================================
// ANIME STUDIO AI PRO
// UPLOAD STUDIO
// =====================================

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "audio/mpeg",
  "audio/wav",
  "video/mp4",
  "video/webm",
  "video/quicktime"
];

const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024;

// Validate selected file
export function validateUploadFile(file) {
  if (!file) {
    throw new Error("Please select a file.");
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("This file type is not supported.");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Maximum upload size is 2 GB.");
  }

  return true;
}

// Upload media file
export async function uploadMedia({
  file,
  onLoading = () => {},
  onSuccess = () => {},
  onError = () => {}
}) {
  try {
    validateUploadFile(file);

    onLoading(true);

    const result = await API.upload(file);

    if (!result || !result.success || !result.file_path) {
      throw new Error("File upload failed.");
    }

    onSuccess(result);
    return result;

  } catch (error) {
    onError(error.message || "File upload failed.");
    throw error;

  } finally {
    onLoading(false);
  }
}

// Format file size
export function formatFileSize(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) {
    return "Unknown size";
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`;
  }

  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

// Create a temporary preview URL
export function createMediaPreview(file) {
  validateUploadFile(file);
  return URL.createObjectURL(file);
}

// Release preview URL when no longer needed
export function releaseMediaPreview(previewUrl) {
  if (previewUrl && previewUrl.startsWith("blob:")) {
    URL.revokeObjectURL(previewUrl);
  }
}
