import { describe, expect, test } from 'vitest';

import { generateValidator } from './index';

describe('Module exports', () => {
  test('should export expected elements', () => {
    expect(typeof generateValidator).toBe('function');
  });
});
