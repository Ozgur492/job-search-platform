-- V1__init.sql
-- Full DDL for the Job Search Platform

-- Enable pg_trgm extension for autocomplete
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Companies table
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    logo_url VARCHAR(500),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firebase_uid VARCHAR(128) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    display_name VARCHAR(200),
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    company_id UUID REFERENCES companies(id),
    city VARCHAR(100),
    country VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Jobs table
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    country VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    town VARCHAR(100),
    work_preference VARCHAR(20) NOT NULL,
    employment_type VARCHAR(20) NOT NULL,
    position_level VARCHAR(20),
    department VARCHAR(100),
    salary_min INT,
    salary_max INT,
    currency VARCHAR(3) DEFAULT 'TRY',
    is_active BOOLEAN DEFAULT TRUE,
    posted_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

-- Applications table
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES jobs(id),
    user_id UUID NOT NULL REFERENCES users(id),
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (job_id, user_id)
);

-- Job Alerts table
CREATE TABLE job_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    keywords VARCHAR(500) NOT NULL,
    country VARCHAR(100),
    city VARCHAR(100),
    town VARCHAR(100),
    work_preference VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_jobs_city_country_active ON jobs(city, country, is_active);
CREATE INDEX idx_jobs_posted_at_desc ON jobs(posted_at DESC);
CREATE INDEX idx_jobs_title_trgm ON jobs USING GIN (title gin_trgm_ops);
CREATE INDEX idx_jobs_company_id ON jobs(company_id);
CREATE INDEX idx_applications_user_id ON applications(user_id);
CREATE INDEX idx_applications_job_id ON applications(job_id);
CREATE INDEX idx_job_alerts_user_id ON job_alerts(user_id);
CREATE INDEX idx_users_firebase_uid ON users(firebase_uid);
