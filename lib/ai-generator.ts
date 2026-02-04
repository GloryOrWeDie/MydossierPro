import OpenAI from 'openai';

// Initialize OpenAI client (will be undefined if API key is not set)
let openai: OpenAI | null = null;

if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export async function generateCoverLetter(tenantData: any): Promise<string> {
  // Fallback template if AI is not available
  const fallbackTemplate = `Dear ${tenantData.landlord_name || 'Property Owner'},

I am writing to express my strong interest in the property at ${tenantData.property_address}.

I am ${tenantData.full_name}, currently employed as ${tenantData.job_title} at ${tenantData.employer}, with a stable monthly income of $${tenantData.monthly_income}. I am seeking to move in on ${new Date(tenantData.move_in_date).toLocaleDateString()} with ${tenantData.num_occupants} ${tenantData.num_occupants === 1 ? 'person' : 'people'}.

${tenantData.personal_message || 'I am a responsible tenant with excellent rental history and references.'}

I have attached all required documents including proof of income, previous lease, and identification. I am ready to move forward with the application process and available to discuss any questions you may have.

Thank you for your consideration.

Best regards,
${tenantData.full_name}`;

  if (!openai) {
    console.warn('OpenAI API key not set, using fallback template');
    return fallbackTemplate;
  }

  try {
    const prompt = `
Generate a professional rental application cover letter.

Applicant: ${tenantData.full_name}
Property: ${tenantData.property_address}
${tenantData.landlord_name ? `Landlord: ${tenantData.landlord_name}` : ''}
Move-in date: ${tenantData.move_in_date}
Occupants: ${tenantData.num_occupants} ${tenantData.num_occupants === 1 ? 'person' : 'people'}
${tenantData.personal_message ? `Personal note: ${tenantData.personal_message}` : ''}

Employer: ${tenantData.employer}
Position: ${tenantData.job_title}
Income: $${tenantData.monthly_income}/month

Write a warm but professional cover letter (150-200 words):
- Express interest in the property
- Highlight reliability (stable employment, good income)
- Mention move-in date
- Sound confident but respectful
- End with contact invitation

Format as a proper business letter starting with "Dear [Landlord Name or "Property Owner"],"
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a professional rental application assistant. Write clear, warm, professional cover letters.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    return response.choices[0].message.content || fallbackTemplate;
  } catch (error) {
    console.error('Error generating cover letter with AI:', error);
    return fallbackTemplate;
  }
}

export async function generateEmailBody(tenantData: any, applicationUrl: string): Promise<string> {
  // Fallback template if AI is not available
  const fallbackTemplate = `Hi ${tenantData.landlord_name || 'Landlord'},

I'm interested in your property at ${tenantData.property_address}.

I've prepared a complete rental application package that includes all required documents and information.

View my application online: ${applicationUrl}

I am ${tenantData.full_name}, currently employed as ${tenantData.job_title} at ${tenantData.employer} with a monthly income of $${tenantData.monthly_income}. I'm looking to move in on ${new Date(tenantData.move_in_date).toLocaleDateString()}.

All documents are included in the attached PDF, and you can also view them online at the link above.

Please let me know if you need any additional information.

Best regards,
${tenantData.full_name}
${tenantData.email}
${tenantData.phone ? tenantData.phone : ''}`;

  if (!openai) {
    console.warn('OpenAI API key not set, using fallback template');
    return fallbackTemplate;
  }

  try {
    const prompt = `
Generate a professional email to send a rental application.

Applicant: ${tenantData.full_name}
Property: ${tenantData.property_address}
${tenantData.landlord_name ? `Landlord: ${tenantData.landlord_name}` : 'Landlord: (not specified)'}
Application link: ${applicationUrl}

Write a concise email (100-150 words):
- Professional subject line
- Brief introduction
- Mention interest in property
- Highlight key info (employed, ready to move, etc.)
- Direct them to view application (link + attached PDF)
- Provide contact info
- Professional closing

Return ONLY the email body (no subject line, that will be separate).
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a professional email writing assistant for rental applications.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 400,
    });

    return response.choices[0].message.content || fallbackTemplate;
  } catch (error) {
    console.error('Error generating email with AI:', error);
    return fallbackTemplate;
  }
}
