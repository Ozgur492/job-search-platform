import dotenv from 'dotenv';
dotenv.config();

const config = {
  port: parseInt(process.env.PORT || '8084', 10),
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    model: process.env.ANTHROPIC_MODEL || 'claude-opus-4-7',
    maxTokens: 2048,
  },
  gatewayUrl: process.env.GATEWAY_URL || 'http://localhost:8080',
  firebase: {
    credentialsJson: process.env.FIREBASE_CREDENTIALS_JSON || '',
  },
};

export default config;
