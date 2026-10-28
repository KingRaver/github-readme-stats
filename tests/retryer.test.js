// @ts-check

import {
  afterAll,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import "@testing-library/jest-dom";
import { RETRIES, getToken, retryer } from "../src/common/retryer.js";
import { logger } from "../src/common/log.js";

const fetcher = jest.fn((variables, token) => {
  logger.log(variables, token);
  return new Promise((res) => res({ data: "ok" }));
});

const fetcherFail = jest.fn(() => {
  return new Promise((res) =>
    res({ data: { errors: [{ type: "RATE_LIMITED" }] } }),
  );
});

const fetcherFailOnSecondTry = jest.fn((_vars, _token, retries) => {
  return new Promise((res) => {
    // faking rate limit
    // @ts-ignore
    if (retries < 1) {
      return res({ data: { errors: [{ type: "RATE_LIMITED" }] } });
    }
    return res({ data: "ok" });
  });
});

const fetcherFailWithMessageBasedRateLimitErr = jest.fn(
  (_vars, _token, retries) => {
    return new Promise((res) => {
      // faking rate limit
      // @ts-ignore
      if (retries < 1) {
        return res({
          data: {
            errors: [
              {
                type: "ASDF",
                message: "API rate limit already exceeded for user ID 11111111",
              },
            ],
          },
        });
      }
      return res({ data: "ok" });
    });
  },
);

describe("Test Retryer", () => {
  it("retryer should return value and have zero retries on first try", async () => {
    let res = await retryer(fetcher, {});

    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(res).toStrictEqual({ data: "ok" });
  });

  it("retryer should return value and have 2 retries", async () => {
    let res = await retryer(fetcherFailOnSecondTry, {});

    expect(fetcherFailOnSecondTry).toHaveBeenCalledTimes(2);
    expect(res).toStrictEqual({ data: "ok" });
  });

  it("retryer should return value and have 2 retries with message based rate limit error", async () => {
    let res = await retryer(fetcherFailWithMessageBasedRateLimitErr, {});

    expect(fetcherFailWithMessageBasedRateLimitErr).toHaveBeenCalledTimes(2);
    expect(res).toStrictEqual({ data: "ok" });
  });

  it("retryer should throw specific error if maximum retries reached", async () => {
    try {
      await retryer(fetcherFail, {});
    } catch (err) {
      expect(fetcherFail).toHaveBeenCalledTimes(RETRIES + 1);
      // @ts-ignore
      expect(err.message).toBe("Downtime due to GitHub API rate limiting");
    }
  });
});

describe("Test getToken", () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    delete process.env.PAT_1;
    delete process.env.PAT_2;
    delete process.env.TOKEN;
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it("falls back to TOKEN for the first attempt when no PAT_n is set", () => {
    process.env.TOKEN = "token-value";

    expect(getToken(0)).toBe("token-value");
  });

  it("prefers PAT_1 over TOKEN when both are set", () => {
    process.env.PAT_1 = "pat-value";
    process.env.TOKEN = "token-value";

    expect(getToken(0)).toBe("pat-value");
  });

  it("does not fall back to TOKEN for retries beyond the first", () => {
    process.env.TOKEN = "token-value";

    expect(getToken(1)).toBeUndefined();
  });
});
