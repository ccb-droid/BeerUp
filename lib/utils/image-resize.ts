/**
 * Client-side image resizing utility
 */

export interface ResizeOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  outputFormat?: 'jpeg' | 'png' | 'webp'
}

/**
 * Resizes an image file to stay within specified dimensions while maintaining aspect ratio
 */
export async function resizeImage(
  file: File,
  options: ResizeOptions = {}
): Promise<File> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
    outputFormat = 'jpeg'
  } = options

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    if (!ctx) {
      reject(new Error('Could not get canvas context'))
      return
    }

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      
      // Calculate new dimensions while maintaining aspect ratio
      let { width, height } = img
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height
        height = maxHeight
      }

      // Set canvas dimensions
      canvas.width = width
      canvas.height = height

      // Draw and resize image
      ctx.drawImage(img, 0, 0, width, height)

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to resize image'))
            return
          }

          // Create new file with resized image
          const resizedFile = new File(
            [blob],
            file.name,
            {
              type: `image/${outputFormat}`,
              lastModified: Date.now()
            }
          )

          resolve(resizedFile)
        },
        `image/${outputFormat}`,
        quality
      )
    }

    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }

    // Create object URL and load image
    const objectUrl = URL.createObjectURL(file)
    img.src = objectUrl
  })
}

/**
 * Checks if a file needs resizing based on dimensions
 */
export async function shouldResizeImage(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1080
): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image()
    
    img.onload = () => {
      URL.revokeObjectURL(img.src)
      resolve(img.width > maxWidth || img.height > maxHeight)
    }
    
    img.onerror = () => {
      // If we can't load the image, assume it needs resizing
      resolve(true)
    }
    
    const objectUrl = URL.createObjectURL(file)
    img.src = objectUrl
  })
}