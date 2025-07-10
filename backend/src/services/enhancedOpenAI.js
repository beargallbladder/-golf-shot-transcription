
const { OpenAI } = require('openai');

class EnhancedOpenAIService {
  constructor() {
    this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    this.cache = new Map();
  }

  async analyzeShot(imageBase64, options = {}) {
    const cacheKey = this.generateCacheKey(imageBase64);
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const result = await this.performAnalysis(imageBase64, options);
    this.cache.set(cacheKey, result);
    return result;
  }

  generateCacheKey(imageBase64) {
    const crypto = require('crypto');
    return crypto.createHash('md5').update(imageBase64).digest('hex');
  }

  async performAnalysis(imageBase64, options) {
    const prompt = options.isRetailer 
      ? 'Professional golf fitting analysis with detailed club specifications'
      : 'Analyze golf simulator screenshot for basic metrics';
    
    const response = await this.client.chat.completions.create({
      model: "gpt-4o",
      messages: [{
        role: "user",
        content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: imageBase64 } }
        ]
      }],
      max_tokens: 500,
      temperature: 0.1
    });

    return JSON.parse(response.choices[0].message.content);
  }
}

module.exports = EnhancedOpenAIService;
    