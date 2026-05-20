// lib/tool-data.ts — javari-animal-rescue
// Tool definitions extracted from page.tsx to keep JSX parser clean
// CR AudioViz AI · May 2026

const ACTIONS = [
  { id: 'adoption_listing',  label: '🐕 Adoption Listing',   desc: 'Write a compelling adoption profile for an animal',       prompt: (v) => `Write a heartfelt, detailed adoption listing for: ${v.animalName || 'the animal'}, ${v.breed || ''}, ${v.age || ''}, personality: ${v.personality || ''}. Include their story, temperament, ideal home, and a compelling CTA.` },
  { id: 'grant_application', label: '📋 Grant Application',   desc: 'Write a full grant application for your rescue',           prompt: (v) => `Write a professional grant application for ${v.orgName || 'our animal rescue'} requesting funding for: ${v.purpose || 'rescue operations'}. Include mission statement, impact metrics, budget justification, and closing ask. Amount: $${v.amount || '5,000'}.` },
  { id: 'fundraising_email', label: '💌 Fundraising Email',   desc: 'Compelling donor email that converts',                     prompt: (v) => `Write a compelling fundraising email for ${v.orgName || 'our animal rescue'}. Campaign: ${v.campaign || 'general operations'}. Goal: $${v.goal || '1,000'}. Make it emotional, urgent, and specific with a clear CTA.` },
  { id: 'social_media_post', label: '📱 Social Media Post',   desc: 'Attention-grabbing post for Instagram/Facebook/X',        prompt: (v) => `Create 3 social media posts (Instagram, Facebook, X/Twitter) for ${v.orgName || 'our rescue'} about: ${v.topic || v.animalName || 'an animal in need'}. Make each platform-specific with appropriate hashtags and emojis.` },
  { id: 'donation_appeal',   label: '🙏 Donation Appeal',     desc: 'Emergency or general donation appeal letter',              prompt: (v) => `Write a powerful donation appeal letter for ${v.orgName || 'our rescue'}. Situation: ${v.situation || 'animals need help urgently'}. Be specific, emotional, and include a clear donation CTA with impact per dollar.` },
  { id: 'volunteer_guide',   label: '🤝 Volunteer Guide',     desc: 'Onboarding guide and role descriptions for volunteers',   prompt: (v) => `Create a complete volunteer onboarding guide for ${v.orgName || 'our animal rescue'}. Include: welcome message, shelter rules, role descriptions, animal handling basics, shift scheduling info, and emergency contacts template.` },
  { id: 'care_guide',        label: '🏥 Animal Care Guide',   desc: 'Detailed care instructions for a specific animal/breed',  prompt: (v) => `Write a complete care guide for ${v.animalName || 'this animal'} — ${v.breed || v.species || 'mixed breed'}. Include: feeding schedule, exercise needs, grooming, vet care, behavioral notes, and special needs: ${v.specialNeeds || 'none noted'}.` },
]


const FIELDS = {
  adoption_listing:  { label: 'Animal Details', fields: [{ id: 'animalName', label: 'Animal Name', placeholder: 'Bella' }, { id: 'breed', label: 'Breed', placeholder: 'Labrador Mix' }, { id: 'age', label: 'Age', placeholder: '2 years' }, { id: 'personality', label: 'Personality', placeholder: 'Playful, loves kids, house trained...' }] },
  grant_application: { label: 'Grant Details', fields: [{ id: 'orgName', label: 'Organization Name', placeholder: 'Happy Paws Rescue' }, { id: 'purpose', label: 'Purpose of Grant', placeholder: 'Medical care for injured animals' }, { id: 'amount', label: 'Amount Requested ($)', placeholder: '5000' }] },
  fundraising_email: { label: 'Campaign Details', fields: [{ id: 'orgName', label: 'Organization Name', placeholder: 'Happy Paws Rescue' }, { id: 'campaign', label: 'Campaign Name', placeholder: 'Winter Shelter Fund' }, { id: 'goal', label: 'Fundraising Goal ($)', placeholder: '2000' }] },
  social_media_post: { label: 'Post Details', fields: [{ id: 'orgName', label: 'Organization Name', placeholder: 'Happy Paws Rescue' }, { id: 'topic', label: 'Post Topic', placeholder: 'Urgent adoption need for senior dog named Max' }] },
  donation_appeal:   { label: 'Appeal Details', fields: [{ id: 'orgName', label: 'Organization Name', placeholder: 'Happy Paws Rescue' }, { id: 'situation', label: 'Situation', placeholder: 'Overcrowded shelter, 20 animals need homes by Friday' }] },
  volunteer_guide:   { label: 'Organization Details', fields: [{ id: 'orgName', label: 'Organization Name', placeholder: 'Happy Paws Rescue' }] },
  care_guide:        { label: 'Animal Details', fields: [{ id: 'animalName', label: 'Animal Name / Type', placeholder: 'Senior cat, 12 years old' }, { id: 'breed', label: 'Breed / Species', placeholder: 'Domestic Shorthair' }, { id: 'specialNeeds', label: 'Special Needs', placeholder: 'Diabetes, requires insulin twice daily' }] },
}
