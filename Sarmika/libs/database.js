import * as SQLite from 'expo-sqlite';

// Open or create the database
const openLabourDB = async () => {
  return await SQLite.openDatabaseAsync('labour.db', { useNewConnection: true });
};

// Create tables
const setupDatabase = async () => {
  const labourDB = await openLabourDB();
  
  // Create labour profile table
  await labourDB.execAsync(`
    CREATE TABLE IF NOT EXISTS labour_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      age INTEGER NOT NULL,
      phone TEXT NOT NULL,
      location TEXT NOT NULL,
      languages TEXT NOT NULL,
      photo TEXT,
      id_proof TEXT,
      experience INTEGER NOT NULL,
      hourly_rate INTEGER NOT NULL,
      availability TEXT NOT NULL,
      verified INTEGER DEFAULT 0,
      completed_jobs INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
  
  // Create skills table
  await labourDB.execAsync(`
    CREATE TABLE IF NOT EXISTS skills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );
  `);
  
  // Create labour_skills junction table
  await labourDB.execAsync(`
    CREATE TABLE IF NOT EXISTS labour_skills (
      labour_id INTEGER NOT NULL,
      skill_id INTEGER NOT NULL,
      PRIMARY KEY (labour_id, skill_id),
      FOREIGN KEY (labour_id) REFERENCES labour_profiles(id) ON DELETE CASCADE,
      FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
    );
  `);
  
  // Create jobs table
  await labourDB.execAsync(`
    CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      location TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);
  
  // Create labour_jobs junction table
  await labourDB.execAsync(`
    CREATE TABLE IF NOT EXISTS labour_jobs (
      labour_id INTEGER NOT NULL,
      job_id INTEGER NOT NULL,
      status TEXT NOT NULL,
      rating INTEGER,
      feedback TEXT,
      PRIMARY KEY (labour_id, job_id),
      FOREIGN KEY (labour_id) REFERENCES labour_profiles(id) ON DELETE CASCADE,
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
    );
  `);

  // Create contractors table
  await labourDB.execAsync(`
    CREATE TABLE IF NOT EXISTS contractors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      pincode TEXT NOT NULL,
      photo TEXT,
      id_proof TEXT,
      account_holder TEXT NOT NULL,
      account_number TEXT NOT NULL,
      ifsc_code TEXT NOT NULL,
      bank_name TEXT NOT NULL,
      receive_notifications INTEGER DEFAULT 1,
      share_location_data INTEGER DEFAULT 1,
      agree_to_terms INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
  
  // Populate skills table with default skills
  const defaultSkills = [
    "Construction", "Painting", "Plumbing", "Electrical", 
    "Carpentry", "Masonry", "Welding", "Tiling"
  ];
  
  for (const skill of defaultSkills) {
    await labourDB.runAsync(
      'INSERT OR IGNORE INTO skills (name) VALUES (?)',
      [skill]
    );
  }
};

// Add a new labour profile
export const addLabourProfile = async (profile) => {
  const labourDB = await openLabourDB();
  try {
    const currentDate = new Date().toISOString();
    
    // Begin transaction
    await labourDB.runAsync('BEGIN TRANSACTION');
    
    // Insert main profile data
    const result = await labourDB.runAsync(
      `INSERT INTO labour_profiles (
        full_name, age, phone, location, languages, 
        photo, id_proof, experience, hourly_rate, 
        availability, verified, completed_jobs, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        profile.fullName, 
        parseInt(profile.age), 
        profile.phone,
        profile.location,
        profile.languages,
        profile.photo,
        profile.idProof,
        parseInt(profile.experience),
        parseInt(profile.hourlyRate),
        profile.availability,
        profile.verified ? 1 : 0,
        parseInt(profile.completedJobs || '0'),
        currentDate,
        currentDate
      ]
    );
    
    const labourId = result.lastInsertRowId;
    
    // Insert skills relationships
    for (const skillName of profile.skills) {
      // Get skill ID
      const skillResult = await labourDB.getAllAsync(
        'SELECT id FROM skills WHERE name = ?',
        [skillName]
      );
      
      if (skillResult.length > 0) {
        const skillId = skillResult[0].id;
        await labourDB.runAsync(
          'INSERT INTO labour_skills (labour_id, skill_id) VALUES (?, ?)',
          [labourId, skillId]
        );
      }
    }
    
    // Commit transaction
    await labourDB.runAsync('COMMIT');
    
    console.log(`Added labour profile with ID: ${labourId}`);
    return labourId;
  } catch (error) {
    // Rollback on error
    await labourDB.runAsync('ROLLBACK');
    console.error('Error adding labour profile:', error);
    throw error;
  } finally {
    await labourDB.closeAsync();
  }
};

// Get all labour profiles with their skills
export const getAllLabourProfiles = async () => {
  const labourDB = await openLabourDB();
  try {
    const profiles = await labourDB.getAllAsync(`
      SELECT * FROM labour_profiles ORDER BY full_name ASC
    `);
    
    // Get skills for each profile
    const result = await Promise.all(profiles.map(async (profile) => {
      const skills = await labourDB.getAllAsync(`
        SELECT s.name
        FROM skills s
        JOIN labour_skills ls ON s.id = ls.skill_id
        WHERE ls.labour_id = ?
      `, [profile.id]);
      
      return {
        ...profile,
        skills: skills.map(skill => skill.name),
        verified: profile.verified === 1 // Convert to boolean
      };
    }));
    
    return result;
  } catch (error) {
    console.error('Error fetching labour profiles:', error);
    throw error;
  } finally {
    await labourDB.closeAsync();
  }
};

