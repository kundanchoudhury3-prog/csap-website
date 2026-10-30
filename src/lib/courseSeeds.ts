// The 4 homepage programme cards, created as real courses (editable in Admin → Courses).
// Photos are CSAP's own, from the old site (classrooms and interview panel).
export const courseSeeds = [
  {
    title: 'APSC CCE', slug: 'apsc-cce', category: 'APSC', badge: 'Most popular', order: 1,
    shortDescription: 'Prelims + Mains + Interview — Assam-focused complete preparation.',
    modes: ['Live', 'Recorded', 'Offline'],
    image: 'https://csap.co.in/wp-content/uploads/2025/06/cls1.png',
  },
  {
    title: 'UPSC CSE', slug: 'upsc-cse', category: 'UPSC', badge: 'UPSC', order: 2,
    shortDescription: 'From Foundation to Mains — a structured programme with top faculty.',
    modes: ['Live', 'Recorded'],
    image: 'https://csap.co.in/wp-content/uploads/2025/06/cls2.png',
  },
  {
    title: 'Interview Guidance Programme', slug: 'interview-guidance-programme', category: 'Interview', badge: 'Interview', order: 3,
    shortDescription: 'Mock interviews, panel feedback and real-time suggestions.',
    modes: ['Mock panel', 'Offline'],
    image: 'https://csap.co.in/wp-content/uploads/2025/06/interview1.png',
  },
  {
    title: 'SSC & Banking', slug: 'ssc-banking', category: 'Govt jobs', badge: 'Govt jobs', order: 4,
    shortDescription: 'Quant, reasoning and GA — practice aligned with the exam pattern.',
    modes: ['Live', 'Test series'],
    image: 'https://csap.co.in/wp-content/uploads/2025/07/cl-1.png',
  },
] as const
