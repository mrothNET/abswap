module.exports = {
  roots: ["src"],
  preset: 'ts-jest',
  testEnvironment: 'node',
  reporters: [ "default", "jest-junit" ],
};
