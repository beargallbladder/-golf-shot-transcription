const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Analyze golf shot image and extract metrics
const analyzeShotImage = async (imageBase64) => {
  try {
    console.log('🤖 Analyzing shot image with GPT-4o Vision...');
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a golf shot analyzer. Extract numeric golf shot data from simulator display images. 
          Return ONLY valid JSON with these exact fields: speed (mph), distance (yards), spin (rpm), launchAngle (degrees).
          If you cannot clearly read a value, use null for that field.
          Example: {"speed": 145.2, "distance": 285, "spin": 2450, "launchAngle": 12.5}`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Please extract the golf shot metrics from this simulator display image. Return only the JSON with speed, distance, spin, and launchAngle."
            },
            {
              type: "image_url",
              image_url: {
                url: imageBase64
              }
            }
          ]
        }
      ],
      max_tokens: 300,
      temperature: 0.1
    });

    const content = response.choices[0].message.content.trim();
    console.log('🤖 Raw OpenAI response:', content);

    // Try to parse JSON from the response
    let shotData;
    try {
      // Extract JSON from response (in case there's extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        shotData = JSON.parse(jsonMatch[0]);
      } else {
        shotData = JSON.parse(content);
      }
    } catch (parseError) {
      console.error('❌ Failed to parse OpenAI response as JSON:', parseError);
      throw new Error('Invalid response format from AI analysis');
    }

    // Validate required fields
    const requiredFields = ['speed', 'distance', 'spin', 'launchAngle'];
    const validatedData = {};
    
    for (const field of requiredFields) {
      const value = shotData[field];
      if (value !== null && value !== undefined && !isNaN(value)) {
        validatedData[field] = parseFloat(value);
      } else {
        validatedData[field] = null;
      }
    }

    console.log('✅ Extracted shot data:', validatedData);
    return validatedData;

  } catch (error) {
    console.error('❌ OpenAI analysis error:', error);
    
    if (error.code === 'insufficient_quota') {
      throw new Error('OpenAI API quota exceeded. Please try again later.');
    }
    
    if (error.code === 'invalid_api_key') {
      throw new Error('Invalid OpenAI API key configuration.');
    }
    
    throw new Error(`Failed to analyze image: ${error.message}`);
  }
};

module.exports = {
  analyzeShotImage
}; 