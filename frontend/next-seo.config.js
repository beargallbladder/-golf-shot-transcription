/** @type {import('next-seo').DefaultSeoProps} */
const defaultSEOConfig = {
  title: 'GolfSimple - AI Golf Shot Analyzer & Improvement Platform',
  description: 'Transform your golf game with AI-powered shot analysis, real-time leaderboards, and intelligent club recommendations. Join thousands of golfers improving their game.',
  canonical: 'https://golfsimple.com',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://golfsimple.com',
    siteName: 'GolfSimple',
    title: 'GolfSimple - AI Golf Shot Analyzer & Improvement Platform',
    description: 'Transform your golf game with AI-powered shot analysis, real-time leaderboards, and intelligent club recommendations. Join thousands of golfers improving their game.',
    images: [
      {
        url: 'https://golfsimple.com/images/og/golfsimple-hero.jpg',
        width: 1200,
        height: 630,
        alt: 'GolfSimple - AI Golf Shot Analysis Platform',
        type: 'image/jpeg',
      },
      {
        url: 'https://golfsimple.com/images/og/golfsimple-mobile.jpg',
        width: 800,
        height: 600,
        alt: 'GolfSimple Mobile App - Track Your Golf Progress',
        type: 'image/jpeg',
      }
    ],
  },
  twitter: {
    handle: '@golfsimple',
    site: '@golfsimple',
    cardType: 'summary_large_image',
  },
  additionalMetaTags: [
    {
      name: 'keywords',
      content: 'golf, golf shot analyzer, golf improvement, AI golf coach, golf tracking, golf leaderboards, golf clubs, golf tips, golf equipment, golf analytics, golf performance, golf fitting'
    },
    {
      name: 'author',
      content: 'GolfSimple Team'
    },
    {
      name: 'robots',
      content: 'index,follow'
    },
    {
      name: 'googlebot',
      content: 'index,follow'
    },
    {
      name: 'google',
      content: 'notranslate'
    },
    {
      name: 'format-detection',
      content: 'telephone=no'
    },
    {
      name: 'mobile-web-app-capable',
      content: 'yes'
    },
    {
      name: 'apple-mobile-web-app-capable',
      content: 'yes'
    },
    {
      name: 'apple-mobile-web-app-status-bar-style',
      content: 'black-translucent'
    },
    {
      name: 'apple-mobile-web-app-title',
      content: 'GolfSimple'
    },
    {
      name: 'application-name',
      content: 'GolfSimple'
    },
    {
      name: 'msapplication-TileColor',
      content: '#52B788'
    },
    {
      name: 'theme-color',
      content: '#52B788'
    },
    {
      name: 'geo.region',
      content: 'US'
    },
    {
      name: 'geo.placename',
      content: 'United States'
    },
    {
      name: 'rating',
      content: 'general'
    },
    {
      name: 'distribution',
      content: 'global'
    }
  ],
  additionalLinkTags: [
    {
      rel: 'icon',
      href: '/favicon.ico',
    },
    {
      rel: 'apple-touch-icon',
      href: '/images/branding/apple-touch-icon.png',
      sizes: '180x180'
    },
    {
      rel: 'manifest',
      href: '/manifest.json'
    },
    {
      rel: 'preconnect',
      href: 'https://fonts.googleapis.com'
    },
    {
      rel: 'preconnect',
      href: 'https://fonts.gstatic.com',
      crossOrigin: 'anonymous'
    },
    {
      rel: 'dns-prefetch',
      href: 'https://api.golfsimple.com'
    },
    {
      rel: 'preload',
      href: '/images/branding/logo.png',
      as: 'image',
      type: 'image/png'
    }
  ],
};

