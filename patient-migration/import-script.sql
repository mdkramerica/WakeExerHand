-- Import Real Patient Data into New Fork
-- Run these after creating the fork

-- 1. Import real patients (skip if they already exist)
COPY users FROM '/tmp/real_patients.csv' WITH CSV HEADER;

-- 2. Import their assessments
COPY user_assessments FROM '/tmp/real_assessments.csv' WITH CSV HEADER;

-- 3. Import clinical users
COPY clinical_users FROM '/tmp/clinical_users.csv' WITH CSV HEADER;