import mongoose, { Schema } from "mongoose";

// Question Schema
const questionSchema = new Schema({
  _id: { type: String, required: true },
  text: { type: String, required: true },
  options: {
    A: { type: String, required: true },
    B: { type: String, required: true },
    C: { type: String, required: true },
    D: { type: String, required: true },
  },
  correctAnswer: {
    type: String,
    enum: ['A', 'B', 'C', 'D'],
    required: true,
  },
});

// Quiz Schema
const quizSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: false }, // Optional as per the interface
  duration: { type: Number, required: true }, // in minutes
  questions: { type: [questionSchema], required: true },
  createdBy: { type: String, required: true }, // User ID
  createdAt: { type: String, required: true },
  updatedAt: { type: String, required: true },
},{
  collection: "quizzes"
});

export const Quiz = mongoose.models.Quiz || mongoose.model('Quiz', quizSchema);
