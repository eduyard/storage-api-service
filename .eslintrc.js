module.exports = {
  "extends": "standard",
  "rules": {
    "semi": ["error", "always"]
  },
  "overrides": [{
    "files": [ "spec/tests/*.js", "spec/tests/**/*.js" ],
    "rules": {
      "no-unused-expressions": 0
    }
  }]
};