const express = require('express');
const router = express.Router();
const resendEmail = require('../services/resendEmail');
const queueManager = require('../services/queueManager');

// Send welcome email to customer after simulator session
router.post('/welcome', async (req, res) => {
  try {
    const { customerEmail, retailerId, shotData } = req.body;
    
    // Get retailer data (would come from database)
    const retailerData = {
      id: retailerId,
      companyName: 'Golf World Pro Shop',
      logo: 'https://example.com/logo.png',
      address: '123 Golf Course Dr, City, State 12345',
      phone: '(555) 123-GOLF',
      website: 'https://golfworldproshop.com',
      customDomain: 'golfworldproshop.com'
    };

    // Queue the email to avoid blocking the response
    await queueManager.addJob('email', 'retailer-welcome', {
      customerEmail,
      retailerData,
      shotData
    });

    res.json({ 
      success: true, 
      message: 'Welcome email queued successfully' 
    });
  } catch (error) {
    console.error('❌ Welcome email error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Send shot analysis results
router.post('/analysis-results', async (req, res) => {
  try {
    const { customerEmail, retailerId, analysisData } = req.body;
    
    const retailerData = await getRetailerData(retailerId);
    
    await queueManager.addJob('email', 'analysis-results', {
      customerEmail,
      retailerData,
      analysisData
    });

    res.json({ 
      success: true, 
      message: 'Analysis email queued successfully' 
    });
  } catch (error) {
    console.error('❌ Analysis email error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Send equipment recommendations
router.post('/equipment-recommendations', async (req, res) => {
  try {
    const { customerEmail, retailerId, recommendations } = req.body;
    
    const retailerData = await getRetailerData(retailerId);
    
    await queueManager.addJob('email', 'equipment-recommendations', {
      customerEmail,
      retailerData,
      recommendations
    });

    res.json({ 
      success: true, 
      message: 'Equipment recommendations queued successfully' 
    });
  } catch (error) {
    console.error('❌ Equipment email error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Schedule follow-up email (7 days after visit)
router.post('/schedule-followup', async (req, res) => {
  try {
    const { customerEmail, retailerId, visitData } = req.body;
    
    const retailerData = await getRetailerData(retailerId);
    
    // Schedule email for 7 days from now
    const delayMs = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
    
    await queueManager.addJob('email', 'follow-up', {
      customerEmail,
      retailerData,
      visitData
    }, { delay: delayMs });

    res.json({ 
      success: true, 
      message: 'Follow-up email scheduled for 7 days' 
    });
  } catch (error) {
    console.error('❌ Follow-up email error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get email analytics for retailer
router.get('/analytics/:retailerId', async (req, res) => {
  try {
    const { retailerId } = req.params;
    const { startDate, endDate } = req.query;
    
    const stats = await resendEmail.getEmailStats(retailerId, startDate, endDate);
    
    res.json({ 
      success: true, 
      retailerId,
      period: { startDate, endDate },
      stats 
    });
  } catch (error) {
    console.error('❌ Email analytics error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Webhook endpoint for Resend email events
router.post('/webhook', async (req, res) => {
  try {
    const event = req.body;
    
    await resendEmail.handleWebhook(event);
    
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Email webhook error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Automated email sequence endpoint
router.post('/sequence/start', async (req, res) => {
  try {
    const { customerEmail, retailerId, sequenceType, customerData } = req.body;
    
    const retailerData = await getRetailerData(retailerId);
    
    switch (sequenceType) {
      case 'new-customer':
        // Immediate welcome email
        await queueManager.addJob('email', 'retailer-welcome', {
          customerEmail,
          retailerData,
          shotData: customerData.shotData
        });
        
        // Equipment recommendations (3 hours later)
        await queueManager.addJob('email', 'equipment-recommendations', {
          customerEmail,
          retailerData,
          recommendations: customerData.recommendations
        }, { delay: 3 * 60 * 60 * 1000 });
        
        // Follow-up (7 days later)
        await queueManager.addJob('email', 'follow-up', {
          customerEmail,
          retailerData,
          visitData: customerData.visitData
        }, { delay: 7 * 24 * 60 * 60 * 1000 });
        
        break;
        
      case 'equipment-interest':
        // Immediate equipment email
        await queueManager.addJob('email', 'equipment-recommendations', {
          customerEmail,
          retailerData,
          recommendations: customerData.recommendations
        });
        
        // Follow-up in 3 days
        await queueManager.addJob('email', 'equipment-followup', {
          customerEmail,
          retailerData,
          recommendations: customerData.recommendations
        }, { delay: 3 * 24 * 60 * 60 * 1000 });
        
        break;
    }
    
    res.json({ 
      success: true, 
      message: `Email sequence '${sequenceType}' started successfully` 
    });
  } catch (error) {
    console.error('❌ Email sequence error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Helper function to get retailer data
async function getRetailerData(retailerId) {
  // This would fetch from your database
  // For now, returning mock data
  return {
    id: retailerId,
    companyName: 'Golf World Pro Shop',
    logo: 'https://example.com/logo.png',
    address: '123 Golf Course Dr, City, State 12345',
    phone: '(555) 123-GOLF',
    website: 'https://golfworldproshop.com',
    customDomain: 'golfworldproshop.com',
    inventory: [
      { name: 'TaylorMade Stealth 2 Driver', price: 549.99 },
      { name: 'Callaway Rogue ST Max Irons', price: 899.99 }
    ]
  };
}

module.exports = router;