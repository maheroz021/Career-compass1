
import { GoogleGenAI, Type } from "@google/genai";
import { 
  RoadmapItem, 
  InterviewQuestion, 
  InterviewFeedback, 
  SkillGapAnalysisResult, 
  Skill, 
  MarketTrend, 
  JobMatch, 
  Project,
  ProfileReviewResult,
  CompanyPrepGuide,
  PostIdea,
  ResumeData,
  ATSAnalysisResult
} from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateCareerRoadmap = async (targetRole: string, currentYear: number, degree: string): Promise<RoadmapItem[]> => {
  if (!apiKey) return [];

  const prompt = `Create a comprehensive 4-year learning guide and career roadmap for a student pursuing "${degree}" who wants to become a "${targetRole}". 
  The student is currently in Year ${currentYear}.
  
  For EACH year (from Year 1 to Year 4), provide:
  1. The specific Term/Semester focus.
  2. A Main Focus Area (e.g., Fundamentals, Advanced Dev, Internship).
  3. 3-4 Actionable Items (Technical & Soft Skills).
  4. 2-3 Specific Learning Resources (Actual names of Books, Courses on Coursera/Udemy, or YouTube channels).
  
  Ensure the difficulty scales appropriately from Year 1 to Year 4.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            roadmap: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  year: { type: Type.INTEGER },
                  term: { type: Type.STRING },
                  focusArea: { type: Type.STRING },
                  actionItems: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  resources: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        type: { type: Type.STRING }, // removed enum to be more flexible
                        platform: { type: Type.STRING }
                      }
                    }
                  }
                },
                required: ['year', 'term', 'focusArea', 'actionItems']
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    const data = JSON.parse(text);
    return data.roadmap || [];
  } catch (error) {
    console.error("Gemini Roadmap Error:", error);
    return [];
  }
};

export const generateCompanyRoadmap = async (companyName: string, currentYear: number): Promise<CompanyPrepGuide | null> => {
  if (!apiKey) return null;

  const prompt = `Create a comprehensive preparation guide for a university student currently in Year ${currentYear} aspiring to get placed in "${companyName}". 
  Include a summary of what they look for (values/culture), key technical skills required, a list of their typical interview rounds, and a semester-by-semester roadmap of action items.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            companyName: { type: Type.STRING },
            summary: { type: Type.STRING },
            keySkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            interviewProcess: { type: Type.ARRAY, items: { type: Type.STRING } },
            roadmap: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  year: { type: Type.INTEGER },
                  term: { type: Type.STRING },
                  focusArea: { type: Type.STRING },
                  actionItems: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                },
                required: ['year', 'term', 'focusArea', 'actionItems']
              }
            }
          },
          required: ['companyName', 'summary', 'keySkills', 'interviewProcess', 'roadmap']
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text) as CompanyPrepGuide;
  } catch (error) {
    console.error("Gemini Company Roadmap Error:", error);
    return null;
  }
};

export const chatWithCareerCoach = async (history: { role: 'user' | 'model', text: string }[], message: string) => {
  if (!apiKey) return "AI Service Unavailable (Missing Key)";

  try {
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: "You are an experienced campus placement career coach. Be encouraging, concise, and provide actionable advice for students preparing for interviews and technical roles."
      },
      history: history.map(h => ({ role: h.role, parts: [{ text: h.text }] }))
    });

    const result = await chat.sendMessage({ message });
    return result.text;
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "Sorry, I'm having trouble connecting to the career database right now.";
  }
};

