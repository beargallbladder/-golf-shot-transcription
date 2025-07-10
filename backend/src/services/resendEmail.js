const { Resend } = require('resend');

class ResendEmailService {
  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
    this.defaultFrom = process.env.DEFAULT_FROM_EMAIL || 'noreply@golfsimple.com';
  }

  // Retailer Customer Welcome Email
  async sendRetailerWelcome(customerEmail, retailerData, shotData) {
    const { companyName, logo, customDomain } = retailerData;
    const fromEmail = customDomain ? `welcome@${customDomain}` : this.defaultFrom;

    try {
      const { data, error } = await this.resend.emails.send({
        from: fromEmail,
        to: customerEmail,
        subject: `Welcome to ${companyName} Golf Experience!`,
        html: this.getRetailerWelcomeTemplate(customerEmail, retailerData, shotData),
        tags: [
          { name: 'type', value: 'retailer-welcome' },
          { name: 'retailer', value: retailerData.id }
        ]
      });

      if (error) {
        console.error('❌ Resend email error:', error);
        return { success: false, error };
      }

      console.log('✅ Retailer welcome email sent:', data.id);
      return { success: true, messageId: data.id };
    } catch (error) {
      console.error('❌ Resend service error:', error);
      return { success: false, error: error.message };
    }
  }

  // Shot Analysis Results Email
  async sendShotAnalysisResults(customerEmail, retailerData, analysisData) {
    const { companyName, customDomain } = retailerData;
    const fromEmail = customDomain ? `analysis@${customDomain}` : this.defaultFrom;

    try {
      const { data, error } = await this.resend.emails.send({
        from: fromEmail,
        to: customerEmail,
        subject: `Your Golf Shot Analysis from ${companyName}`,
        html: this.getShotAnalysisTemplate(customerEmail, retailerData, analysisData),
        tags: [
          { name: 'type', value: 'shot-analysis' },
          { name: 'retailer', value: retailerData.id }
        ]
      });

      if (error) {
        console.error('❌ Shot analysis email error:', error);
        return { success: false, error };
      }

      console.log('✅ Shot analysis email sent:', data.id);
      return { success: true, messageId: data.id };
    } catch (error) {
      console.error('❌ Analysis email service error:', error);
      return { success: false, error: error.message };
    }
  }

  // Equipment Recommendation Email
  async sendEquipmentRecommendations(customerEmail, retailerData, recommendations) {
    const { companyName, customDomain } = retailerData;
    const fromEmail = customDomain ? `recommendations@${customDomain}` : this.defaultFrom;

    try {
      const { data, error } = await this.resend.emails.send({
        from: fromEmail,
        to: customerEmail,
        subject: `Personalized Club Recommendations from ${companyName}`,
        html: this.getEquipmentRecommendationTemplate(customerEmail, retailerData, recommendations),
        tags: [
          { name: 'type', value: 'equipment-recommendation' },
          { name: 'retailer', value: retailerData.id }
        ]
      });

      if (error) {
        console.error('❌ Equipment recommendation email error:', error);
        return { success: false, error };
      }

      console.log('✅ Equipment recommendation email sent:', data.id);
      return { success: true, messageId: data.id };
    } catch (error) {
      console.error('❌ Equipment email service error:', error);
      return { success: false, error: error.message };
    }
  }

  // Follow-up Email (7 days after visit)
  async sendFollowUpEmail(customerEmail, retailerData, visitData) {
    const { companyName, customDomain } = retailerData;
    const fromEmail = customDomain ? `followup@${customDomain}` : this.defaultFrom;

    try {
      const { data, error } = await this.resend.emails.send({
        from: fromEmail,
        to: customerEmail,
        subject: `How's your golf game improving? - ${companyName}`,
        html: this.getFollowUpTemplate(customerEmail, retailerData, visitData),
        tags: [
          { name: 'type', value: 'follow-up' },
          { name: 'retailer', value: retailerData.id },
          { name: 'days-after', value: '7' }
        ]
      });

      if (error) {
        console.error('❌ Follow-up email error:', error);
        return { success: false, error };
      }

      console.log('✅ Follow-up email sent:', data.id);
      return { success: true, messageId: data.id };
    } catch (error) {
      console.error('❌ Follow-up email service error:', error);
      return { success: false, error: error.message };
    }
  }

  // Email Templates (Retailer-branded)

  getRetailerWelcomeTemplate(customerEmail, retailerData, shotData) {
    const { companyName, logo, address, phone, website } = retailerData;
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; background: linear-gradient(135deg, #52B788, #2D6A4F); color: white; padding: 30px; border-radius: 10px; }
        .logo { max-height: 60px; margin-bottom: 10px; }
        .content { background: white; padding: 30px; margin: 20px 0; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .shot-stats { background: #f8fffe; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .cta-button { display: inline-block; background: #52B788; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; color: #666; font-size: 14px; padding: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          ${logo ? `<img src="${logo}" alt="${companyName}" class="logo" />` : ''}
          <h1>Welcome to ${companyName}! 🏌️</h1>
          <p>Thanks for trying our golf simulator experience</p>
        </div>
        
        <div class="content">
          <h2>Great shot analysis from your visit! 🎯</h2>
          
          <div class="shot-stats">
            <h3>Your Session Summary:</h3>
            <ul>
              <li><strong>Total Shots:</strong> ${shotData.totalShots || 'Multiple'}</li>
              <li><strong>Best Distance:</strong> ${shotData.bestDistance || 'Excellent'} yards</li>
              <li><strong>Favorite Club:</strong> ${shotData.favoriteClub || 'Driver'}</li>
              <li><strong>Accuracy Rate:</strong> ${shotData.accuracy || '85'}%</li>
            </ul>
          </div>
          
          <p>We've saved your shot data and you can continue tracking your progress online!</p>
          
          <a href="https://golfsimple.com/profile?retailer=${retailerData.id}" class="cta-button">
            📊 View Your Complete Analysis
          </a>
          
          <h3>What's Next?</h3>
          <ul>
            <li>📱 Keep tracking shots with our mobile app</li>
            <li>🏆 Compete on global leaderboards</li>
            <li>🎯 Get personalized club recommendations</li>
            <li>📈 Track your improvement over time</li>
          </ul>
          
          <p>Have questions about your swing or equipment? Our team at ${companyName} is here to help!</p>
        </div>
        
        <div class="footer">
          <p><strong>${companyName}</strong></p>
          ${address ? `<p>📍 ${address}</p>` : ''}
          ${phone ? `<p>📞 ${phone}</p>` : ''}
          ${website ? `<p>🌐 <a href="${website}">${website}</a></p>` : ''}
          <p>Powered by <a href="https://golfsimple.com">GolfSimple</a></p>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  getShotAnalysisTemplate(customerEmail, retailerData, analysisData) {
    const { companyName } = retailerData;
    const { distance, club, accuracy, recommendations } = analysisData;
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; background: linear-gradient(135deg, #52B788, #2D6A4F); color: white; padding: 30px; border-radius: 10px; }
        .analysis-card { background: white; padding: 25px; margin: 20px 0; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .metric { display: inline-block; background: #f8fffe; padding: 15px; margin: 10px; border-radius: 8px; text-align: center; min-width: 120px; }
        .recommendations { background: #e8f5f1; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .cta-button { display: inline-block; background: #52B788; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Your Shot Analysis 📊</h1>
          <p>Detailed insights from ${companyName}</p>
        </div>
        
        <div class="analysis-card">
          <h2>Shot Performance Metrics</h2>
          
          <div class="metric">
            <h3>${distance || '250'}</h3>
            <p>Yards</p>
          </div>
          
          <div class="metric">
            <h3>${club || 'Driver'}</h3>
            <p>Club Used</p>
          </div>
          
          <div class="metric">
            <h3>${accuracy || '88'}%</h3>
            <p>Accuracy</p>
          </div>
          
          <div class="recommendations">
            <h3>💡 Improvement Recommendations:</h3>
            <ul>
              ${recommendations?.map(rec => `<li>${rec}</li>`).join('') || 
                '<li>Focus on follow-through for better distance</li><li>Consider club fitting for optimal performance</li>'}
            </ul>
          </div>
          
          <a href="https://golfsimple.com/capture?retailer=${retailerData.id}" class="cta-button">
            📱 Capture More Shots
          </a>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  getEquipmentRecommendationTemplate(customerEmail, retailerData, recommendations) {
    const { companyName, inventory } = retailerData;
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; background: linear-gradient(135deg, #52B788, #2D6A4F); color: white; padding: 30px; border-radius: 10px; }
        .product-card { background: white; padding: 20px; margin: 15px 0; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); border-left: 4px solid #52B788; }
        .price { color: #52B788; font-weight: bold; font-size: 18px; }
        .cta-button { display: inline-block; background: #52B788; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏌️ Equipment Recommendations</h1>
          <p>Based on your swing analysis at ${companyName}</p>
        </div>
        
        <div class="product-card">
          <h3>🏆 Recommended Driver</h3>
          <p><strong>TaylorMade Stealth 2 Driver</strong></p>
          <p>Perfect for your swing speed and launch angle. Could add 15-20 yards to your distance.</p>
          <p class="price">$549.99</p>
          <a href="#" class="cta-button">View at ${companyName}</a>
        </div>
        
        <div class="product-card">
          <h3>🎯 Iron Set Upgrade</h3>
          <p><strong>Callaway Rogue ST Max Irons</strong></p>
          <p>Game improvement irons that match your skill level perfectly. Enhanced forgiveness and distance.</p>
          <p class="price">$899.99</p>
          <a href="#" class="cta-button">Schedule Fitting</a>
        </div>
        
        <p>Want a professional fitting? Our team at ${companyName} can help optimize your equipment for maximum performance!</p>
      </div>
    </body>
    </html>
    `;
  }

  getFollowUpTemplate(customerEmail, retailerData, visitData) {
    const { companyName } = retailerData;
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; background: linear-gradient(135deg, #52B788, #2D6A4F); color: white; padding: 30px; border-radius: 10px; }
        .content { background: white; padding: 30px; margin: 20px 0; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .progress-item { background: #f8fffe; padding: 15px; margin: 10px 0; border-radius: 8px; }
        .cta-button { display: inline-block; background: #52B788; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 10px 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>How's Your Golf Game? 🏌️</h1>
          <p>It's been a week since your visit to ${companyName}</p>
        </div>
        
        <div class="content">
          <h2>We hope you've been practicing! 🎯</h2>
          
          <p>Since your simulator session, have you had a chance to work on those recommendations we discussed?</p>
          
          <div class="progress-item">
            <h3>📊 Track Your Progress</h3>
            <p>Keep logging your shots to see improvement over time. Many golfers see 10-15% improvement in their first month!</p>
          </div>
          
          <div class="progress-item">
            <h3>🏆 Join Competitions</h3>
            <p>Challenge other golfers in our leaderboards. Perfect way to stay motivated!</p>
          </div>
          
          <a href="https://golfsimple.com/capture?retailer=${retailerData.id}" class="cta-button">📱 Log New Shots</a>
          <a href="https://golfsimple.com/leaderboard" class="cta-button">🏆 View Leaderboard</a>
          
          <h3>Need Help?</h3>
          <p>Our team at ${companyName} is always here to help with:</p>
          <ul>
            <li>🏌️ Swing analysis and lessons</li>
            <li>🎯 Equipment fitting and recommendations</li>
            <li>📈 Progress tracking and goal setting</li>
            <li>🤝 Group lessons and challenges</li>
          </ul>
          
          <p>Come back anytime for another simulator session!</p>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  // Analytics and Reporting
  async getEmailStats(retailerId, startDate, endDate) {
    try {
      // This would integrate with Resend's analytics API when available
      // For now, we'll simulate the response
      return {
        sent: 156,
        delivered: 152,
        opened: 89,
        clicked: 34,
        bounced: 2,
        openRate: '58.6%',
        clickRate: '22.4%',
        bounceRate: '1.3%'
      };
    } catch (error) {
      console.error('❌ Email stats error:', error);
      return { error: error.message };
    }
  }

  // Webhook handler for email events
  async handleWebhook(event) {
    const { type, data } = event;
    
    console.log(`📧 Email webhook: ${type}`, data);
    
    // Update database with email events
    switch (type) {
      case 'email.delivered':
        // Track successful delivery
        break;
      case 'email.opened':
        // Track email opens
        break;
      case 'email.clicked':
        // Track link clicks
        break;
      case 'email.bounced':
        // Handle bounces
        break;
    }
    
    return { success: true };
  }
}

module.exports = new ResendEmailService();