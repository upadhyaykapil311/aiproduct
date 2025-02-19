const cloudinary = require('cloudinary').v2;

class CloudinaryService {
    constructor() {
        cloudinary.config({
            cloud_name: 'dquq0mrkt',
            api_key: '382992518877714',
            api_secret: '4Fcox7q0k0y9QVJdzBcsmejVQuQ'
        })

        this.Cloudinary = cloudinary;
    }

    upload = async (base64Data) => {
        try {
            const uploadResult = await this.Cloudinary.uploader.upload(`data:image/png;base64,${base64Data}`, {
                folder: 'image-gen',
            });
            
            return {
                status: true,
                url: uploadResult.secure_url
            }
        } catch (error) {
            console.error("Error while uploading the image to cloudinary." + error.message);
            return {
                status: false,
            }
        }
    }
}

module.exports = {
    cloudinaryService: new CloudinaryService()
};