export const chatWithLanguageTutor = async (
  history: { role: 'user' | 'model', text: string }[], 
  message: string, 
  nativeLanguage: string,
  topic: string
) => {
  if (!apiKey) return "AI Service Unavailable (Missing Key)";

  const systemInstruction = `You are a friendly and interactive English communication tutor. 
  The user's native language is ${nativeLanguage}. 
  The current learning topic is: "${topic}".
  
  Your Goal: Help the user improve their professional English.
  
  Guidelines:
  1. If the user makes a grammar mistake in English, explain the correction in ${nativeLanguage} so they understand the logic, then show the correct English version.
  2. If the user speaks in ${nativeLanguage}, translate it to professional English for them and ask them to repeat it.
  3. Keep the tone fun, encouraging, and gamified (like Duolingo).
  4. Provide short, bite-sized feedback.
  5. Use occasional emojis.
  
  Example interaction if language is Kannada:
  User: "My self Alex."
  AI: "Oho! 'My self' yaru helabaradu (You shouldn't say 'My self'). It is grammatically incorrect.
  Correct way: 'I am Alex' or 'My name is Alex'.
  Try introducing yourself again!"`;

  try {
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: systemInstruction
      },
      history: history.map(h => ({ role: h.role, parts: [{ text: h.text }] }))
    });

    const result = await chat.sendMessage({ message });
    return result.text;
  } catch (error) {
    console.error("Gemini Language Tutor Error:", error);
    return "I'm having trouble connecting to the language server.";
  }
};

export const generateInterviewQuestions = async (role: string): Promise<InterviewQuestion[]> => {
  if (!apiKey) return [];

  const prompt = `Generate 3 interview questions for a fresher applying for a ${role} position. Mix technical and behavioral questions.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER },
                  question: { type: Type.STRING },
                  topic: { type: Type.STRING }
                },
                required: ['id', 'question', 'topic']
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    const data = JSON.parse(text);
    return data.questions || [];
  } catch (error) {
    console.error("Gemini Interview Question Error:", error);
    return [];
  }
};

export const evaluateInterviewAnswer = async (question: string, answer: string): Promise<InterviewFeedback | null> => {
  if (!apiKey) return null;

  const prompt = `Evaluate the following interview answer for a fresher.
  Question: "${question}"
  Answer: "${answer}"
  
  Provide a score out of 10, concise feedback on clarity/relevance, and one specific tip for improvement.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questionId: { type: Type.INTEGER }, 
            score: { type: Type.INTEGER },
            feedback: { type: Type.STRING },
            improvementTip: { type: Type.STRING }
          },
          required: ['score', 'feedback', 'improvementTip']
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text) as InterviewFeedback;
  } catch (error) {
    console.error("Gemini Evaluation Error:", error);
    return null;
  }
};

export const analyzeSkillGap = async (currentSkills: Skill[], targetRole: string): Promise<SkillGapAnalysisResult | null> => {
  if (!apiKey) return null;

  const skillsList = currentSkills.map(s => `${s.name} (${s.level})`).join(', ');
  const prompt = `Analyze the skill gap for a student aspiring to be a "${targetRole}".
  Current Skills: ${skillsList}.
  Identify critical missing skills. For each missing skill, assign a priority (High, Medium, Low) and suggest 2 specific courses (e.g. Coursera/Udemy/Youtube).`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            role: { type: Type.STRING },
            strengthSkills: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            missingSkills: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  priority: { type: Type.STRING },
                  reason: { type: Type.STRING },
                  recommendation: { type: Type.STRING },
                  courses: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ['name', 'priority', 'reason', 'recommendation', 'courses']
              }
            }
          },
          required: ['role', 'missingSkills', 'strengthSkills']
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text) as SkillGapAnalysisResult;
  } catch (error) {
    console.error("Gemini Skill Gap Error:", error);
    return {
      role: targetRole,
      strengthSkills: [],
      missingSkills: [
        {
          name: "Service Busy",
          priority: "High",
          reason: "Could not connect to AI service.",
          recommendation: "Please try again.",
          courses: []
        }
      ]
    };
  }
};

