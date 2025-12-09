/**
 * Migration Script: Fix Employee Name Field
 * 
 * This script fixes any EmployeeDay documents where the 'name' field
 * is stored as an object instead of a string.
 */

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/attendance';

async function fixEmployeeNameField() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully!\n');

    const db = mongoose.connection.db;
    const collection = db.collection('employeedays');

    // Find all documents
    console.log('Finding documents with invalid name field...');
    const docs = await collection.find({}).toArray();
    
    let fixedCount = 0;
    let alreadyValidCount = 0;

    for (const doc of docs) {
      if (typeof doc.name === 'object' && doc.name !== null) {
        // Name is an object, need to fix it
        let newName = 'Unknown';
        
        if (doc.name.full_name) {
          newName = doc.name.full_name;
        } else if (doc.name.format_name) {
          newName = doc.name.format_name;
        } else if (doc.name.first_name) {
          const firstName = doc.name.first_name;
          const lastName = doc.name.last_name || '';
          newName = lastName ? `${firstName} ${lastName}` : firstName;
        }

        // Update the document
        await collection.updateOne(
          { _id: doc._id },
          { $set: { name: newName } }
        );
        
        console.log(`Fixed: ${doc._id} - name was object, now: "${newName}"`);
        fixedCount++;
      } else if (typeof doc.name === 'string') {
        alreadyValidCount++;
      } else {
        // Name is null or undefined
        await collection.updateOne(
          { _id: doc._id },
          { $set: { name: 'Unknown' } }
        );
        console.log(`Fixed: ${doc._id} - name was null/undefined`);
        fixedCount++;
      }
    }

    console.log('\n--- Migration Complete ---');
    console.log(`Total documents processed: ${docs.length}`);
    console.log(`Fixed: ${fixedCount}`);
    console.log(`Already valid: ${alreadyValidCount}`);

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

fixEmployeeNameField();
