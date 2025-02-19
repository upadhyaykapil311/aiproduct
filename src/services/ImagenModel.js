const { GoogleAuth } = require('google-auth-library');
const axios = require('axios');
const { cloudinaryService } = require('./cloudinaryService');
const credentials = require('../neuromatic.json');

const getAccessToken = async () => {
    const auth = new GoogleAuth({
        credentials,
        scopes: ["https://www.googleapis.com/auth/cloud-platform"],
      });
    
  const client = await auth.getClient();
  const tokenResponse = await client.getAccessToken();

  if (!tokenResponse || !tokenResponse.token) {
    console.error("Failed to obtain access token");
    return null;
  }

  return tokenResponse.token;
};

exports.imagenGenerateImage = async (prompt, count = 1, enhancePrompt = false, aspectRatio) => {
  try {
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
    const location = process.env.GOOGLE_CLOUD_LOCATION;
    const modelVersion = process.env.IMAGEN_MODEL_VERSION;

    console.log(projectId, location, modelVersion);

    if (!projectId || !location || !modelVersion) {
      console.error("Missing required configuration!");
      return null;
    }

    const token = await getAccessToken();
    if (!token) return null;

    const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${modelVersion}:predict`;

    const data = {
      instances: [{ prompt }],
      parameters: { 
        sampleCount: count, 
        enhancePrompt: enhancePrompt ? "make perfect" : false,
        aspectRatio: aspectRatio || "1:1"
      }
    };

    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: endpoint,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json; charset=utf-8'
      },
      data
    };

    const response = await axios.request(config);

    if (!response.data.predictions) {
      console.error("No data present in the response!");
      return null;
    }

    const urls = await Promise.all(
      response.data.predictions.map(async (item) => {
        const base64Data = item.bytesBase64Encoded;
        const result = await cloudinaryService.upload(base64Data);
        return result.status ? result.url : null;
      })
    );
    
    return urls.filter(url => url !== null);
    
  } catch (error) {
    // Log the full error object for debugging
    console.log('Full error:', error);
    console.error('Error message:', error.message);
    console.error('Error status:', error.response?.status);
    console.error('Error data:', error.response?.data);
    return null;
  }
};