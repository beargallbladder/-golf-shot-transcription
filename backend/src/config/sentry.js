
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  beforeSend(event) {
    if (event.request?.data?.imageBase64) {
      event.request.data.imageBase64 = '[REDACTED]';
    }
    return event;
  }
});

module.exports = Sentry;
    