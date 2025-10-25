import '@testing-library/jest-dom';
import { createMockNextRequest } from '@/jest.setup';
import { POST } from '@/app/api/auth/register/route';
import { User } from '@/models/User';
import bcrypt from 'bcryptjs';

describe('Register Route Handler', () => {
  const testUser = {
    email: 'newuser@example.com',
    password: 'TestPassword123!',
    confirmPassword: 'TestPassword123!',
    fullName: 'New User'
  };

  it('should register a new user successfully', async () => {
    const request = createMockNextRequest({
      method: 'POST',
      body: testUser
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    // Verify user was created in database
    const user = await User.findOne({ email: testUser.email });
    expect(user).toBeTruthy();
    expect(user?.fullName).toBe(testUser.fullName);
    expect(user?.role).toBe('user');

    // Verify password was hashed
    const passwordIsValid = await bcrypt.compare(testUser.password, user!.passwordHash);
    expect(passwordIsValid).toBe(true);
  });

  it('should reject registration with existing email', async () => {
    // Create user first
    await POST(createMockNextRequest({
      method: 'POST',
      body: testUser
    }));

    // Try to create same user again
    const response = await POST(createMockNextRequest({
      method: 'POST',
      body: testUser
    }));

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.message).toBe('User already exists');
  });

  it('should reject if passwords do not match', async () => {
    const request = createMockNextRequest({
      method: 'POST',
      body: {
        ...testUser,
        confirmPassword: 'DifferentPassword123!'
      }
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.message).toBe('Passwords do not match');
  });

  it('should require all necessary fields', async () => {
    const request = createMockNextRequest({
      method: 'POST',
      body: {
        email: testUser.email
        // Missing other fields
      }
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});