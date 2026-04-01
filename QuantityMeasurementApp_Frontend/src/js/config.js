// ============================================================
// config.js — Central configuration and shared constants
// When running via npm start, the proxy in bs-config.js
// forwards /api/* to the .NET backend automatically.
// ============================================================

const CONFIG = {
  API:         '/api/v1',
  TOKEN_KEY:   'qm_token',
  REFRESH_KEY: 'qm_refresh',

  // UC19: Paste your Google OAuth Client ID here
  // Get it from Google Cloud Console → APIs & Services → Credentials
  GOOGLE_CLIENT_ID: '1086320009938-trpein80mt33nam412hvbe4jsng9fbl3.apps.googleusercontent.com',
};

const UNIT_MAP = {
  LENGTH:      ['FEET', 'INCH', 'YARD', 'CENTIMETER'],
  WEIGHT:      ['KILOGRAM', 'GRAM', 'POUND'],
  VOLUME:      ['LITRE', 'MILLILITRE', 'GALLON'],
  TEMPERATURE: ['CELSIUS', 'FAHRENHEIT', 'KELVIN'],
};
