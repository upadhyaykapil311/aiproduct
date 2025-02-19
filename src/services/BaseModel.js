export class BaseModel {
    generateImage(prompt, count, enhancePrompt, aspectRatio) {
        throw new Error('generateImage method must be implemented by child class');
    }
}