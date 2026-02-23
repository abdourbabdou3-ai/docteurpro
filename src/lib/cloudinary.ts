export const cloudinaryConfig = {
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'docteur',
    uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'docteur_uploads',
};

// Determine the correct resource type for Cloudinary
export const getResourceType = (fileType: string): string => {
    if (fileType.startsWith('image/')) return 'image';
    if (fileType === 'application/pdf') return 'image'; // Cloudinary can handle PDFs as images
    return 'raw'; // For DOC, XLS, etc.
};

export const getCloudinaryUploadUrl = (fileType: string) => {
    const resourceType = getResourceType(fileType);
    return `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/${resourceType}/upload`;
};
