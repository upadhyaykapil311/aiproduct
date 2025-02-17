require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.generateEmailContent = async (req, res) => {
  const { brandName, logoUrl, segment, goal, tone, productDescription, productName, testimonial } = req.body;

  const prompt = `Generate a high-converting marketing email for the brand "${brandName}"${logoUrl ? ` with logo "${logoUrl}"` : ''}.
  Targeting: ${segment}. Goal: ${goal}. Tone: ${tone}. Include a compelling headline, introduction, product details ("${productName}"), CTA, and customer testimonial: "${testimonial}".`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const response = await model.generateContent(prompt);
    const emailContent = response.response.text();

    return res.json({ emailContent: emailContent || "Failed to generate email content." });
  } catch (error) {
    console.error("Error generating email content:", error);
    return res.status(500).json({ error: "Error generating content. Please try again." });
  }
};
