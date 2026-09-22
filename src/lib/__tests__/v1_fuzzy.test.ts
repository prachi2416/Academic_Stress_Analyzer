import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { analyze, recommendations, type FuzzyInputs } from "../fuzzy.ts";

describe("V1 Fuzzy Logic Regression Tests", () => {
  it("evaluates balanced inputs correctly", () => {
    const inputs: FuzzyInputs = {
      sleep: 7,
      study: 6,
      assignments: 4,
      attendance: 80,
    };
    const result = analyze(inputs);

    // Stress and burnout scores should be calculated deterministically
    assert.ok(result.stressScore >= 0 && result.stressScore <= 100);
    assert.ok(result.burnoutScore >= 0 && result.burnoutScore <= 100);

    // Linguistic labels should be valid
    assert.ok(["Low", "Medium", "High"].includes(result.stressLevel));
    assert.ok(["Low", "Medium", "High"].includes(result.burnoutRisk));

    // Membership degrees should all be between 0 and 1
    for (const factor of ["sleep", "study", "assignments", "attendance"] as const) {
      for (const term of ["low", "medium", "high"] as const) {
        const degree = result.degrees[factor][term];
        assert.ok(degree >= 0 && degree <= 1);
      }
    }

    // Recommendations should be returned
    const tips = recommendations(inputs, result);
    assert.ok(tips.length > 0);
  });

  it("identifies high stress and high burnout correctly under severe overload", () => {
    const severeInputs: FuzzyInputs = {
      sleep: 3,
      study: 12,
      assignments: 9,
      attendance: 40,
    };
    const result = analyze(severeInputs);

    assert.equal(result.stressLevel, "High");
    assert.equal(result.burnoutRisk, "High");
    assert.ok(result.stressScore > 65);
    assert.ok(result.burnoutScore > 65);

    const tips = recommendations(severeInputs, result);
    assert.ok(tips.some((t) => t.includes("sleep")));
    assert.ok(tips.some((t) => t.includes("HIGH")));
  });

  it("identifies healthy zone correctly under low-stress conditions", () => {
    const healthyInputs: FuzzyInputs = {
      sleep: 8.5,
      study: 4,
      assignments: 2,
      attendance: 90,
    };
    const result = analyze(healthyInputs);

    assert.equal(result.stressLevel, "Low");
    assert.equal(result.burnoutRisk, "Low");
    assert.ok(result.stressScore < 40);
    assert.ok(result.burnoutScore < 40);

    const tips = recommendations(healthyInputs, result);
    assert.ok(tips.some((t) => t.includes("healthy zone")));
  });
});
