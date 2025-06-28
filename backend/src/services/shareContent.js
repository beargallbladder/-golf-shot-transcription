// Enhanced social sharing content generation
const generateShareContent = (shotData) => {
  const { speed, distance, spin, launchAngle, club, user } = shotData;
  
  // Generate fun, golf-themed share messages
  const shareMessages = [
    `💥 ${distance} yards! Still pounding it! 🏌️‍♂️`,
    `🔥 ${distance} yards with the ${club || 'iron'}! Not bad... 🎯`,
    `⚡ ${speed} mph ball speed! Someone's been working out 💪`,
    `🚀 ${distance} yards! Beat that if you can! 🏆`,
    `💪 Crushed it ${distance} yards! Your turn! 🎯`,
    `🎯 ${distance} yards of pure power! 🔥`,
    `⛳ ${distance} yards! Still got it! 🏌️‍♂️`
  ];
  
  // Pick a random message or choose based on performance
  let message;
  if (distance >= 280) {
    message = `🚀 BOMBED IT ${distance} YARDS! 💥 Beat that! 🏆`;
  } else if (distance >= 250) {
    message = `🔥 ${distance} yards! Still pounding it! 💪`;
  } else if (distance >= 200) {
    message = `⚡ ${distance} yards! Not bad... your turn! 🎯`;
  } else {
    message = `🏌️‍♂️ ${distance} yards! Working on it! 📈`;
  }
  
  return {
    title: `${user.name}'s Golf Shot - ${distance} yards`,
    description: `${message} | Speed: ${speed} mph | Spin: ${spin} rpm | Launch: ${launchAngle}°`,
    shareText: message,
    hashtags: '#golf #beatmybag #golfshot #trackman #simulator',
    twitterText: `${message} beatmybag.com 🏌️‍♂️ #golf #beatmybag`,
    facebookText: `${message}\n\nCheck out beatmybag.com to analyze your own shots! 🏌️‍♂️`,
    instagramText: `${message} 🏌️‍♂️\n\n#golf #beatmybag #golfshot #simulator #trackman`
  };
};

// Generate enhanced meta tags for social sharing
const generateSocialMetaTags = (shotData, shareUrl) => {
  const content = generateShareContent(shotData);
  const { user, distance, speed, spin, launchAngle } = shotData;
  
  return {
    // Basic meta
    title: content.title,
    description: content.description,
    
    // Open Graph (Facebook, LinkedIn, etc.)
    ogTitle: content.title,
    ogDescription: `Distance: ${distance} yards | Speed: ${speed} mph | Spin: ${spin} rpm | Launch: ${launchAngle}°`,
    ogType: 'website',
    ogUrl: shareUrl,
    ogSiteName: 'Beat My Bag - Golf Shot Analysis',
    
    // Twitter Card
    twitterCard: 'summary_large_image',
    twitterTitle: content.title,
    twitterDescription: content.description,
    twitterSite: '@beatmybag',
    
    // Additional
    author: user.name,
    keywords: 'golf, shot analysis, trackman, golf simulator, beat my bag'
  };
};

// Generate share URLs for different platforms
const generateShareUrls = (shotData, shareUrl) => {
  const content = generateShareContent(shotData);
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(content.shareText);
  
  return {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(content.twitterText)}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
    email: `mailto:?subject=${encodeURIComponent(content.title)}&body=${encodeURIComponent(content.shareText + '\n\n' + shareUrl)}`,
    copy: shareUrl
  };
};

// Generate performance insights for sharing
const generatePerformanceInsights = (shotData) => {
  const { speed, distance, spin, launchAngle } = shotData;
  
  const insights = [];
  
  // Distance insights
  if (distance >= 300) insights.push("💥 MONSTER DRIVE!");
  else if (distance >= 280) insights.push("🚀 Crushing it!");
  else if (distance >= 250) insights.push("💪 Solid power!");
  else if (distance >= 200) insights.push("📈 Getting there!");
  
  // Speed insights  
  if (speed >= 120) insights.push("⚡ Lightning fast!");
  else if (speed >= 110) insights.push("🔥 Great speed!");
  else if (speed >= 100) insights.push("💨 Good velocity!");
  
  // Spin insights
  if (spin < 2000) insights.push("🎯 Low spin bomber!");
  else if (spin > 4000) insights.push("🌪️ High spin control!");
  
  // Launch angle insights
  if (launchAngle >= 15) insights.push("🚁 High launch!");
  else if (launchAngle <= 8) insights.push("🏹 Penetrating flight!");
  
  return insights;
};

module.exports = {
  generateShareContent,
  generateSocialMetaTags,
  generateShareUrls,
  generatePerformanceInsights
}; 