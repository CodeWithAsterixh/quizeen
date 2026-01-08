/* eslint-disable @typescript-eslint/no-unused-vars */
import mongoose from 'mongoose';
import { connectToDatabase } from './mongo';
import { User as userType } from '@/types';
import bcrypt from "bcryptjs";
import { User } from '@/models/User';


// Admin user details
const pass = process.env.ADMIN_PASSWORD
if(!pass) throw new Error("admin needs a password")

const hashedPassword = await bcrypt.hash(pass, 10);
const adminDetails:userType = {
  fullName: 'aster admin',
  email: 'peterpaulsilas4@gmail.com',
  role: 'admin',
  passwordHash: hashedPassword, // Replace with a strong password
  preferences: {
    theme: 'light',
    saveResults: false,
  },
  _id: "admin",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Function to create default admin user
export async function createDefaultAdmin() {
  try {
    await connectToDatabase()

    // Check if an admin user already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists.');
      return;
    }

    

    // Create the admin user
    const adminUser = new User({
      fullName: adminDetails.fullName,
      email: adminDetails.email,
      role: adminDetails.role,
      passwordHash: adminDetails.passwordHash,
      preferences: adminDetails.preferences,
      
    });

    // Save the admin user to the database
    await adminUser.save();
  } catch {
    return 
  } finally {
    // Close the database connection
    mongoose.connection.close();
  }
}

