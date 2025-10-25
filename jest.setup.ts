/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { NextRequest } from 'next/server';

// Setup environment variables for testing
process.env.JWT_SECRET = 'test-jwt-secret-that-is-at-least-32-characters';
(process.env as any).NODE_ENV = 'test';

// Mock Next.js cookies API
const mockCookies = new Map<string, string>();

jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    set: (name: string, value: string) => mockCookies.set(name, value),
    get: (name: string) => mockCookies.get(name),
    delete: (name: string) => mockCookies.delete(name),
  }))
}));

let mongod: MongoMemoryServer;

// Connect to in-memory database before tests
beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
});

// Clear database and cookies between tests
beforeEach(async () => {
  const db = mongoose.connection.db;
  if (!db) {
    // No database connection available (e.g., not connected yet); just clear cookies
    mockCookies.clear();
    return;
  }

  const collections = await db.collections();
  for (const collection of collections) {
    await collection.deleteMany({});
  }
  mockCookies.clear();
});

// Disconnect and stop MongoDB after tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

// Helper to create mock NextRequest
export function createMockNextRequest(options: {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
  cookies?: Record<string, string>;
} = {}): NextRequest {
  const { method = 'GET', body, headers = {}, cookies = {} } = options;
  
  const request = new NextRequest(new URL('http://localhost:3000'), {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: new Headers(headers),
  });

  // Mock cookies
  Object.entries(cookies).forEach(([key, value]) => {
    mockCookies.set(key, value);
  });

  return request;
}