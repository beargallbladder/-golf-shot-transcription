const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Enhanced analysis for retailer accounts
const analyzeRetailerShotImage = async (imageBase64, options = {}) => {
  try {
    console.log('🔍 Starting ENHANCED retailer shot analysis...');
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You are a professional golf club fitting expert analyzing a golf simulator shot. Extract ALL possible data from this image with MAXIMUM detail for professional fitting purposes.

CRITICAL REQUIREMENTS:
1. Extract basic shot metrics (speed, distance, spin, launch angle)
2. Identify club specifications with as much detail as possible
3. Analyze swing characteristics and ball flight
4. Provide fitting recommendations
5. Return data in JSON format ONLY - no other text

Extract these fields (use null if not visible):
{
  "speed": number (ball speed in mph),
  "distance": number (total distance in yards),
  "spin": number (backspin in rpm),
  "launchAngle": number (launch angle in degrees),
  "club": "string (e.g., 'Driver', '7-Iron', 'Pitching Wedge')",
  "clubBrand": "string (e.g., 'TaylorMade', 'Callaway', 'Titleist')",
  "clubModel": "string (e.g., 'SIM2 Max', 'Rogue ST', 'TSi3')",
  "shaftType": "string (e.g., 'Graphite', 'Steel')",
  "shaftFlex": "string (e.g., 'Regular', 'Stiff', 'X-Stiff')",
  "gripType": "string (grip manufacturer/model if visible)",
  "loftAngle": number (club loft in degrees if visible),
  "lieAngle": number (lie angle in degrees if visible),
  "clubheadSpeed": number (clubhead speed in mph if different from ball speed),
  "smashFactor": number (ball speed / clubhead speed if calculable),
  "carryDistance": number (carry distance if different from total),
  "rollDistance": number (roll distance if visible),
  "sideDistance": number (side distance/deviation if visible),
  "peakHeight": number (max height in yards if visible),
  "descentAngle": number (descent angle in degrees if visible),
  "fittingNotes": "string (professional observations about swing, ball flight, club performance)",
  "recommendations": "string (fitting recommendations based on data)"
}`
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
      max_tokens: 1000,
      temperature: 0.1
    });

    const content = response.choices[0].message.content.trim();
    console.log('🤖 GPT-4o raw response:', content);

    // Parse JSON response
    let shotData;
    try {
      shotData = JSON.parse(content);
    } catch (parseError) {
      console.error('❌ JSON parsing failed, attempting to extract JSON from response');
      // Try to extract JSON from response if wrapped in other text
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        shotData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse JSON from GPT response');
      }
    }

    // Validate required fields
    if (!shotData.speed && !shotData.distance) {
      throw new Error('Could not extract basic shot metrics from image');
    }

    console.log('✅ Enhanced shot analysis completed:', {
      basic: { speed: shotData.speed, distance: shotData.distance, club: shotData.club },
      enhanced: { brand: shotData.clubBrand, model: shotData.clubModel, shaft: shotData.shaftType }
    });

    return shotData;

  } catch (error) {
    console.error('❌ Enhanced shot analysis failed:', error);
    throw new Error(`AI analysis failed: ${error.message}`);
  }
};

// Original consumer analysis (keep existing functionality)
const analyzeShotImage = async (imageBase64) => {
  try {
    console.log('🔍 Starting consumer shot analysis...');
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this golf simulator screenshot and extract the shot data. Return ONLY a JSON object with these exact fields:

{
  "speed": number (ball speed in mph, null if not visible),
  "distance": number (total distance in yards, null if not visible), 
  "spin": number (backspin in rpm, null if not visible),
  "launchAngle": number (launch angle in degrees, null if not visible),
  "club": "string (inferred club type based on distance - e.g., 'Driver' for 250+ yards, '7-Iron' for 150-170 yards, 'Pitching Wedge' for 100-130 yards, etc. Use null if cannot infer)"
}

CRITICAL: Return ONLY the JSON object, no other text. If you cannot read specific values, use null for those fields.`
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
    console.log('🤖 GPT-4o raw response:', content);

    // Parse JSON response
    let shotData;
    try {
      shotData = JSON.parse(content);
    } catch (parseError) {
      console.error('❌ JSON parsing failed, attempting to extract JSON from response');
      // Try to extract JSON from response if wrapped in other text
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        shotData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse JSON from GPT response');
      }
    }

    // Validate we got some data
    if (!shotData.speed && !shotData.distance) {
      throw new Error('Could not extract shot data from image');
    }

    console.log('✅ Shot analysis completed:', shotData);
    return shotData;

  } catch (error) {
    console.error('❌ Shot analysis failed:', error);
    throw new Error(`AI analysis failed: ${error.message}`);
  }
};

module.exports = {
  analyzeShotImage,
  analyzeRetailerShotImage
}; 