require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

console.log("From .env.local:");
console.log("DATABASE_URL:", process.env.DATABASE_URL);

// Next.jsが使用している環境変数読み込み順序を模擬
const dotenv = require("dotenv");
const path = require("path");

// .env.development.local
try {
  const envPath = path.resolve(".env.development.local");
  const result = dotenv.config({ path: envPath });
  if (!result.error) {
    console.log("\n.env.development.local loaded");
    console.log(
      "DATABASE_URL from .env.development.local:",
      result.parsed?.DATABASE_URL
    );
  }
} catch (e) {}

// .env.local
try {
  const envPath = path.resolve(".env.local");
  const result = dotenv.config({ path: envPath });
  if (!result.error) {
    console.log("\n.env.local loaded");
    console.log("DATABASE_URL from .env.local:", result.parsed?.DATABASE_URL);
  }
} catch (e) {}

// .env
try {
  const envPath = path.resolve(".env");
  const result = dotenv.config({ path: envPath });
  if (!result.error) {
    console.log("\n.env loaded");
    console.log("DATABASE_URL from .env:", result.parsed?.DATABASE_URL);
  }
} catch (e) {}

console.log("\nFinal DATABASE_URL:", process.env.DATABASE_URL);
