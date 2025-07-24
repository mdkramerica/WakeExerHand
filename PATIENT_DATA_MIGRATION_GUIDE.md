# Patient Data Migration Guide

## Current Data to Preserve:
- **Users**: 5 total (3 demo + 2 real patients: 231788, 720018)
- **Assessments**: 64 total with motion tracking data
- **Patient 231788**: Distal Radius Fracture
- **Patient 720018**: Trigger Finger (surgery date: 2025-07-21)

## Migration Methods:

### Method 1: SQL Export/Import (Recommended)

**Step 1: Export from Original Repl**
```sql
-- Export users to CSV
COPY users TO '/tmp/users.csv' WITH CSV HEADER;

-- Export user_assessments to CSV  
COPY user_assessments TO '/tmp/user_assessments.csv' WITH CSV HEADER;

-- Export clinical_users to CSV
COPY clinical_users TO '/tmp/clinical_users.csv' WITH CSV HEADER;
```

**Step 2: Import to New Repl**
```sql
-- Import users
COPY users FROM '/tmp/users.csv' WITH CSV HEADER;

-- Import assessments
COPY user_assessments FROM '/tmp/user_assessments.csv' WITH CSV HEADER;

-- Import clinical users
COPY clinical_users FROM '/tmp/clinical_users.csv' WITH CSV HEADER;
```

### Method 2: JSON Export via API

**In Original Repl Console:**
```javascript
// Export all data
const data = await fetch('/api/admin/export-all-data', {
  headers: { 'Authorization': 'Bearer YOUR_ADMIN_TOKEN' }
}).then(r => r.json());

// Save to file
require('fs').writeFileSync('./full-export.json', JSON.stringify(data, null, 2));
```

**In New Repl Console:**
```javascript
// Import data
const data = JSON.parse(require('fs').readFileSync('./full-export.json'));
await fetch('/api/admin/import-data', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});
```

### Method 3: Selective Patient Export

**Export only specific patients:**
```sql
-- Export specific patients only
COPY (SELECT * FROM users WHERE code IN ('231788', '720018')) TO '/tmp/real_patients.csv' WITH CSV HEADER;

-- Export their assessments
COPY (SELECT ua.* FROM user_assessments ua 
      JOIN users u ON ua.user_id = u.id 
      WHERE u.code IN ('231788', '720018')) TO '/tmp/real_assessments.csv' WITH CSV HEADER;
```

## Recommendation:

**For your case**: Use Method 3 (Selective Export) because:
- ✅ Preserves real patient data (231788, 720018)  
- ✅ Excludes demo data that can be regenerated
- ✅ Smaller, cleaner migration
- ✅ Production-ready dataset

## Step-by-Step Process:

1. **Before Fork**: Export real patient data using Method 3
2. **Create Fork**: Get clean repository + fresh database  
3. **After Fork**: Import only the real patient data
4. **Result**: Clean Git + Real Patient Data + All Code Improvements

This gives you the best of both worlds: clean repository with preserved patient data.