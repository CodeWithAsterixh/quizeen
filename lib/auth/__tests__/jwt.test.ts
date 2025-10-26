/* eslint-disable @typescript-eslint/no-explicit-any */
import { signJWT, verifyToken, TokenPayload } from '@/lib/auth/jwt';

describe('JWT Utilities', () => {
  const mockPayload: TokenPayload = {
    userId: '123',
    role: 'student'
  };

  it('should sign and verify a token successfully', () => {
    // Sign token
    const token = signJWT(mockPayload);
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');

    // Verify token
    const decoded = verifyToken(token);
    expect(decoded.userId).toBe(mockPayload.userId);
    expect(decoded.role).toBe(mockPayload.role);
    expect(decoded.iat).toBeDefined();
    expect(decoded.exp).toBeDefined();
  });

  it('should throw error for invalid token', () => {
    expect(() => verifyToken('invalid-token')).toThrow('Invalid token');
  });

  it('should throw error for token with invalid payload structure', () => {
    // Create token with invalid payload
    const invalidToken = signJWT({ 
      userId: '123',
      role: 'invalid-role' as any
    });

    expect(() => verifyToken(invalidToken)).toThrow('Invalid token payload');
  });
});