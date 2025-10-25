import '@testing-library/jest-dom';
import { createMockNextRequest } from '@/jest.setup';
import { PUT } from '@/app/api/auth/updateUserProfile/route';
import { User } from '@/models/User';
import { signJWT } from '@/lib/auth/jwt';
import bcrypt from 'bcryptjs';

describe('Update User Profile Route Handler', () => {
  const testUser = {
    email: 'test@example.com',
    fullName: 'Test User',
    role: 'user',
    password: 'CurrentPassword123!'
  };

  let authToken: string;
  let userId: string;

  beforeEach(async () => {
    // Create a test user and generate their auth token
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(testUser.password, salt);
    const user = await User.create({
      ...testUser,
      passwordHash: hashedPassword
    });
    userId = user._id.toString();
    authToken = await signJWT({ userId, role: 'user' });
  });

  it('should update user profile when authenticated', async () => {
    const updates = {
      fullName: 'Updated Name',
      email: 'updated@example.com'
    };

    const request = createMockNextRequest({
      method: 'PUT',
      headers: {
        Cookie: `authToken=${authToken}`
      },
      body: updates
    });

    const response = await PUT(request);
    expect(response.status).toBe(200);

    // Verify updates were applied
    const updatedUser = await User.findById(userId);
    expect(updatedUser?.fullName).toBe(updates.fullName);
    expect(updatedUser?.email).toBe(updates.email);
  });

  it('should update password when provided', async () => {
    const updates = {
      currentPassword: testUser.password,
      newPassword: 'NewPassword123!',
      confirmNewPassword: 'NewPassword123!'
    };

    const request = createMockNextRequest({
      method: 'PUT',
      headers: {
        Cookie: `authToken=${authToken}`
      },
      body: updates
    });

    const response = await PUT(request);
    expect(response.status).toBe(200);

    // Verify password was updated
    const updatedUser = await User.findById(userId);
    const passwordIsValid = await bcrypt.compare(updates.newPassword, updatedUser!.passwordHash);
    expect(passwordIsValid).toBe(true);
  });

  it('should reject invalid current password', async () => {
    const updates = {
      currentPassword: 'WrongPassword123!',
      newPassword: 'NewPassword123!',
      confirmNewPassword: 'NewPassword123!'
    };

    const request = createMockNextRequest({
      method: 'PUT',
      headers: {
        Cookie: `authToken=${authToken}`
      },
      body: updates
    });

    const response = await PUT(request);
    expect(response.status).toBe(401);
  });

  it('should reject mismatched new passwords', async () => {
    const updates = {
      currentPassword: testUser.password,
      newPassword: 'NewPassword123!',
      confirmNewPassword: 'DifferentPassword123!'
    };

    const request = createMockNextRequest({
      method: 'PUT',
      headers: {
        Cookie: `authToken=${authToken}`
      },
      body: updates
    });

    const response = await PUT(request);
    expect(response.status).toBe(400);
  });

  it('should reject requests without auth token', async () => {
    const request = createMockNextRequest({
      method: 'PUT',
      body: { fullName: 'Updated Name' }
    });

    const response = await PUT(request);
    expect(response.status).toBe(401);
  });

  it('should handle non-existent user', async () => {
    await User.findByIdAndDelete(userId);
    
    const request = createMockNextRequest({
      method: 'PUT',
      headers: {
        Cookie: `authToken=${authToken}`
      },
      body: { fullName: 'Updated Name' }
    });

    const response = await PUT(request);
    expect(response.status).toBe(404);
  });
});