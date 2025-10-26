import '@testing-library/jest-dom';
import { createMockNextRequest } from '@/jest.setup';
import { DELETE } from '@/app/api/auth/deleteAccount/route';
import { User } from '@/models/User';
import { signJWT } from '@/lib/auth/jwt';

describe('Delete Account Route Handler', () => {
  const testUser = {
    email: 'test@example.com',
    fullName: 'Test User',
    role: 'student'
  };

  let authToken: string;
  let userId: string;

  beforeEach(async () => {
    // Create a test user and generate their auth token
    const user = await User.create({
      ...testUser,
      passwordHash: 'notneededforthistest'
    });
    userId = user._id.toString();
  authToken = signJWT({ userId, role: 'student' });
  });

  it('should delete user account when authenticated', async () => {
    const request = createMockNextRequest({
      method: 'DELETE',
      headers: {
        Cookie: `authToken=${authToken}`
      }
    });

    const response = await DELETE(request);
    expect(response.status).toBe(200);

    // Verify user was deleted
    const deletedUser = await User.findById(userId);
    expect(deletedUser).toBeNull();
  });

  it('should reject requests without auth token', async () => {
    const request = createMockNextRequest({
      method: 'DELETE'
      // No auth token in cookies
    });

    const response = await DELETE(request);
    expect(response.status).toBe(401);

    // Verify user still exists
    const user = await User.findById(userId);
    expect(user).toBeTruthy();
  });

  it('should reject invalid auth tokens', async () => {
    const request = createMockNextRequest({
      method: 'DELETE',
      headers: {
        Cookie: 'authToken=invalidtoken'
      }
    });

    const response = await DELETE(request);
    expect(response.status).toBe(401);

    // Verify user still exists
    const user = await User.findById(userId);
    expect(user).toBeTruthy();
  });

  it('should handle non-existent user gracefully', async () => {
    // Delete user first
    await User.findByIdAndDelete(userId);
    
    const request = createMockNextRequest({
      method: 'DELETE',
      headers: {
        Cookie: `authToken=${authToken}`
      }
    });

    const response = await DELETE(request);
    expect(response.status).toBe(404);
  });
});