// Social Share Graphics Service
// Generates enhanced share content for golf shots

/**
 * Generate engaging share text for a golf shot
 * @param {Object} shotData - The shot data
 * @returns {Object} Share content with title, description, and hashtags
 */
function generateShareContent(shotData) {
  const { speed, distance, spin, launchAngle, user, club } = shotData;
  
  // Create engaging title based on distance
  let title = `${user.name}'s Golf Shot`;
  let emoji = '🏌️‍♂️';
  let excitement = '';
  
  if (distance) {
    if (distance >= 300) {
      emoji = '💥';
      excitement = 'CRUSHING IT!';
    } else if (distance >= 250) {
      emoji = '🔥';
      excitement = 'Still pounding it!';
    } else if (distance >= 200) {
      emoji = '⚡';
      excitement = 'Not bad!';
    } else {
      emoji = '🎯';
      excitement = 'Dialed in!';
    }
    
    title = `${distance} yards! ${excitement} ${emoji}`;
  }
  
  // Create detailed description
  const metrics = [];
  if (distance) metrics.push(`${distance} yards`);
  if (speed) metrics.push(`${speed.toFixed(1)} mph`);
  if (spin) metrics.push(`${spin} rpm spin`);
  if (launchAngle) metrics.push(`${launchAngle.toFixed(1)}° launch`);
  if (club) metrics.push(`${club}`);
  
  const description = metrics.length > 0 
    ? `${metrics.join(' • ')} • Can you beat this?`
    : 'Check out this golf shot analysis!';
  
  // Generate hashtags
  const hashtags = ['#Golf', '#BeatMyBag', '#GolfShot'];
  if (club) hashtags.push(`#${club.replace(/\s+/g, '')}`);
  if (distance >= 250) hashtags.push('#LongDrive');
  hashtags.push('#GolfData', '#TrackMan');
  
  return {
    title,
    description,
    hashtags: hashtags.join(' '),
    socialText: `${title}\n\n${description}\n\n${hashtags.join(' ')}`,
    excitement,
    emoji
  };
}

/**
 * Generate Open Graph meta tags for social sharing
 * @param {Object} shotData - The shot data
 * @param {string} shotUrl - The share URL
 * @returns {Object} Meta tags for social sharing
 */
function generateMetaTags(shotData, shotUrl) {
  const shareContent = generateShareContent(shotData);
  const { user, distance, speed } = shotData;
  
  return {
    // Open Graph tags
    'og:title': shareContent.title,
    'og:description': shareContent.description,
    'og:type': 'website',
    'og:url': shotUrl,
    'og:site_name': 'Beat My Bag - Golf Shot Analysis',
    'og:image': `https://golf-shot-transcription.onrender.com/api/share/image/${shotData.id}`, // We'll create this endpoint
    'og:image:width': '1200',
    'og:image:height': '630',
    'og:image:alt': `${user.name}'s golf shot: ${distance || 'N/A'} yards`,
    
    // Twitter Card tags
    'twitter:card': 'summary_large_image',
    'twitter:title': shareContent.title,
    'twitter:description': shareContent.description,
    'twitter:image': `https://golf-shot-transcription.onrender.com/api/share/image/${shotData.id}`,
    'twitter:creator': '@BeatMyBag',
    'twitter:site': '@BeatMyBag',
    
    // Additional meta tags
    'description': shareContent.description,
    'keywords': 'golf, shot analysis, golf data, trackman, golf simulator, beat my bag',
    
    // Structured data for rich snippets
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'SportsEvent',
      'name': shareContent.title,
      'description': shareContent.description,
      'sport': 'Golf',
      'performer': {
        '@type': 'Person',
        'name': user.name,
        'image': user.avatar
      },
      'result': {
        '@type': 'Result',
        'value': distance ? `${distance} yards` : 'Golf shot analysis'
      }
    }
  };
}

/**
 * Generate share content for different platforms
 * @param {Object} shotData - The shot data
 * @param {string} shotUrl - The share URL
 * @returns {Object} Platform-specific share content
 */
function generatePlatformShares(shotData, shotUrl) {
  const shareContent = generateShareContent(shotData);
  const { distance, user } = shotData;
  
  return {
    twitter: {
      text: `${shareContent.title}\n\n${shareContent.description}\n\n${shareContent.hashtags}`,
      url: shotUrl,
      via: 'BeatMyBag'
    },
    
    facebook: {
      quote: shareContent.socialText,
      hashtag: '#BeatMyBag',
      url: shotUrl
    },
    
    linkedin: {
      title: shareContent.title,
      summary: shareContent.description,
      url: shotUrl,
      source: 'Beat My Bag'
    },
    
    whatsapp: {
      text: `${shareContent.title}\n\nCheck out this golf shot: ${shareContent.description}\n\n${shotUrl}`
    },
    
    instagram: {
      caption: `${shareContent.title}\n\n${shareContent.description}\n\n${shareContent.hashtags}\n\nLink in bio! 🔗`
    },
    
    generic: {
      title: shareContent.title,
      text: shareContent.socialText,
      url: shotUrl
    }
  };
}

/**
 * Generate golf-themed visual data for frontend rendering
 * @param {Object} shotData - The shot data
 * @returns {Object} Visual styling and content suggestions
 */
function generateVisualTheme(shotData) {
  const { distance, speed, club } = shotData;
  
  // Determine color scheme based on performance
  let colorScheme = 'green'; // default golf green
  let backgroundGradient = 'from-green-500 to-green-600';
  let accentColor = 'emerald';
  
  if (distance) {
    if (distance >= 300) {
      colorScheme = 'gold';
      backgroundGradient = 'from-yellow-400 to-orange-500';
      accentColor = 'yellow';
    } else if (distance >= 250) {
      colorScheme = 'blue';
      backgroundGradient = 'from-blue-500 to-blue-600';
      accentColor = 'blue';
    }
  }
  
  // Golf course imagery suggestions
  const backgroundSuggestions = [
    'rolling-green-hills',
    'golf-course-fairway',
    'morning-dew-grass',
    'sunset-golf-course',
    'pristine-putting-green'
  ];
  
  // Emoji and icons based on shot quality
  const icons = {
    primary: shotData.distance >= 250 ? '💥' : '🏌️‍♂️',
    secondary: shotData.distance >= 300 ? '🔥' : '⚡',
    club: club === 'Driver' ? '🏌️‍♂️' : club === 'Iron' ? '🎯' : '🏌️'
  };
  
  return {
    colorScheme,
    backgroundGradient,
    accentColor,
    backgroundSuggestions,
    icons,
    mood: distance >= 250 ? 'powerful' : 'precise',
    atmosphere: 'sunday-golf-with-buddies'
  };
}

module.exports = {
  generateShareContent,
  generateMetaTags,
  generatePlatformShares,
  generateVisualTheme
}; 