// In-memory storage for blacklisted refresh tokens
// In production, consider using Redis or a database table
const blacklistedTokens = new Set();

const addToBlacklist = (token) => {
  blacklistedTokens.add(token);
};

const isBlacklisted = (token) => {
  return blacklistedTokens.has(token);
};

// Optional: Clean up old tokens periodically (for production, use a proper cleanup strategy)
const clearBlacklist = () => {
  blacklistedTokens.clear();
};

module.exports = {
  addToBlacklist,
  isBlacklisted,
  clearBlacklist,
};
