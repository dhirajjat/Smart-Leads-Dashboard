import mongoose, { Model, Schema } from 'mongoose';
import dotenv from 'dotenv';

// Environment variables load karein
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("FATAL ERROR: MONGO_URI is not defined in environment variables.");
  process.exit(1);
}

// 1. Connection Establish karein
if (mongoose.connection.readyState === 0) {
  mongoose.connect(MONGO_URI)
    .then(() => console.log('Successfully connected to MongoDB Atlas database!'))
    .catch((err) => console.error('Error connecting to MongoDB Atlas:', err.message));
}

// --- TypeScript Interfaces (any hatane ke liye) ---
export interface ILead {
  id: string;
  name: string;
  email: string;
  status: string;
  source: string;
  createdAt: string;
}

export interface IUser {
  id: string;
  name: string;
  email: string;
  password?: string; // Optional rakha hai taaki select('-password') ke sath issue na ho
  role: string;
}

// --- 2. Mongoose Schemas Definitions ---
const mongoLeadSchema = new Schema<ILead>({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  status: { type: String, required: true },
  source: { type: String, required: true },
  createdAt: { type: String, required: true }
}, { collection: 'leads', versionKey: false });

const mongoUserSchema = new Schema<IUser>({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true }
}, { collection: 'users', versionKey: false });

// Models compile karein (Hot-reloading handle karne ke liye fallback ke sath)
const MongoLeadModel: Model<ILead> = mongoose.models.Lead || mongoose.model<ILead>('Lead', mongoLeadSchema);
const MongoUserModel: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', mongoUserSchema);

// --- 3. Clean and Pure MongoDB DB Class ---
class FlexibleDB {
  
  // Login ke liye exact implemented method (Error Fix!)
  async getUserByEmail(email: string): Promise<IUser | null> {
    try {
      // Input email ko trim aur lowercase karna safe lookup ke liye best practice hai
      return await MongoUserModel.findOne({ email: email.toLowerCase().trim() }).lean();
    } catch (err: any) {
      console.error(`Error fetching user by email ${email}:`, err.message);
      return null;
    }
  }
  
  // Saare leads read karne ke liye
  async getLeads(): Promise<ILead[]> { 
    try {
      return await MongoLeadModel.find().sort({ createdAt: -1 }).lean();
    } catch (err: any) {
      console.error('Error fetching leads:', err.message);
      return [];
    }
  }

  // Saare users read karne ke liye
  async getUsers(): Promise<IUser[]> { 
    try {
      return await MongoUserModel.find().select('-password').lean(); // Security: Password field hide rakhega
    } catch (err: any) {
      console.error('Error fetching users:', err.message);
      return [];
    }
  }

  // Naya lead create karne ke liye (Omit use kiya hai kyunki id aur createdAt function khud generate karega)
  async addLead(lead: Omit<ILead, 'id' | 'createdAt'> & { id?: string }): Promise<ILead> {
    try {
      const newLead = { 
        ...lead, 
        id: lead.id || Math.random().toString(36).substring(2, 11), 
        createdAt: new Date().toISOString() 
      };
      const savedLead = await MongoLeadModel.create(newLead);
    
      return savedLead.toObject() as ILead;
    } catch (err: any) {
      console.error('Failed to save Lead to MongoDB:', err.message);
      throw err;
    }
  }

  // Lead update karne ke liye
  async updateLead(id: string, updates: Partial<ILead>): Promise<ILead | null> {
    try {
      const updatedRecord = await MongoLeadModel.findOneAndUpdate(
        { id }, 
        { $set: updates }, 
        { new: true, runValidators: true } // naya updated data return hoga validation ke sath
      ).lean();
      
      if (updatedRecord) {
        console.log(`Lead ID '${id}' updated in MongoDB`);
      }
      return updatedRecord;
    } catch (err: any) {
      console.error('Failed to update Lead in MongoDB:', err.message);
      throw err;
    }
  }

  // Lead delete karne ke liye
  async deleteLead(id: string): Promise<boolean> {
    try {
      const result = await MongoLeadModel.deleteOne({ id });
    
      return result.deletedCount > 0;
    } catch (err: any) {
      console.error('Failed to delete Lead from MongoDB:', err.message);
      throw err;
    }
  }

  // Naya user create karne ke liye
  async addUser(user: Omit<IUser, 'id'> & { id?: string }): Promise<IUser> {
    try {
      const newUser = { 
        ...user, 
        id: user.id || Math.random().toString(36).substring(2, 11),
        email: user.email.toLowerCase().trim()
      };
      const savedUser = await MongoUserModel.create(newUser);
      
      
      const userObj = savedUser.toObject() as IUser;
      delete userObj.password; // Client par hashed password na bhejien
      return userObj;
    } catch (err: any) {
      console.error('Failed to save User to MongoDB:', err.message);
      throw err;
    }
  }
}

export const db = new FlexibleDB();