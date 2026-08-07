/** Lecture d'un fichier en dataURL, avec redimensionnement pour tenir en stockage. */

export function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/**
 * Redimensionne et recompresse une photo. Les Polaroid vivent 24 h dans le
 * stockage du navigateur : 900 px en JPEG 0.72 suffisent largement et evitent
 * de saturer le quota.
 */
export async function compressImage(file: File, maxSize = 900, quality = 0.72): Promise<string> {
  const dataURL = await fileToDataURL(file);
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      const ratio = Math.min(1, maxSize / Math.max(image.width, image.height));
      const width = Math.round(image.width * ratio);
      const height = Math.round(image.height * ratio);
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d');
      if (!context) {
        resolve(dataURL);
        return;
      }
      context.drawImage(image, 0, 0, width, height);
      try {
        resolve(canvas.toDataURL('image/jpeg', quality));
      } catch {
        resolve(dataURL);
      }
    };
    image.onerror = () => resolve(dataURL);
    image.src = dataURL;
  });
}

export function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export function supportsRecording() {
  return (
    typeof navigator !== 'undefined' &&
    Boolean(navigator.mediaDevices?.getUserMedia) &&
    typeof MediaRecorder !== 'undefined'
  );
}
