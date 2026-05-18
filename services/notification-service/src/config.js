import dotenv from 'dotenv';
dotenv.config();

const config = {
  port: parseInt(process.env.PORT || '8083', 10),
  mongo: {
    url: process.env.MONGO_URL || 'mongodb://root:devpass@localhost:27017',
    db: process.env.MONGO_DB || 'jobsearch',
  },
  postgres: {
    url: process.env.POSTGRES_URL || 'postgresql://jobsearch:devpass@localhost:5432/jobsearch',
  },
  serviceBus: {
    connectionString: process.env.SERVICEBUS_CONNECTION_STRING || '',
    queue: process.env.SERVICEBUS_QUEUE || 'new-job-postings',
  },
  jobPostingServiceUrl: process.env.JOB_POSTING_SERVICE_URL || 'http://localhost:8081',
  firebase: {
    credentialsJson: process.env.FIREBASE_CREDENTIALS_JSON || '',
  },
  cronSecret: process.env.CRON_SECRET || 'changeme-long-random-string',
};

// Validation
const required = ['mongo.url', 'mongo.db'];
for (const key of required) {
  const parts = key.split('.');
  let value = config;
  for (const part of parts) value = value[part];
  if (!value) {
    console.error(`Missing required config: ${key}`);
    process.exit(1);
  }
}

export default config;
