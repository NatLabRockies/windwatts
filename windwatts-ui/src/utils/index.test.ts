import { describe, expect, test } from "vitest";
import type { CustomPowerCurve } from "../types";
import {
  buildUrlFromSettings,
  parseUrlParams,
  URL_PARAM_DEFAULTS,
} from "./urlParams";
import {
  fingerprintCustomCurve,
  customCurveShareId,
  matchSharedCustomCurve,
} from "./turbine";
import {
  convertUnit,
  getWindResource,
  percentToFactor,
  applyLoss,
  roundToSignificantDigits,
} from ".";

describe("convertUnit", () => {
  test("windspeed: m/s to mph", () => {
    expect(convertUnit(10, "windspeed", "mph")).toBe("22.4 mph");
  });
  test("windspeed: m/s to m/s (identity)", () => {
    expect(convertUnit(10, "windspeed", "m/s")).toBe("10.0 m/s");
  });
  test("windspeed: mph to m/s via fromUnit", () => {
    expect(convertUnit(22.369, "windspeed", "m/s", "mph")).toBe("10.0 m/s");
  });
  test("energy: kWh identity with locale formatting", () => {
    expect(convertUnit(1000, "energy", "kWh")).toBe("1,000.0 kWh");
  });
  test("energy: kWh to MWh", () => {
    expect(convertUnit(1000, "energy", "MWh")).toBe("1.0 MWh");
  });
  test("valueOnly omits unit label", () => {
    expect(convertUnit(1000, "energy", "kWh", undefined, true)).toBe("1,000.0");
  });
});

describe("getWindResource", () => {
  test("with high wind speed", () => {
    expect(getWindResource(6)).toBe("High");
  });
  test("with moderate wind speed", () => {
    expect(getWindResource(4)).toBe("Moderate");
  });
  test("with low wind speed", () => {
    expect(getWindResource(2)).toBe("Low");
  });
});

describe("percentToFactor", () => {
  test("17% -> 0.83", () => {
    expect(percentToFactor(17)).toBeCloseTo(0.83, 2);
  });
  test("0% -> 1", () => {
    expect(percentToFactor(0)).toBe(1);
  });
  test("100% -> 0", () => {
    expect(percentToFactor(100)).toBe(0);
  });
  test("clamps and handles NaN", () => {
    // @ts-expect-error testing bad input
    expect(percentToFactor("abc")).toBe(1);
    expect(percentToFactor(-10)).toBe(1);
    expect(percentToFactor(150)).toBe(0);
  });
});

describe("applyLoss", () => {
  test("applies factor correctly", () => {
    expect(applyLoss(1000, 0.83)).toBeCloseTo(830, 0);
  });
  test("clamps factor and handles non-number value", () => {
    // @ts-expect-error testing bad input
    expect(applyLoss("abc", 0.9)).toBe(0);
    expect(applyLoss(1000, 2)).toBe(1000);
    expect(applyLoss(1000, -1)).toBe(0);
  });
  test("rounds to nearest whole when configured", () => {
    expect(applyLoss(1234.56, 0.83, { mode: "nearest" })).toBe(1025);
  });
  test("floors to whole when configured", () => {
    expect(applyLoss(1234.56, 0.83, { mode: "floor" })).toBe(1024);
  });
  test("floors to 2 decimals when configured", () => {
    expect(applyLoss(2.089, 1, { mode: "floor", digits: 2 })).toBe(2.08);
  });
  test("rounds to nearest 1 decimal when configured", () => {
    expect(applyLoss(123.45, 0.83, { mode: "nearest", digits: 1 })).toBe(102.5);
  });
  test("rounds to significant digits when configured", () => {
    expect(applyLoss(12.345, 0.83, { mode: "sig", digits: 2 })).toBeCloseTo(
      10,
      10
    );
  });
});

describe("roundToSignificantDigits", () => {
  test("handles zeros", () => {
    expect(roundToSignificantDigits(0, 2)).toBe(0);
  });
  test("simple rounding", () => {
    expect(roundToSignificantDigits(1234.56, 2)).toBe(1200);
    expect(roundToSignificantDigits(0.012345, 2)).toBe(0.012);
  });
});

