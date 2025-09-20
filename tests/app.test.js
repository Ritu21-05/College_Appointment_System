const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../index"); // Make sure your Express app is exported
const User = require("../src/models/User");
const Availability = require("../src/models/Availability");
const Appointment = require("../src/models/Appointment");

let professorToken, studentToken;
let professorId, availabilityId, appointmentId;

beforeAll(async () => {
  const mongoUri =
    process.env.NODE_ENV === "test"
      ? process.env.MONGO_URI_TEST
      : process.env.MONGO_URI;

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
  }

  await User.deleteMany({});
  await Availability.deleteMany({});
  await Appointment.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("College Appointment System Full Flow", () => {
  it("should register a professor", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Prof Test",
      email: "prof@test.com",
      password: "password",
      role: "professor",
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.token).toBeDefined();
    professorToken = res.body.token;
  });

  it("should register a student", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Student Test",
      email: "student@test.com",
      password: "password",
      role: "student",
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.token).toBeDefined();
    studentToken = res.body.token;
  });

  it("should fetch professor ID", async () => {
    const prof = await User.findOne({ email: "prof@test.com" });
    expect(prof).toBeDefined();
    professorId = prof._id.toString();
  });

  it("should allow professor to add availability", async () => {
    const res = await request(app)
      .post("/api/availability")
      .set("Authorization", `Bearer ${professorToken}`)
      .send({
        date: "2025-09-21",
        slots: [
          { time: "10:00", isBooked: false },
          { time: "11:00", isBooked: false },
        ],
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.slots).toBeDefined();
    availabilityId = res.body._id;
  });

  it("should allow student to view professor availability", async () => {
    const res = await request(app)
      .get(`/api/availability/${professorId}`)
      .set("Authorization", `Bearer ${studentToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    availabilityId = res.body[0]._id;
  });

  it("should allow student to book an appointment", async () => {
    const res = await request(app)
      .post("/api/appointments/book")
      .set("Authorization", `Bearer ${studentToken}`)
      .send({
        availabilityId,
        time: "10:00",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body._id).toBeDefined();
    appointmentId = res.body._id;
  });

  it("should allow professor to cancel appointment", async () => {
    const res = await request(app)
      .delete(`/api/appointments/${appointmentId}`)
      .set("Authorization", `Bearer ${professorToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.msg).toMatch(/cancel/i);
  });

  it("should show no appointments for student", async () => {
    const res = await request(app)
      .get("/api/appointments/student")
      .set("Authorization", `Bearer ${studentToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(0);
  });
});