// Get labour profiles by skills
export const getLabourProfilesBySkills = async (skillsArray) => {
  const labourDB = await openLabourDB();
  try {
    // Prepare query placeholders for the IN clause
    const placeholders = skillsArray.map(() => '?').join(',');
    
    const profiles = await labourDB.getAllAsync(`
      SELECT DISTINCT lp.*
      FROM labour_profiles lp
      JOIN labour_skills ls ON lp.id = ls.labour_id
      JOIN skills s ON ls.skill_id = s.id
      WHERE s.name IN (${placeholders})
      ORDER BY lp.verified DESC, lp.completed_jobs DESC
    `, skillsArray);
    
    // Get skills for each profile
    const result = await Promise.all(profiles.map(async (profile) => {
      const skills = await labourDB.getAllAsync(`
        SELECT s.name
        FROM skills s
        JOIN labour_skills ls ON s.id = ls.skill_id
        WHERE ls.labour_id = ?
      `, [profile.id]);
      
      return {
        ...profile,
        skills: skills.map(skill => skill.name),
        verified: profile.verified === 1 // Convert to boolean
      };
    }));
    
    return result;
  } catch (error) {
    console.error('Error fetching labour profiles by skills:', error);
    throw error;
  } finally {
    await labourDB.closeAsync();
  }
};

// Update labour profile
export const updateLabourProfile = async (id, updates) => {
  const labourDB = await openLabourDB();
  try {
    const currentDate = new Date().toISOString();
    
    // Begin transaction
    await labourDB.runAsync('BEGIN TRANSACTION');
    
    // Prepare update query
    const fieldsToUpdate = { ...updates, updated_at: currentDate };
    delete fieldsToUpdate.skills; // Remove skills from direct update
    
    const fields = Object.keys(fieldsToUpdate)
      .map(key => {
        // Map from camelCase to snake_case for DB fields
        const dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        return `${dbField} = ?`;
      })
      .join(', ');
    
    const values = Object.values(fieldsToUpdate);
    
    // Update profile
    await labourDB.runAsync(
      `UPDATE labour_profiles SET ${fields} WHERE id = ?`,
      [...values, id]
    );
    
    // Update skills if provided
    if (updates.skills) {
      // Remove existing skills
      await labourDB.runAsync(
        'DELETE FROM labour_skills WHERE labour_id = ?',
        [id]
      );
      
      // Add new skills
      for (const skillName of updates.skills) {
        const skillResult = await labourDB.getAllAsync(
          'SELECT id FROM skills WHERE name = ?',
          [skillName]
        );
        
        if (skillResult.length > 0) {
          const skillId = skillResult[0].id;
          await labourDB.runAsync(
            'INSERT INTO labour_skills (labour_id, skill_id) VALUES (?, ?)',
            [id, skillId]
          );
        }
      }
    }
    
    // Commit transaction
    await labourDB.runAsync('COMMIT');
    
    console.log(`Updated labour profile with ID: ${id}`);
    return true;
  } catch (error) {
    // Rollback on error
    await labourDB.runAsync('ROLLBACK');
    console.error('Error updating labour profile:', error);
    throw error;
  } finally {
    await labourDB.closeAsync();
  }
};

// Delete labour profile
export const deleteLabourProfile = async (id) => {
  const labourDB = await openLabourDB();
  try {
    const result = await labourDB.runAsync(
      'DELETE FROM labour_profiles WHERE id = ?',
      [id]
    );
    console.log(`Deleted labour profile with ID: ${id}`);
    return result.changes > 0;
  } catch (error) {
    console.error('Error deleting labour profile:', error);
    throw error;
  } finally {
    await labourDB.closeAsync();
  }
};

// Add methods for contractors
export const getAllContractorProfiles = async () => {
  const labourDB = await openLabourDB();
  try {
    const result = await labourDB.getAllAsync('SELECT * FROM contractors');
    return result;
  } catch (error) {
    console.error('Error fetching contractor profiles:', error);
    throw error;
  } finally {
    await labourDB.closeAsync();
  }
};

export const addContractorProfile = async (contractor) => {
  const labourDB = await openLabourDB();
  const {
    fullName, phone, email, address, city, pincode, photo, idProof,
    accountHolder, accountNumber, ifscCode, bankName,
    receiveNotifications, shareLocationData, agreeToTerms
  } = contractor;

  try {
    const result = await labourDB.runAsync(
      `INSERT INTO contractors 
      (full_name, phone, email, address, city, pincode, photo, id_proof, 
      account_holder, account_number, ifsc_code, bank_name, 
      receive_notifications, share_location_data, agree_to_terms) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
      RETURNING id`,
      [fullName, phone, email, address, city, pincode, photo, idProof,
      accountHolder, accountNumber, ifscCode, bankName,
      receiveNotifications, shareLocationData, agreeToTerms]
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error('Error adding contractor profile:', error);
    throw error;
  } finally {
    await labourDB.closeAsync();
  }
};

// Initialize database
setupDatabase();

export default {
  addLabourProfile,
  getAllLabourProfiles,
  getLabourProfilesBySkills,
  updateLabourProfile,
  deleteLabourProfile,
  getAllContractorProfiles,
  addContractorProfile
};