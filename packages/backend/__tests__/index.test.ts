/**
 * Backend unit tests
 */
import {
	type EnvironmentData,
	greet,
	validateEnvironmentData,
} from "../src/index.js";

describe("Backend Core Functions", () => {
	describe("greet function", () => {
		it("should return greeting message for valid name", () => {
			const result = greet("Alice");
			expect(result).toBe("Hello, Alice! Welcome to Sleep Smart AC!");
		});

		it("should throw error for empty name", () => {
			expect(() => greet("")).toThrow("Name is required");
		});

		it("should throw error for whitespace-only name", () => {
			expect(() => greet("   ")).toThrow("Name is required");
		});
	});

	describe("validateEnvironmentData function", () => {
		it("should return true for valid environment data", () => {
			const validData: EnvironmentData = {
				deviceId: "test-device",
				timestamp: "2024-01-01T00:00:00Z",
				temperature: 25.0,
				humidity: 50.0,
				brightness: 80.0,
			};
			expect(validateEnvironmentData(validData)).toBe(true);
		});

		it("should return false for invalid temperature", () => {
			const invalidData: EnvironmentData = {
				deviceId: "test-device",
				timestamp: "2024-01-01T00:00:00Z",
				temperature: 100.0, // 無効な温度
				humidity: 50.0,
				brightness: 80.0,
			};
			expect(validateEnvironmentData(invalidData)).toBe(false);
		});

		it("should return false for invalid humidity", () => {
			const invalidData: EnvironmentData = {
				deviceId: "test-device",
				timestamp: "2024-01-01T00:00:00Z",
				temperature: 25.0,
				humidity: 150.0, // 無効な湿度
				brightness: 80.0,
			};
			expect(validateEnvironmentData(invalidData)).toBe(false);
		});
	});
});