// Page-specific SEO configurations
export const pageConfigs = {
  leaderboard: {
    title: 'Golf Leaderboards - Compete with Golfers Worldwide | GolfSimple',
    description: 'Compete in real-time golf leaderboards. Track distance, accuracy, and consistency. Challenge friends and climb the rankings in the ultimate golf competition platform.',
    canonical: 'https://golfsimple.com/leaderboard',
    openGraph: {
      title: 'Golf Leaderboards - Compete with Golfers Worldwide',
      description: 'Compete in real-time golf leaderboards. Track distance, accuracy, and consistency.',
      images: [
        {
          url: 'https://golfsimple.com/images/og/leaderboard.jpg',
          width: 1200,
          height: 630,
          alt: 'GolfSimple Leaderboards - Compete with Golfers Worldwide'
        }
      ]
    }
  },
  
  myBag: {
    title: 'My Golf Bag - Club Analysis & Recommendations | GolfSimple',
    description: 'Analyze your golf club performance with AI-powered insights. Get distance analysis, gap recommendations, and equipment optimization suggestions.',
    canonical: 'https://golfsimple.com/my-bag',
    openGraph: {
      title: 'My Golf Bag - Club Analysis & Recommendations',
      description: 'Analyze your golf club performance with AI-powered insights.',
      images: [
        {
          url: 'https://golfsimple.com/images/og/my-bag.jpg',
          width: 1200,
          height: 630,
          alt: 'GolfSimple My Bag - Golf Club Analysis'
        }
      ]
    }
  },
  
  capture: {
    title: 'Golf Shot Analyzer - Capture & Analyze Your Shots | GolfSimple',
    description: 'Upload golf shots for instant AI analysis. Get distance, club recommendations, and improvement tips. Voice transcription and image analysis available.',
    canonical: 'https://golfsimple.com/capture',
    openGraph: {
      title: 'Golf Shot Analyzer - Capture & Analyze Your Shots',
      description: 'Upload golf shots for instant AI analysis. Get distance, club recommendations, and improvement tips.',
      images: [
        {
          url: 'https://golfsimple.com/images/og/shot-analyzer.jpg',
          width: 1200,
          height: 630,
          alt: 'GolfSimple Shot Analyzer - AI Golf Analysis'
        }
      ]
    }
  },
  
  profile: {
    title: 'Golf Profile & Stats - Track Your Progress | GolfSimple',
    description: 'View your golf statistics, achievements, and progress over time. Track improvements in distance, accuracy, and consistency.',
    canonical: 'https://golfsimple.com/profile'
  },
  
  retailer: {
    title: 'Golf Retailer Dashboard - Customer Insights & Analytics | GolfSimple',
    description: 'Advanced golf retailer analytics platform. Understand customer equipment needs, track performance trends, and optimize inventory with AI insights.',
    canonical: 'https://golfsimple.com/retailer',
    noindex: true, // Private retailer pages
  }
};

// Structured data schemas
export const structuredData = {
  organization: {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'GolfSimple',
    url: 'https://golfsimple.com',
    logo: 'https://golfsimple.com/images/branding/logo.png',
    description: 'AI-powered golf shot analysis and improvement platform',
    foundingDate: '2024',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-555-GOLF-123',
      contactType: 'customer service',
      availableLanguage: 'English'
    },
    sameAs: [
      'https://twitter.com/golfsimple',
      'https://facebook.com/golfsimple',
      'https://instagram.com/golfsimple',
      'https://linkedin.com/company/golfsimple'
    ]
  },
  
  webApplication: {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'GolfSimple',
    url: 'https://golfsimple.com',
    description: 'AI-powered golf shot analysis and improvement platform',
    applicationCategory: 'SportsApplication',
    operatingSystem: 'Web, iOS, Android',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    },
    featureList: [
      'AI Golf Shot Analysis',
      'Real-time Leaderboards', 
      'Club Performance Analytics',
      'Voice Transcription',
      'Equipment Recommendations',
      'Progress Tracking'
    ]
  },
  
  faqPage: {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How does GolfSimple analyze my golf shots?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'GolfSimple uses advanced AI and computer vision to analyze golf shot images and videos. Our system can identify club type, estimate distance, and provide improvement recommendations based on your swing and ball flight.'
        }
      },
      {
        '@type': 'Question',
        name: 'Is GolfSimple free to use?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! GolfSimple offers a free tier with basic shot analysis and leaderboard features. Premium features include unlimited analysis, detailed club recommendations, and advanced analytics.'
        }
      },
      {
        '@type': 'Question',
        name: 'Can I compete with other golfers?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Absolutely! GolfSimple features real-time leaderboards where you can compete in distance, accuracy, and consistency challenges with golfers worldwide or just your friends.'
        }
      },
      {
        '@type': 'Question',
        name: 'Does GolfSimple work on mobile devices?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, GolfSimple is designed mobile-first and works perfectly on smartphones and tablets. You can capture shots directly with your camera and get instant analysis.'
        }
      }
    ]
  }
};

export default defaultSEOConfig;