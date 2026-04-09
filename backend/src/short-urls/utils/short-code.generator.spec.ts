import { generateRandomShortCode } from './short-code.generator';

describe('generateRandomShortCode', () => {
  it('should generate a code with default length 7', () => {
    const code = generateRandomShortCode();

    expect(code).toHaveLength(7);
  });

  it('should generate a code with the requested length', () => {
    const code = generateRandomShortCode(10);

    expect(code).toHaveLength(10);
  });

  it('should only contain base62 characters', () => {
    const code = generateRandomShortCode(50);

    expect(code).toMatch(/^[0-9a-zA-Z]+$/);
  });

  it('should generate different values most of the time', () => {
    const codeA = generateRandomShortCode();
    const codeB = generateRandomShortCode();

    expect(codeA).not.toEqual(codeB);
  });
});