const request = require("supertest");
const app = require("../server");

describe("GET /api/grid", () => {
  it("test passed", (done) => {
    request(app).get("/api/grid").expect(200).end(done);
  });
});
