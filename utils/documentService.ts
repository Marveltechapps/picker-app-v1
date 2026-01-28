/**
 * Document Service
 * 
 * Handles document upload, fetch, and update operations.
 * This is a placeholder implementation - replace with actual API calls.
 */

export interface DocumentUploadResponse {
  success: boolean;
  message?: string;
  documentUrl?: string;
  error?: string;
}

export interface DocumentFetchResponse {
  success: boolean;
  documents?: {
    aadhar?: {
      front?: string | null;
      back?: string | null;
    };
    pan?: {
      front?: string | null;
      back?: string | null;
    };
  };
  error?: string;
}

/**
 * Upload a document to the backend
 * @param docType - Type of document ('aadhar' | 'pan')
 * @param side - Side of document ('front' | 'back')
 * @param uri - Local file URI
 * @returns Promise with upload response
 */
export async function uploadDocument(
  docType: "aadhar" | "pan",
  side: "front" | "back",
  uri: string
): Promise<DocumentUploadResponse> {
  try {
    // TODO: Replace with actual API endpoint
    // Example: const response = await fetch(`${API_BASE_URL}/documents/upload`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'multipart/form-data' },
    //   body: formData
    // });

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // For now, return success (local storage is handled by authContext)
    // In production, upload the file to your backend and get the URL
    return {
      success: true,
      message: "Document uploaded successfully",
      documentUrl: uri, // In production, this would be the backend URL
    };
  } catch (error) {
    console.error(`Error uploading ${docType} ${side}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to upload document",
    };
  }
}

/**
 * Fetch user documents from the backend
 * @returns Promise with document data
 */
export async function fetchDocuments(): Promise<DocumentFetchResponse> {
  try {
    // TODO: Replace with actual API endpoint
    // Example: const response = await fetch(`${API_BASE_URL}/documents`, {
    //   method: 'GET',
    //   headers: { 'Authorization': `Bearer ${token}` }
    // });

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // For now, return empty (local storage is handled by authContext)
    // In production, fetch from backend
    return {
      success: true,
      documents: {
        aadhar: { front: null, back: null },
        pan: { front: null, back: null },
      },
    };
  } catch (error) {
    console.error("Error fetching documents:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch documents",
    };
  }
}

/**
 * Update/replace a document
 * @param docType - Type of document ('aadhar' | 'pan')
 * @param side - Side of document ('front' | 'back')
 * @param uri - Local file URI
 * @returns Promise with update response
 */
export async function updateDocument(
  docType: "aadhar" | "pan",
  side: "front" | "back",
  uri: string
): Promise<DocumentUploadResponse> {
  // Update is same as upload for now
  return uploadDocument(docType, side, uri);
}

/**
 * Validate file before upload
 * @param uri - File URI
 * @param fileSize - File size in bytes
 * @param width - Image width (optional)
 * @param height - Image height (optional)
 * @returns Object with validation result and error message
 */
export function validateDocumentFile(
  uri: string,
  fileSize?: number,
  width?: number,
  height?: number
): { isValid: boolean; error?: string } {
  // Check file size (max 10MB)
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  if (fileSize && fileSize > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: "File size exceeds 10MB. Please upload a smaller file.",
    };
  }

  // Check image dimensions
  if (width && height) {
    const MIN_DIMENSION = 200;
    if (width < MIN_DIMENSION || height < MIN_DIMENSION) {
      return {
        isValid: false,
        error: `Image dimensions must be at least ${MIN_DIMENSION}x${MIN_DIMENSION} pixels.`,
      };
    }
  }

  // Check file extension (basic check)
  const validExtensions = [".jpg", ".jpeg", ".png", ".pdf"];
  const uriLower = uri.toLowerCase();
  const hasValidExtension = validExtensions.some((ext) => uriLower.endsWith(ext));

  if (!hasValidExtension && uri.includes(".")) {
    return {
      isValid: false,
      error: "Invalid file type. Please upload JPG, PNG, or PDF files only.",
    };
  }

  return { isValid: true };
}
