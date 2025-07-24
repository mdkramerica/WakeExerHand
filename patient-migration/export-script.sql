-- Export Real Patient Data for Fork Migration
-- Run these queries and save the output

-- 1. Export real patients
COPY (
  SELECT * FROM users WHERE code IN ('231788', '720018')
) TO '/tmp/real_patients.csv' WITH CSV HEADER;

-- 2. Export their assessments  
COPY (
  SELECT ua.* FROM user_assessments ua 
  JOIN users u ON ua.user_id = u.id 
  WHERE u.code IN ('231788', '720018')
) TO '/tmp/real_assessments.csv' WITH CSV HEADER;

-- 3. Export clinical users if any
COPY (
  SELECT * FROM clinical_users
) TO '/tmp/clinical_users.csv' WITH CSV HEADER;