describe("custom curve sharing", () => {
  const curve: CustomPowerCurve = {
    id: "custom-local-a",
    name: "My turbine",
    createdAt: 1,
    data: [
      { ws: 0, kw: 0 },
      { ws: 5, kw: 10 },
    ],
  };

  test("hashes equivalent imports independently of names, IDs and row order", async () => {
    const hash = await fingerprintCustomCurve(curve);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    expect(
      await fingerprintCustomCurve({
        ...curve,
        id: "custom-local-b",
        name: "Another name",
        createdAt: 2,
        data: [...curve.data].reverse(),
      })
    ).toBe(hash);
    expect(customCurveShareId({ ...curve, fingerprint: hash })).toBe(
      `custom-v1-${hash.slice(0, 8)}`
    );
  });

  test("includes power data and height constraints in the hash", async () => {
    const hash = await fingerprintCustomCurve(curve);
    expect(
      await fingerprintCustomCurve({
        ...curve,
        minHeight: 20,
        maxHeight: 40,
      })
    ).not.toBe(hash);
    expect(
      await fingerprintCustomCurve({
        ...curve,
        data: [
          { ws: 0, kw: 0 },
          { ws: 5, kw: 11 },
        ],
      })
    ).not.toBe(hash);
  });

  test("returns all matching imports oldest first, including duplicates and collisions", () => {
    const first = { ...curve, fingerprint: "a31f09c2" + "0".repeat(56) };
    const duplicate = { ...first, id: "custom-local-b", createdAt: 2 };
    const collision = {
      ...duplicate,
      id: "custom-local-c",
      fingerprint: "a31f09c2" + "1".repeat(56),
    };
    expect(
      matchSharedCustomCurve("custom-v1-a31f09c2", [duplicate, first])
    ).toEqual([first, duplicate]);
    expect(
      matchSharedCustomCurve("custom-v1-a31f09c2", [collision, first])
    ).toEqual([first, collision]);
    expect(
      matchSharedCustomCurve("custom-v1-a31f09c2", [
        collision,
        duplicate,
        first,
      ])
    ).toEqual([first, duplicate, collision]);
    expect(matchSharedCustomCurve("custom-v1-ffffffff", [first])).toEqual([]);
    expect(matchSharedCustomCurve(curve.id, [curve])).toEqual([curve]);
    expect(matchSharedCustomCurve("custom-missing", [curve])).toEqual([]);
  });

  test("round-trips compact custom URLs without local IDs or names", () => {
    const stored = { ...curve, fingerprint: "a31f09c2" + "0".repeat(56) };
    const settings = {
      currentPosition: { lat: 40, lng: -105 },
      zoom: URL_PARAM_DEFAULTS.zoom,
      hubHeight: URL_PARAM_DEFAULTS.hubHeight,
      turbine: curve.id,
      customCurves: [stored],
      preferredModel: URL_PARAM_DEFAULTS.dataModel,
      lossAssumptionPercent: 0,
      windspeedUnit: URL_PARAM_DEFAULTS.windspeedUnit,
    };
    const url = buildUrlFromSettings(settings);
    expect(url).toBe("/?lat=40.0000&lng=-105.0000&turbine=custom-v1-a31f09c2");
    expect(parseUrlParams(new URLSearchParams(url.slice(2))).turbine).toBe(
      "custom-v1-a31f09c2"
    );
    expect(buildUrlFromSettings({ ...settings, customCurves: [] })).toBe("/");
    expect(
      buildUrlFromSettings({ ...settings, turbine: URL_PARAM_DEFAULTS.turbine })
    ).toBe("/?lat=40.0000&lng=-105.0000");
  });

  test("preserves legacy custom IDs for local matching and rejects invalid reference IDs", () => {
    expect(
      parseUrlParams(new URLSearchParams("turbine=custom-123-abc")).turbine
    ).toBe("custom-123-abc");
    expect(
      parseUrlParams(new URLSearchParams("powerCurve=custom-123-abc")).turbine
    ).toBe("custom-123-abc");
    expect(
      parseUrlParams(new URLSearchParams("turbine=unknown-reference")).turbine
    ).toBeUndefined();
  });
});