export const getMarketTrends = async (): Promise<MarketTrend[]> => {
  if (!apiKey) return [];

  const prompt = `Identify 4 trending job roles for freshers in the tech industry for the current year. Include demand level, growth percentage, and top 3 required skills.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            trends: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  role: { type: Type.STRING },
                  demandLevel: { type: Type.STRING },
                  growth: { type: Type.STRING },
                  topSkills: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ['role', 'demandLevel', 'growth', 'topSkills']
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    const data = JSON.parse(text);
    return data.trends || [];
  } catch (error) {
    console.error("Gemini Market Trends Error:", error);
    return [];
  }
};

export const getJobMatches = async (projects: Project[]): Promise<JobMatch[]> => {
  if (!apiKey) return [];

  const projectDesc = projects.map(p => `${p.title}: ${p.desc} (Tech: ${p.tech})`).join('\n');
  const prompt = `Based on these student projects, suggest 3 specific job titles they are best suited for. 
  Explain why, suggest 2 types of companies.
  Crucially, recommend 2 specific courses (with platform name like Coursera/Udemy) that would help them secure this specific job.
  
  Projects:
  ${projectDesc}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matches: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  jobTitle: { type: Type.STRING },
                  matchScore: { type: Type.INTEGER },
                  reason: { type: Type.STRING },
                  recommendedCompanies: { type: Type.ARRAY, items: { type: Type.STRING } },
                  recommendedCourses: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ['jobTitle', 'matchScore', 'reason', 'recommendedCompanies', 'recommendedCourses']
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    const data = JSON.parse(text);
    return data.matches || [];
  } catch (error) {
    console.error("Gemini Job Match Error:", error);
    return [];
  }
};

export const reviewProfile = async (content: string, type: 'LinkedIn' | 'Resume'): Promise<ProfileReviewResult | null> => {
  if (!apiKey) return null;

  const prompt = `Review this ${type} profile content for a student.
  Content: "${content}"
  Provide a score (1-10), list 3 strengths, 3 specific improvements, and a rewritten professional version of the content.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
            refinedContent: { type: Type.STRING }
          },
          required: ['score', 'strengths', 'improvements', 'refinedContent']
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text) as ProfileReviewResult;
  } catch (error) {
    console.error("Gemini Profile Review Error:", error);
    return null;
  }
};

export const generateSocialPostIdeas = async (projects: Project[], skills: Skill[]): Promise<PostIdea[]> => {
  if (!apiKey) return [];

  const skillNames = skills.map(s => s.name).join(', ');
  const projectTitles = projects.map(p => p.title).join(', ');
  
  const prompt = `Generate 2 professional LinkedIn post ideas for a student.
  Skills: ${skillNames}
  Projects: ${projectTitles}
  
  For each idea, provide a topic, the post content (engaging and professional), and 3 hashtags.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            ideas: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  topic: { type: Type.STRING },
                  content: { type: Type.STRING },
                  hashtags: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ['topic', 'content', 'hashtags']
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    const data = JSON.parse(text);
    return data.ideas || [];
  } catch (error) {
    console.error("Gemini Post Idea Error:", error);
    return [];
  }
};

export const calculateATSScore = async (resume: ResumeData, targetRole: string): Promise<ATSAnalysisResult | null> => {
  if (!apiKey) return null;

  const resumeText = `
  Name: ${resume.fullName}
  Summary: ${resume.summary}
  Skills: ${resume.skills.join(', ')}
  Experience: ${resume.experience.map(e => `${e.role} at ${e.company}: ${e.description}`).join('. ')}
  Education: ${resume.education.map(e => `${e.degree} at ${e.institution}`).join('. ')}
  Projects: ${resume.projects.map(p => `${p.title}: ${p.desc} using ${p.tech}`).join('. ')}
  `;

  const prompt = `Act as an ATS (Applicant Tracking System) Scanner.
  Target Role: "${targetRole}"
  Resume Content: "${resumeText}"

  Analyze the resume for the target role.
  1. Provide a match score (0-100).
  2. Determine Match Status (High/Medium/Low).
  3. List missing critical keywords.
  4. List any formatting issues (e.g. lack of metrics).
  5. Rate the impact score (0-10) based on action verbs.
  6. Provide a concise summary feedback.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            matchStatus: { type: Type.STRING },
            missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            formattingIssues: { type: Type.ARRAY, items: { type: Type.STRING } },
            impactScore: { type: Type.INTEGER },
            summaryFeedback: { type: Type.STRING }
          },
          required: ['score', 'matchStatus', 'missingKeywords', 'formattingIssues', 'impactScore', 'summaryFeedback']
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text) as ATSAnalysisResult;
  } catch (error) {
    console.error("Gemini ATS Error:", error);
    return null;
  }
};
