import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Equipment from '../models/Equipment.js';
import Request from '../models/Request.js';

dotenv.config({ path: './.env' });
let mongoServer;

beforeAll(async () => {
    // Start an in-memory MongoDB server
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    // Connect mongoose to the in-memory server
    await mongoose.connect(mongoUri, {
        // These options are no longer needed in Mongoose 6+, but harmless
        // useNewUrlParser: true,
        // useUnifiedTopology: true,
    });
});

afterEach(async () => {
    // Clear all test data after each test
    await User.deleteMany({});
    await Equipment.deleteMany({});
    await Request.deleteMany({});
});

afterAll(async () => {
    // Disconnect mongoose and stop the server
    await mongoose.disconnect();
    await mongoServer.stop();
});