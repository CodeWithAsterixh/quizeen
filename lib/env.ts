// Required environment variables and their validation rules
const requiredEnvs = {
  MONGODB_URI: {
    required: true,
    minLength: 20, // Minimum length for a valid MongoDB URI
  },
  JWT_SECRET: {
    required: true,
    minLength: 32,
  },
  NODE_ENV: {
    required: true,
    allowedValues: ['development', 'production', 'test'],
  },
} as const;

type EnvVar = keyof typeof requiredEnvs;

// Validate all required environment variables
export function validateEnv(): void {
  const errors: string[] = [];

  for (const [key, rules] of Object.entries(requiredEnvs)) {
    const value = process.env[key];

    // Check if required
    if (rules.required && !value) {
      errors.push(`Missing required environment variable: ${key}`);
      continue;
    }

    if (value) {
      // Check minimum length if specified
      if ('minLength' in rules && value.length < rules.minLength) {
        errors.push(
          `Environment variable ${key} must be at least ${rules.minLength} characters long`
        );
      }

      // Check allowed values if specified
      if ('allowedValues' in rules && !rules.allowedValues.includes(value as typeof rules.allowedValues[number])) {
        errors.push(
          `Environment variable ${key} must be one of: ${rules.allowedValues.join(', ')}`
        );
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(`Environment validation failed:\n${errors.join('\n')}`);
  }
}

// Get a type-safe environment variable
export function getEnvVar(key: EnvVar): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}