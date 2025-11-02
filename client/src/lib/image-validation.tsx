export const IMAGE_CONFIG = {
  single: {
    maxFileSize: 2 * 1024 * 1024, // 2MB
    acceptedTypes: ["image/jpeg", "image/png", "image/webp"],
    minWidth: 200,
    minHeight: 200,
    maxWidth: 1200,
    maxHeight: 1200,
    aspectRatio: 1, // Square images
  },
  multiple: {
    maxFileSize: 5 * 1024 * 1024, // 5MB per image
    maxTotalFiles: 10,
    acceptedTypes: ["image/jpeg", "image/png", "image/webp"],
    minWidth: 400,
    minHeight: 400,
    maxWidth: 2400,
    maxHeight: 2400,
    aspectRatio: 1, // Square images
  },
};

export type ValidationResult = {
  isValid: boolean;
  error?: string;
};

export const validateSingleImage = async (
  file: File
): Promise<ValidationResult> => {
  const config = IMAGE_CONFIG.single;

  // Check file size
  if (file.size > config.maxFileSize) {
    return {
      isValid: false,
      error: `File size must be less than ${
        config.maxFileSize / (1024 * 1024)
      }MB`,
    };
  }

  // Check file type
  if (!config.acceptedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: "Only JPEG, PNG and WebP images are allowed",
    };
  }

  // Check dimensions and aspect ratio
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);

      if (img.width < config.minWidth || img.height < config.minHeight) {
        resolve({
          isValid: false,
          error: `Image must be at least ${config.minWidth}x${config.minHeight} pixels`,
        });
        return;
      }

      if (img.width > config.maxWidth || img.height > config.maxHeight) {
        resolve({
          isValid: false,
          error: `Image must be no larger than ${config.maxWidth}x${config.maxHeight} pixels`,
        });
        return;
      }

      const ratio = img.width / img.height;
      if (Math.abs(ratio - config.aspectRatio) > 0.1) {
        resolve({
          isValid: false,
          error: "Image must be square (1:1 aspect ratio)",
        });
        return;
      }

      resolve({ isValid: true });
    };

    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      resolve({
        isValid: false,
        error: "Failed to load image",
      });
    };

    img.src = URL.createObjectURL(file);
  });
};

export const validateMultipleImages = async (
  files: File[]
): Promise<ValidationResult> => {
  const config = IMAGE_CONFIG.multiple;

  // Check total number of files
  if (files.length > config.maxTotalFiles) {
    return {
      isValid: false,
      error: `Maximum ${config.maxTotalFiles} images allowed`,
    };
  }

  // Validate each file
  for (const file of files) {
    // Check file size
    if (file.size > config.maxFileSize) {
      return {
        isValid: false,
        error: `Each file must be less than ${
          config.maxFileSize / (1024 * 1024)
        }MB`,
      };
    }

    // Check file type
    if (!config.acceptedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: "Only JPEG, PNG and WebP images are allowed",
      };
    }

    // Check dimensions and aspect ratio
    const result = await new Promise<ValidationResult>((resolve) => {
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(img.src);

        if (img.width < config.minWidth || img.height < config.minHeight) {
          resolve({
            isValid: false,
            error: `Each image must be at least ${config.minWidth}x${config.minHeight} pixels`,
          });
          return;
        }

        if (img.width > config.maxWidth || img.height > config.maxHeight) {
          resolve({
            isValid: false,
            error: `Each image must be no larger than ${config.maxWidth}x${config.maxHeight} pixels`,
          });
          return;
        }

        const ratio = img.width / img.height;
        if (Math.abs(ratio - config.aspectRatio) > 0.1) {
          resolve({
            isValid: false,
            error: "All images must be square (1:1 aspect ratio)",
          });
          return;
        }

        resolve({ isValid: true });
      };

      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        resolve({
          isValid: false,
          error: "Failed to load image",
        });
      };

      img.src = URL.createObjectURL(file);
    });

    if (!result.isValid) {
      return result;
    }
  }

  return { isValid: true };
};
