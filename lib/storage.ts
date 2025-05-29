import { supabase } from "./supabase/client"
import { v4 as uuidv4 } from "uuid"

// const supabase = createClient() // Remove this line if present

export async function uploadImage(file: File, bucket = "beer-images") {
  try {
    const fileExt = file.name.split(".").pop()
    const fileName = `${uuidv4()}.${fileExt}`
    const filePath = `${fileName}`

    const { error } = await supabase.storage.from(bucket).upload(filePath, file)

    if (error) {
      throw error
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath)

    return data.publicUrl
  } catch (error) {
    console.error("Error uploading image:", error)
    return null
  }
}

export async function uploadMultipleImages(files: File[], bucket = "beer-images") {
  const uploadPromises = files.map((file) => uploadImage(file, bucket))
  const results = await Promise.all(uploadPromises)
  return results.filter((url) => url !== null) as string[]
}

export async function deleteImage(url: string, bucket = "beer-images") {
  try {
    const path = url.split(`${bucket}/`)[1]

    if (!path) {
      throw new Error("Invalid image URL")
    }

    const { error } = await supabase.storage.from(bucket).remove([path])

    if (error) {
      throw error
    }

    return true
  } catch (error) {
    console.error("Error deleting image:", error)
    return false
  }
}
