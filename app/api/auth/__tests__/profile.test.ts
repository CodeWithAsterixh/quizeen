import { GET } from '@/app/api/auth/profile/route';
import { createMockNextRequest } from '@/jest.setup';
import { signJWT } from '@/lib/auth/jwt';
import { User } from '@/models/User';
import '@testing-library/jest-dom';

describe('Profile Route Handler', () => {
  const testUser = {
    email: 'test@example.com',
    fullName: 'Test User',
    role: 'user'
  };

  let authToken: string;

  beforeEach(async () => {
    // Create a test user and generate their auth token
    const user = await User.create({
      ...testUser,
      passwordHash: 'notneededforthistest'
    });
    authToken = await signJWT({ userId: user._id.toString(), role: 'user' });
  });

  it('should return user profile when authenticated', async () => {
    const request = createMockNextRequest({
      method: 'GET',
      headers: {
        Cookie: `authToken=${authToken}`
      }
    });

    const response = await GET(request);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.user).toMatchObject({
      email: testUser.email,
      fullName: testUser.fullName,
      role: testUser.role
    });
  });

  it('should reject requests without auth token', async () => {
    const request = createMockNextRequest({
      method: 'GET'
      // No auth token in cookies
    });

    const response = await GET(request);
    expect(response.status).toBe(401);
  });

  it('should reject invalid auth tokens', async () => {
    const request = createMockNextRequest({
      method: 'GET',
      headers: {
        Cookie: 'authToken=invalidtoken'
      }
    });

    const response = await GET(request);
    expect(response.status).toBe(401);
  });

  it('should handle non-existent user', async () => {
    // Create token with non-existent user ID
    const invalidToken = await signJWT({ userId: '000000000000000000000000', role: 'user' });
    
    const request = createMockNextRequest({
      method: 'GET',
      headers: {
        Cookie: `authToken=${invalidToken}`
      }
    });

    const response = await GET(request);
    expect(response.status).toBe(404);
  });
});