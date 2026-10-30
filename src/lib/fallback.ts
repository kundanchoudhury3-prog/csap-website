// Shown only while the admin panel is still empty, so the site never looks broken.
// As soon as you add Courses / Toppers / Testimonials in /admin, these are replaced.

export const fallbackCourses = [
  { title: 'APSC CCE', category: 'APSC', badge: 'Most popular', shortDescription: 'Prelims + Mains + Interview — Assam-focused complete preparation.', modes: ['Live', 'Recorded', 'Offline'] },
  { title: 'UPSC CSE', category: 'UPSC', badge: 'UPSC', shortDescription: 'From Foundation to Mains — a structured programme with top faculty.', modes: ['Live', 'Recorded'] },
  { title: 'Interview Guidance Programme', category: 'Interview', badge: 'Interview', shortDescription: 'Mock interviews, panel feedback and real-time suggestions.', modes: ['Mock panel', 'Offline'] },
  { title: 'SSC & Banking', category: 'Govt jobs', badge: 'Govt jobs', shortDescription: 'Quant, reasoning and GA — practice aligned with the exam pattern.', modes: ['Live', 'Test series'] },
]

export const fallbackToppers = [
  { name: 'Deepshikha Doley', rank: 'ACS Rank 26' },
  { name: 'Nilupta Saharia', rank: 'APS Rank 04' },
]

export const fallbackTestimonials = [
  { name: 'Deepshikha Doley', rank: 'ACS Rank 26', quote: 'The Mock Interview organized by CSAP IAS Academy was highly beneficial.' },
  { name: 'Nilupta Saharia', rank: 'APS Rank 04', quote: 'Clearing APSC was a dream, and CSAP IAS Academy made it possible.' },
]
