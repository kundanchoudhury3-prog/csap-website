// CSAP Team from the old csap.co.in homepage, imported once. Edit afterwards in Admin → CSAP Team.
export const teamSeeds = [
  {
    name: 'Rajdeep Lekharu', role: 'Director', experience: '', subjects: '', order: 1,
    photo: 'https://csap.co.in/wp-content/uploads/2025/10/RL.jpg',
    highlights: ['Founder of eShreni', 'B.Tech from AEC, Guwahati', 'IIM Kashipur', 'Certified Telecom Engineer under CenturyLink, Ericsson & IBM'],
  },
  {
    name: 'Mayur Chaudhari', role: 'Senior Faculty', experience: '', subjects: '', order: 3,
    photo: 'https://csap.co.in/wp-content/uploads/2025/10/MC.jpg',
    highlights: ['Appeared UPSC Interview', 'PGD in Counter Terrorism, Dept. of Defence & Strategic Studies, Pune University', 'MSc in Security Diplomacy, Tel Aviv University, Israel'],
  },
  {
    name: 'Jepul Reece Kalita', role: 'Senior Faculty', experience: '', subjects: '', order: 4,
    photo: 'https://csap.co.in/wp-content/uploads/2025/10/JRK-1.jpg',
    highlights: ['PGD in Security Management', 'APSC CCE Interview appeared', 'UPSC CAPF (AC) PI appeared', 'AFCAT SSB appeared'],
  },
  {
    name: 'Bijit Dhekial', role: 'Faculty', experience: '', subjects: 'Maths and Reasoning', order: 5,
    photo: 'https://csap.co.in/wp-content/uploads/2025/10/BIJIT.jpg',
    highlights: ['4+ years of experience mentoring aspirants across Assam', 'Subject expert – Maths and Reasoning'],
  },
] as const

// Members removed on request (deleted from the live site when the team import runs).
export const teamRemoved = ['Izaaz Ahmed'] as const
