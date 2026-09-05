export const ACTIVITY_CATEGORIES = [
  'HACKATHON',
  'WORKSHOP',
  'SEMINAR',
  'GUEST_LECTURE',
  'MOCK_INTERVIEW',
  'TECHNICAL_CONTEST',
  'OTHER'
] as const;

export const OTP_EXPIRY_MINUTES = {
  ADD_PARTICIPANT: 60, // Valid during registration window
  START_ACTIVITY: 30,  // Valid around starting window
  END_ACTIVITY: 120,   // Valid until end of activity + grace period
} as const;
