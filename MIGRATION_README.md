# Database Migration: Fix Employee Name Field

## Problem
The `name` field in `EmployeeDay` collection was being stored as an object instead of a string, causing React rendering errors.

## Solution
1. **Backend fixes** ensure new data is always stored correctly
2. **Migration script** fixes existing corrupted data in the database

## How to Run the Migration

### Prerequisites
- MongoDB connection should be configured in `.env` file
- Server dependencies should be installed

### Steps

1. **Navigate to server directory:**
   ```bash
   cd server
   ```

2. **Run the migration script:**
   ```bash
   node scripts/fix-employee-name-field.js
   ```

3. **Verify the output:**
   The script will show:
   - Number of documents processed
   - Number of documents fixed
   - Number of documents that were already valid

4. **Restart the backend server:**
   ```bash
   npm run dev
   ```

## What the Migration Does

The migration script:
- Finds all `EmployeeDay` documents
- Checks if `name` field is an object
- Converts object `name` to string by extracting:
  - `full_name` (priority 1)
  - `format_name` (priority 2)
  - `first_name + last_name` (priority 3)
  - Falls back to "Unknown" if none available
- Updates the document with the string value

## Backend Changes Made

### 1. Model Schema (`EmployeeDay.ts`)
- Added `strict: true` mode to prevent arbitrary fields
- Added type validations and defaults
- Explicitly defined `name` as String type

### 2. Service Layer (`punchService.ts`)
- Added `extractEmployeeName()` helper function
- Properly extracts name from various fields
- Always returns a string

### 3. Controller Layer (`punchController.ts`)
- Added data sanitization in `fetchHours` endpoint
- Ensures all fields are correct primitive types
- Defensive programming to catch any edge cases

## Frontend Changes Made

- Removed all temporary workarounds and patches
- Simplified code to trust backend data
- Clean, maintainable code without defensive type checking everywhere

## Verification

After running the migration:
1. Check the browser console - no more React object errors
2. Navigate between tabs - should work smoothly
3. All employee names should display correctly

## Future Prevention

The backend now:
- ✅ Enforces string type in schema
- ✅ Has helper function to extract names properly
- ✅ Sanitizes data in controller before sending
- ✅ Uses strict mode in schema to prevent corruption

New data will always be stored correctly!
