// require("dotenv").config();
// const { GoogleGenerativeAI } = require("@google/generative-ai");

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// exports.generateEmailContent = async (req, res) => {
//   const { brandName, logoUrl, segment, goal, tone, productDescription, productName, testimonial } = req.body;

//   const prompt = `Generate a high-converting marketing email for the brand "${brandName}"${logoUrl ? ` with logo "${logoUrl}"` : ''}.
//   Targeting: ${segment}. Goal: ${goal}. Tone: ${tone}. Include a compelling headline, introduction, product details ("${productName}"), CTA, and customer testimonial: "${testimonial}".`;

//   try {
//     const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
//     const response = await model.generateContent(prompt);
//     const emailContent = response.response.text();

//     return res.json({ emailContent: emailContent || "Failed to generate email content." });
//   } catch (error) {
//     console.error("Error generating email content:", error);
//     return res.status(500).json({ error: "Error generating content. Please try again." });
//   }
// };


require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { imagenGenerateImage } = require('../services/ImagenModel');
const fetch = require("node-fetch");
const { Headers } = require("node-fetch");
global.fetch = fetch;
global.Headers = Headers;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.generateEmailContent = async (req, res) => {
  const { brandName, logoUrl, segment, goal, tone, productDescription, productName, testimonials, productOptions, benefits, pricing, socialProof, scarcity, brandStory, footerContent, imagePlacement, colorScheme, templateType } = req.body;

  const prompt = `Create a structured marketing email for ${brandName} & ${productName}.
  
  Please provide the content in the following exact format with clear section markers:

  SUBJECT_LINE:
  Write a compelling subject line that will drive high open rates.

  PRE_HEADER:
  Write a concise pre-header text that complements the subject line.

  HEADLINE:
  Create an attention-grabbing headline.

  PRODUCT_INTRO:
  Write a compelling introduction and value proposition for ${productName}.

  DETAILED_DESCRIPTION:
  Provide a detailed 3-4 paragraph description of the product highlighting:
  - Key features
  - Main benefits
  - Unique selling points
  - Technical specifications
  ${productDescription}

  BENEFITS:
  List 3-5 key benefits as bullet points.

  TESTIMONIALS:
  Include 2-3 formatted customer testimonials with names and titles.

  BRAND_STORY:
  Write a compelling brand story or company background.

  Target Audience: ${segment}
  Goal: ${goal}
  Tone: ${tone}

  Note: Please maintain the exact section markers (e.g. SUBJECT_LINE:) for proper content parsing.`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const aiContent = await result.response.text();

    // Parse sections using consistent markers
    const sections = {
      subjectLineText: aiContent.match(/SUBJECT_LINE:(.*?)(?=PRE_HEADER:|$)/s)?.[1]?.trim(),
      preHeaderText: aiContent.match(/PRE_HEADER:(.*?)(?=HEADLINE:|$)/s)?.[1]?.trim(),
      headlineText: aiContent.match(/HEADLINE:(.*?)(?=PRODUCT_INTRO:|$)/s)?.[1]?.trim(),
      productIntroText: aiContent.match(/PRODUCT_INTRO:(.*?)(?=DETAILED_DESCRIPTION:|$)/s)?.[1]?.trim(),
      detailedDescText: aiContent.match(/DETAILED_DESCRIPTION:(.*?)(?=BENEFITS:|$)/s)?.[1]?.trim(),
      benefitsText: aiContent.match(/BENEFITS:(.*?)(?=TESTIMONIALS:|$)/s)?.[1]?.trim(),
      testimonialsText: aiContent.match(/TESTIMONIALS:(.*?)(?=BRAND_STORY:|$)/s)?.[1]?.trim(),
      brandStory: aiContent.match(/BRAND_STORY:(.*?)$/s)?.[1]?.trim()
    };

    console.log("Parsed Sections:", sections);

    const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${productName} - ${brandName}</title>
        <meta name="subject" content="${sections.subjectLineText}">
        <meta name="preheader" content="${sections.preHeaderText}">
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet">
    </head>
    <body class="bg-gray-100 text-gray-800 font-sans">
        <div class="max-w-2xl mx-auto bg-white">
            <div class="relative bg-cover bg-center py-16 text-center text-white" 
                 style="background-image: url('${logoUrl || ''}')">
                <div class="absolute inset-0 bg-opacity-30"></div>
                <div class="relative z-10">
                    <img src="${logoUrl || ''}" alt="${brandName}" class="w-20 h-auto mx-auto mb-5">
                    <h1 class="text-4xl font-bold mb-2 drop-shadow-lg">${productName}</h1>
                </div>
            </div>

            <div class="px-8 py-12 text-center">
                <h1 class="text-4xl font-bold text-black mb-4">${sections.headlineText}</h1>
            </div>

            <div class="px-8 py-12 shadow-xl rounded-lg mx-4" style="background-color: ${colorScheme?.primaryColor || '#f3f4f6'}">
                <h1 class="text-3xl font-semibold text-center text-black">${sections.subjectLineText}</h1>
            </div>

            <div class="px-8 py-12">
                <div class="bg-gray-100 -mt-20 relative z-20 rounded-xl shadow-2xl p-8 mx-4">
                    <p class="text-lg leading-relaxed mb-6 text-gray-700">${sections.preHeaderText}</p>
                    <p class="text-lg leading-relaxed text-gray-700">${sections.productIntroText}</p>
                </div>

                <div class="my-16">
                    <h2 class="text-3xl font-bold text-blue-900 mb-8 text-center">Why ${productName}?</h2>
                    <p class="text-lg text-gray-700 mb-8">${sections.benefitsText}</p>
                </div>

                <div class="my-16 bg-gray-50 p-8 rounded-xl shadow-xl">
                    <p class="text-lg text-gray-700">${sections.detailedDescText}</p>
                </div>

                <div class="space-y-6">
                    <h3 class="text-3xl font-bold text-blue-900 mb-8 text-center">What Our Customers Say</h3>
                    <p class="text-lg text-gray-700 mb-8">${sections.testimonialsText}</p>
                </div>

                <div class="text-center my-12">
                    <a href="#" class="inline-block bg-blue-600 text-white font-bold py-4 px-8 rounded-lg hover:bg-blue-700 transition duration-300">
                        Shop Now
                    </a>
                </div>
            </div>

            <div class="bg-gray-50 p-8 text-center">
                <p class="text-gray-600 mb-4">${sections.brandStory}</p>
                <p class="text-gray-600 mb-2">© ${new Date().getFullYear()} ${brandName}. All rights reserved.</p>
                <p class="text-gray-600">To unsubscribe <a href="#" class="underline">click here</a></p>
            </div>
        </div>
    </body>
    </html>`;

    return res.json({
      emailContent: htmlTemplate,
      emailData: sections,
      success: true
    });
  } catch (error) {
    console.error("Error generating email content:", error);
    return res.status(500).json({ error: "Error generating content. Please try again." });
  }
};


exports.generateImage = async (req, res) => {
    const { prompt, count, enhancePrompt, aspectRatio } = req.body;
    try {
        if (!prompt) {
            return res.status(400).json({
                status: false,
                message: "Prompt is required"
            });
        }

        const result = await imagenGenerateImage(
            prompt,
            count || 1,
            enhancePrompt || false,
            aspectRatio
        );

        if (!result || (Array.isArray(result) && !result.length)) {
            return res.status(500).json({
                status: false,
                message: "Failed to generate image"
            });
        }

        return res.status(200).json({
            status: true,
            data: result
        });

    } catch (error) {
        console.error("Image generation error:", error);
        return res.status(500).json({
            status: false,
            message: "Internal server error",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
};
