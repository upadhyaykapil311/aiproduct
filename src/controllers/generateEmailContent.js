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
const fetch = require("node-fetch");
const { Headers } = require("node-fetch");
global.fetch = fetch;
global.Headers = Headers;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.generateEmailContent = async (req, res) => {
  const { brandName, logoUrl, segment, goal, tone, productDescription, productName, testimonials, productOptions, benefits, pricing, socialProof, scarcity, brandStory, footerContent, imagePlacement, colorScheme } = req.body;

  const prompt = `Create a complete, high-converting email marketing template for ${brandName} & ${productName}.

  Please include all of the following sections with detailed content:

  1. Subject line that drives high open rates
  2. Pre-header text
  3. Header section with branding
  4. Compelling headline that grabs attention
  5. Product introduction and value proposition
  6. Detailed product description highlighting key features and benefits (3-4 paragraphs)
  7. 3-5 key benefits as bullet points
  8. Product pricing and any special offers
  9. 2-3 customer testimonials with their full names and titles
  10. Primary call-to-action button text and secondary CTAs
  11. Social proof elements (ratings, reviews, awards etc)
  12. Sense of urgency/scarcity messaging
  13. Brand story or company background
  14. Footer content including:
      - Company contact information
      - Social media links
      - Unsubscribe link text
      - Legal disclaimers
      - Copyright text
  15. Image placement recommendations
  16. Color scheme suggestions

  Target audience: ${segment}
  Goal: ${goal}
  Tone: ${tone}
  Product details: ${productDescription}`;
    
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const aiContent = await result.response.text();
    // Extract key sections from AI content
    const subjectLineText = aiContent.match(/Subject[^:]*:(.*?)(?=\*\*|$)/s)?.[1]?.trim() || '';
    const preHeaderText = aiContent.match(/Pre-header[^:]*:(.*?)(?=\*\*|$)/s)?.[1]?.trim() || '';
    const headlineText = aiContent.match(/Headline[^:]*:(.*?)(?=\*\*|$)/s)?.[1]?.trim() || '';
    const productIntroText = aiContent.match(/Product Introduction and Value Proposition[^:]*:(.*?)(?=\*\*|$)/s)?.[1]?.trim() || '';
    const detailedDescText = aiContent.match(/Detailed Product Description:([\s\S]*?)(?=\*\*|$)/)?.[1]?.trim() || '';
    const benefitsText = aiContent.match(/Key Benefits[^:]*:([\s\S]*?)(?=\*\*|$)/)?.[1]?.trim() || '';
    const testimonialsText = aiContent.match(/Customer Testimonials:([\s\S]*?)(?=\*\*|$)/)?.[1]?.trim() || '';
    const brandStory = aiContent.match(/Brand Story[^:]*:([\s\S]*?)(?=\*\*|$)/)?.[1]?.trim() || '';

    console.log("Extracted sections:", {
      subjectLineText,
      preHeaderText,
      productIntroText,
      detailedDescText,
      benefitsText,
      testimonialsText,
      brandStory
    });
    // Parse AI generated content sections
    const sections = aiContent.split('**').filter(Boolean);
    const contentMap = {};
    
    sections.forEach(section => {
      const [title, ...content] = section.split(':');
      if (title && content.length) {
        contentMap[title.trim()] = content.join(':').trim();
      }
    });

    const {
      'Subject Line (High Open Rate)': subjectLine = '',
      'Pre-header Text': preHeader = '',
      'Compelling Headline': headline = '',
      'Product Introduction and Value Proposition': intro = '',
      'Detailed Product Description': detailedDesc = '',
      'Primary Call-to-Action Button Text and Secondary CTAs': cta = ''
    } = contentMap;

    const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${productName} - ${brandName}</title>
        <meta name="subject" content="${subjectLineText || subjectLine}">
        <meta name="preheader" content="${preHeaderText || preHeader}">
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet">
    </head>
    <body class="bg-gray-100 text-gray-800 font-sans">
        <div class="max-w-2xl mx-auto bg-white">
            <div class="relative bg-cover bg-center py-16 text-center text-white" 
                 style="background-image: url('https://www.deepbluehealth.co.nz/cdn/shop/files/DBH-Home-Page-Hero-Banner-v22_1280x544.jpg?v=1668732557')">
                <div class="absolute inset-0 bg-opacity-30"></div>
                <div class="relative z-10">
                    <img src="https://www.deepbluehealth.co.nz/cdn/shop/files/DBH-Logo-Stack-Website-RGB-224x148px-v2_128x96.png?v=1671741678" alt="${brandName}" class="w-20 h-auto mx-auto mb-5">
                    <h1 class="text-4xl font-bold mb-2 drop-shadow-lg">${productName}</h1>
                </div>
            </div>

            <div class="px-8 py-12 text-center">
                <h1 class="text-4xl font-bold text-black mb-4">${headlineText}</h1>
            </div>

            <div class="px-8 py-12 shadow-xl rounded-lg mx-4" style="background-color: ${colorScheme?.primaryColor}">
                <h1 class="text-3xl font-semibold text-center text-black">${subjectLineText}</h1>
                <p class="text-lg text-center text-black"></p>
            </div>

            <div class="px-8 py-12">
                <div class="bg-gray-100 -mt-20 relative z-20 rounded-xl shadow-2xl p-8 mx-4">
                <p></p>
                    <p class="text-lg leading-relaxed mb-6 text-gray-700">${preHeaderText || intro}</p>
                    <p class="text-lg leading-relaxed text-gray-700">${productIntroText || detailedDesc}</p>
                </div>

                <div class="my-16">
                    <h2 class="text-3xl font-bold text-blue-900 mb-8 text-center">Why ${productName}?</h2>
                    <p class="text-lg text-gray-700 mb-8">${benefitsText}</p>
                    ${benefitsText || benefits.map(benefit => `
                        <div class="flex items-center text-gray-700 my-4 bg-blue-50 p-4 rounded-lg">
                            <span class="text-blue-900 mr-4 text-xl">•</span>
                            <span class="text-lg">${benefit}</span>
                        </div>
                    `).join('')}
                </div>

                <div class="my-16 bg-black p-8 rounded-xl shadow-xl text-center">
                    <p class="text-2xl text-blue-900 leading-relaxed">${detailedDescText}</p>
                </div>

                <div class="space-y-6">
                    <h3 class="text-3xl font-bold text-blue-900 mb-8 text-center">What Our Customers Say</h3>
                    <p class="text-lg text-gray-700 mb-8 text-center">${testimonialsText}</p>
                    ${testimonialsText || testimonials.map(testimonial => `
                        <div class="bg-blue-50 p-8 rounded-xl shadow-lg">
                            <div class="text-yellow-400 mb-4 text-2xl">★★★★★</div>
                            <p class="italic mb-4 text-lg text-gray-700">${testimonial.content}</p>
                            <p class="font-semibold text-blue-900">- ${testimonial.author}</p>
                        </div>
                    `).join('')}
                </div>

                <div class="grid grid-cols-2 gap-6 my-8">
                    ${productOptions.map(option => `
                        <div class="text-center">
                            <p class="mb-3">${option.name}</p>
                            <a href="${option.link}" class="block w-full bg-blue-900 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-800 transition duration-300">
                                SHOP NOW
                            </a>
                        </div>
                    `).join('')}
                </div>

                <div class="text-center my-12">
                    <a href="#" class="inline-block bg-blue-900 text-white font-bold py-4 px-8 rounded-lg hover:bg-blue-800 transition duration-300 w-full md:w-auto">
                        ${cta.split('\n')[0] || 'SHOP NOW & FEEL THE DIFFERENCE'}
                    </a>
                </div>
            </div>

            <div class="bg-gray-50 p-8 text-center">
                <div class="flex flex-col space-y-3 mb-6 text-gray-600">
                    <span class="hover:text-blue-900 cursor-pointer">BRAIN FUNCTION</span>
                    <span class="hover:text-blue-900 cursor-pointer">ENERGY</span>
                    <span class="hover:text-blue-900 cursor-pointer">IMMUNITY</span>
                    <span class="hover:text-blue-900 cursor-pointer">DIGESTION</span>
                </div>
                <div class="space-x-6 mb-6">
                    <a href="#" class="text-gray-600 hover:text-blue-900">Instagram</a>
                    <a href="#" class="text-gray-600 hover:text-blue-900">Facebook</a>
                </div>

                <p class="text-gray-600 mb-2">${brandStory}</p>
                <p class="text-gray-600 mb-2">© ${new Date().getFullYear()} ${brandName}. All rights reserved.</p>
                <p class="text-gray-600">If you would like to unsubscribe, <a href="#" class="underline hover:text-blue-900">click here</a></p>
            </div>
        </div>
    </body>
    </html>`;
    return res.json({
      emailContent: htmlTemplate,
      emailData: aiContent,
      success: true
    });
  } catch (error) {
    console.error("Error generating email content:", error);
    return res.status(500).json({ error: "Error generating content. Please try again." });
  }
};
