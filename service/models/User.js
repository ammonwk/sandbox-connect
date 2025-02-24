// models/User.js
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  cognitoId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  photo: { type: String },
  intro: { type: String, maxlength: 250 }, // renamed from bio
  role: { type: String, required: true }, // added
  teamNeeds: {
    needsPM: { type: Boolean, default: false },
    needsDev: { type: Boolean, default: false }
  },
  skills: [String], // renamed from skills
  contact: { // added
    email: String,
    phone: String,
    slack: String
  },
  matchPercentage: { type: Number }, // added
  background: { type: String, maxlength: 5000 },
  hoursPerWeek: { type: Number },
  ideaStatus: {
    type: String,
    enum: ['one', 'few', 'none'] // standardized values
  }
});

export default mongoose.model('User', UserSchema);