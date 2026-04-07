import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function generateAIInsights(workspaceData: any) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `You are an AI business advisor for startups. Analyze the following workspace data and provide 4-6 actionable insights to help the startup succeed.

Workspace Data:
- Name: ${workspaceData.name}
- Description: ${workspaceData.description}
- Total Tasks: ${workspaceData.analytics.tasks.total}
- Completed Tasks: ${workspaceData.analytics.tasks.completed}
- Completion Rate: ${workspaceData.analytics.tasks.completionPercentage}%
- Overdue Tasks: ${workspaceData.analytics.tasks.overdue}
- Team Size: ${workspaceData.analytics.team?.length || 0}
- Milestones: ${workspaceData.analytics.milestones.achieved}/${workspaceData.analytics.milestones.total}
- Overdue Milestones: ${workspaceData.analytics.milestones.overdue}

Provide insights in the following JSON format:
[
  {
    "type": "suggestion|warning|opportunity|recommendation",
    "title": "Short title (max 5 words)",
    "description": "Actionable description (1-2 sentences)"
  }
]

Focus on:
1. Task management and productivity
2. Team performance and workload
3. Milestone planning and execution
4. Growth opportunities
5. Risk mitigation

Return ONLY the JSON array, no additional text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error('Failed to parse AI response');
  } catch (error) {
    console.error('Gemini AI error:', error);
    throw error;
  }
}

export async function generatePitchDeck(workspaceData: any) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const milestonesText = workspaceData.milestones?.map((m: any) => 
      `- ${m.title} (${m.status}, target: ${new Date(m.targetDate).toLocaleDateString()})`
    ).join('\n') || 'No milestones set';

    const prompt = `You are an expert pitch deck writer for startups. Create a compelling investor pitch deck in Markdown format.

Startup Information:
- Name: ${workspaceData.name}
- Description: ${workspaceData.description}
- Industry: ${workspaceData.industry || 'Technology'}
- Team Size: ${workspaceData.analytics.team?.length || 1} members
- Task Completion Rate: ${workspaceData.analytics.tasks.completionPercentage}%
- Milestones Achieved: ${workspaceData.analytics.milestones.achieved}/${workspaceData.analytics.milestones.total}
- Current Milestones:
${milestonesText}

Create a professional pitch deck with these sections:
1. Problem Statement (based on description)
2. Solution (how the startup solves it)
3. Market Opportunity
4. Traction & Metrics (use the real data provided)
5. Business Model
6. Roadmap (use actual milestones)
7. Team
8. Competitive Advantage
9. The Ask
10. Contact

Make it compelling, data-driven, and investor-ready. Use Markdown formatting with headers, bullet points, and bold text.
Return ONLY the Markdown content, no additional commentary.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini AI error:', error);
    throw error;
  }
}
