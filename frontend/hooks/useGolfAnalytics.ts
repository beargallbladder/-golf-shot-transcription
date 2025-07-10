
import { useEffect } from 'react';

export const useGolfAnalytics = () => {
  const trackShotUpload = (shotData) => {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'shot_uploaded', {
        event_category: 'Golf Analysis',
        event_label: `${shotData.club} - ${shotData.distance}y`,
        value: shotData.distance
      });
    }
  };

  return { trackShotUpload };
};
    