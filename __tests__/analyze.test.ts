import { analyze } from "../lib/analyzeLogic";

describe('analyze()', () => {
  it('returns 0.8 priority score for urgent message', () => {
    const message = "There is a gas leak";
    const result = analyze(message);
    expect(result.priorityScore).toBe(0.8);
    expect(result.urgencyIndicators).toBe(2);
    expect(result.keywords).toEqual(['leak', 'gas']);
  });

  it('returns 0 for non-urgent message', () => {
    const message = "Hello world";
    const result = analyze(message);
    expect(result.priorityScore).toBe(0);
    expect(result.urgencyIndicators).toBe(0);
    expect(result.keywords).toEqual([]);
  });
})