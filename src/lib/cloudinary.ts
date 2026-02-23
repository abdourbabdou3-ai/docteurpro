export const cloudinaryConfig = {
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'docteur',
    uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'docteur_uploads',
};

export const getCloudinaryUploadUrl = () =>
    `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/upload`;
