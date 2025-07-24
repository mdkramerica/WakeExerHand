// Database Export/Import Script for Fork Migration
// Run this in the original repl to export data, then in new repl to import

const fs = require('fs');
const path = require('path');

// Export all patient data to JSON files
async function exportPatientData() {
  const { getDbClient } = require('./server/storage');
  const db = await getDbClient();
  
  try {
    // Export users
    const users = await db.select().from(require('./shared/schema').users);
    
    // Export user assessments with motion data
    const userAssessments = await db.select().from(require('./shared/schema').userAssessments);
    
    // Export any other relevant tables
    const clinicalUsers = await db.select().from(require('./shared/schema').clinicalUsers);
    
    const exportData = {
      timestamp: new Date().toISOString(),
      users,
      userAssessments,
      clinicalUsers,
      totalRecords: users.length + userAssessments.length
    };
    
    // Save to file
    const exportPath = './patient-data-export.json';
    fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2));
    
    console.log(`✅ Exported ${exportData.totalRecords} records to ${exportPath}`);
    console.log(`📊 Users: ${users.length}, Assessments: ${userAssessments.length}`);
    
    return exportPath;
  } catch (error) {
    console.error('❌ Export failed:', error);
    throw error;
  }
}

// Import data into new database
async function importPatientData(filePath) {
  const { getDbClient } = require('./server/storage');
  const db = await getDbClient();
  const schema = require('./shared/schema');
  
  try {
    const exportData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Import users
    if (exportData.users?.length > 0) {
      await db.insert(schema.users).values(exportData.users).onConflictDoNothing();
      console.log(`✅ Imported ${exportData.users.length} users`);
    }
    
    // Import user assessments
    if (exportData.userAssessments?.length > 0) {
      await db.insert(schema.userAssessments).values(exportData.userAssessments).onConflictDoNothing();
      console.log(`✅ Imported ${exportData.userAssessments.length} assessments`);
    }
    
    // Import clinical users
    if (exportData.clinicalUsers?.length > 0) {
      await db.insert(schema.clinicalUsers).values(exportData.clinicalUsers).onConflictDoNothing();
      console.log(`✅ Imported ${exportData.clinicalUsers.length} clinical users`);
    }
    
    console.log(`🎉 Data migration complete!`);
    
  } catch (error) {
    console.error('❌ Import failed:', error);
    throw error;
  }
}

module.exports = { exportPatientData, importPatientData };