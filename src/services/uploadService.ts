import apiClient, { API_BASE_URL } from "@/lib/api/axiosClient";

export interface UploadedFileResponse {
  key: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
}

export const uploadService = {
  /**
   * Upload an image file (JPEG, PNG, WebP <= 5MB) to BE via POST /api/uploads
   */
  async uploadFile(file: File): Promise<UploadedFileResponse> {
    if (!file) {
      throw new Error("Vui lòng chọn tệp hình ảnh để tải lên.");
    }

    // Validate size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new Error("Kích thước tệp vượt quá giới hạn cho phép (tối đa 5MB).");
    }

    // Validate mime type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      throw new Error("Định dạng tệp không hợp lệ. Chỉ chấp nhận JPG, PNG hoặc WebP.");
    }

    const formData = new FormData();
    formData.append("file", file);

    const res = await apiClient.post<any, UploadedFileResponse>(
      "/uploads",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    // Format full absolute URL for browser rendering
    const serverHost = API_BASE_URL.replace(/\/api\/?$/, "");
    const fullUrl = res.url.startsWith("http")
      ? res.url
      : `${serverHost}${res.url.startsWith("/") ? "" : "/"}${res.url}`;

    return {
      ...res,
      url: fullUrl,
    };
  },
};
