
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import { app } from '../app'
import request from 'supertest'

declare global {
    namespace NodeJS {
      interface Global {
        signin(): Promise<string[]>;
      }
    }
  }

let mongo: any

// Before all of tests, start mongo memory server and tell mongoose to connect to it
beforeAll(async () => {
    process.env.JWT_KEY = 'blabla';

    mongo = new MongoMemoryServer()
    const mongoUri = await mongo.getUri()

    await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
})

// Before each test, get all collections and delete them to refresh data between tests
beforeEach(async () => {
    const collections = await mongoose.connection.db.collections()

    for(let collection of collections) {
        await collection.deleteMany({})
    }
})

// After all tests, stop mongo memory server and tell mongoose to disconnect from it
afterAll(async () => {
    await mongo.stop()
    await mongoose.connection.close()
})

global.signin = async () => {
    const email = 'test@test.com'
    const password = 'password'

    const response = await request(app)
        .post('/api/users/signup')
        .send({
            email, password
        })
        .expect(201)
    
    const cookie = response.get('Set-Cookie');

    return cookie;
}