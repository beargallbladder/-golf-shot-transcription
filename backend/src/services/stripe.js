
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class StripeService {
  async createCustomer(userData) {
    return await stripe.customers.create({
      email: userData.email,
      name: userData.name
    });
  }
}

module.exports = StripeService;
    