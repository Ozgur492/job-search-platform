-- Seed data for Job Search Platform demo
-- Run after migrations are applied

-- Seed companies
INSERT INTO companies (id, name, description) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Alfemo', 'Mobilya ve teknoloji yan kuruluşu. İzmir merkezli, 500+ çalışan.'),
  ('22222222-2222-2222-2222-222222222222', 'Packy Packaging', 'Endüstriyel ambalaj çözümleri. İstanbul merkezli, uluslararası operasyonlar.')
ON CONFLICT (id) DO NOTHING;

-- Seed jobs (10 in Izmir, 5 in Istanbul)
INSERT INTO jobs (id, company_id, title, description, country, city, town, work_preference, employment_type, position_level, department, salary_min, salary_max, currency)
VALUES
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Senior React Developer',
   'Build the next-gen e-commerce frontend. 3+ years React experience required. TypeScript, modern build tooling, and state management skills are essential. You will lead the frontend team and collaborate with designers.',
   'Türkiye', 'Izmir', 'Bornova', 'HYBRID', 'FULL_TIME', 'SENIOR', 'Engineering', 45000, 65000, 'TRY'),

  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Junior Backend Developer',
   'Java/Spring Boot development position. Fresh graduates welcome. We offer a 6-month mentoring program with hands-on production experience. Build microservices and APIs serving millions of users.',
   'Türkiye', 'Izmir', 'Konak', 'ONSITE', 'FULL_TIME', 'JUNIOR', 'Engineering', 25000, 35000, 'TRY'),

  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'DevOps Engineer',
   'Manage our cloud infrastructure on AWS and Azure. Kubernetes, Terraform, CI/CD pipelines. 2+ years experience in production environments. On-call rotation required.',
   'Türkiye', 'Izmir', NULL, 'REMOTE', 'FULL_TIME', 'MID', 'Operations', 50000, 70000, 'TRY'),

  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'UI/UX Designer',
   'Design beautiful and functional interfaces for our web and mobile products. Figma proficiency required. Experience with design systems and accessibility standards preferred.',
   'Türkiye', 'Izmir', 'Alsancak', 'HYBRID', 'FULL_TIME', 'MID', 'Design', 35000, 50000, 'TRY'),

  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Data Analyst Intern',
   'Join our data team for a 3-month internship. Learn SQL, Python, and data visualization tools. University students in their final year preferred.',
   'Türkiye', 'Izmir', NULL, 'ONSITE', 'INTERN', 'JUNIOR', 'Data', 12000, 15000, 'TRY'),

  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Product Manager',
   'Lead product strategy for our B2B platform. Work closely with engineering, design, and business teams. 3+ years PM experience, preferably in SaaS products.',
   'Türkiye', 'Izmir', NULL, 'HYBRID', 'FULL_TIME', 'SENIOR', 'Product', 55000, 80000, 'TRY'),

  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Mobile Developer (React Native)',
   'Build cross-platform mobile applications using React Native. Experience with iOS and Android deployment, push notifications, and offline-first architecture.',
   'Türkiye', 'Izmir', 'Bayraklı', 'ONSITE', 'FULL_TIME', 'MID', 'Engineering', 40000, 55000, 'TRY'),

  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'QA Engineer',
   'Ensure product quality through manual and automated testing. Selenium, Cypress, and API testing experience preferred. Write test plans and bug reports.',
   'Türkiye', 'Izmir', NULL, 'HYBRID', 'FULL_TIME', 'MID', 'Quality', 35000, 45000, 'TRY'),

  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Technical Writer',
   'Create and maintain technical documentation for our APIs and developer tools. Strong writing skills in both Turkish and English required.',
   'Türkiye', 'Izmir', NULL, 'REMOTE', 'PART_TIME', 'MID', 'Documentation', 20000, 30000, 'TRY'),

  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Full Stack Developer',
   'Work across the entire stack: React frontend, Node.js backend, PostgreSQL database. Experience with Docker and microservices architecture is a plus.',
   'Türkiye', 'Izmir', 'Karşıyaka', 'HYBRID', 'FULL_TIME', 'MID', 'Engineering', 40000, 60000, 'TRY'),

  -- Istanbul jobs
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Cloud Architect',
   'Design and implement scalable cloud solutions on Azure and AWS. Lead the migration of on-premise systems to the cloud. 5+ years of enterprise architecture experience.',
   'Türkiye', 'Istanbul', 'Maslak', 'REMOTE', 'FULL_TIME', 'EXPERT', 'Architecture', 80000, 120000, 'TRY'),

  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Machine Learning Engineer',
   'Build and deploy ML models for demand forecasting and recommendation systems. Python, TensorFlow/PyTorch, and MLOps experience required.',
   'Türkiye', 'Istanbul', 'Kadıköy', 'HYBRID', 'FULL_TIME', 'SENIOR', 'AI/ML', 60000, 90000, 'TRY'),

  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Security Engineer',
   'Protect our infrastructure and applications. Penetration testing, SIEM, and incident response experience required. CISSP or equivalent certification preferred.',
   'Türkiye', 'Istanbul', NULL, 'ONSITE', 'FULL_TIME', 'SENIOR', 'Security', 55000, 75000, 'TRY'),

  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Business Development Manager',
   'Drive growth through strategic partnerships and new market expansion. Strong network in the Turkish tech ecosystem. MBA or equivalent business degree preferred.',
   'Türkiye', 'Istanbul', 'Levent', 'HYBRID', 'FULL_TIME', 'LEAD', 'Business', 65000, 95000, 'TRY'),

  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Customer Support Specialist',
   'Provide excellent support to our enterprise clients. Strong communication skills in Turkish and English. Experience with CRM tools and ticketing systems.',
   'Türkiye', 'Istanbul', NULL, 'ONSITE', 'FULL_TIME', 'JUNIOR', 'Support', 22000, 30000, 'TRY');
