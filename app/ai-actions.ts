'use server';

import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';

const generatePlanSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
});

export interface PlanStep {
  step: number;
  title: string;
  description: string;
  skills: string[];
  estimatedHours?: number;
}

export interface ProjectPlan {
  overview: string;
  steps: PlanStep[];
  totalEstimatedHours: number;
  suggestedBudget: number;
}

export async function generateProjectPlan(input: unknown) {
  try {
    // Validate input
    const { name, description } = generatePlanSchema.parse(input);

    // Check for API key
    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your-api-key-here') {
      return {
        success: false,
        error: 'Anthropic API key not configured. Please add your API key to .env file.',
      };
    }

    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Create the prompt for Claude
    const prompt = `You are an expert software development planner specializing in Claude Code workflows. Analyze the following project and create a detailed implementation plan.

Project Name: ${name}
Project Description: ${description}

Based on the CLAUDE.md guidelines, create a step-by-step implementation plan that includes:
1. High-level overview (2-3 sentences)
2. Detailed steps with specific Claude Code skills to use
3. Estimated hours for each step
4. Total project estimate

Available Claude Code Skills:
- frontend-architect: React, Next.js, TypeScript, Tailwind CSS, UI components
- backend-engineer: Node.js, API development, PostgreSQL, Prisma, authentication
- database-architect: Database design, schema optimization, migrations
- api-designer: REST API design, GraphQL, endpoint architecture
- qa-engineer: Testing strategies, Jest, Playwright, Cypress
- devops-specialist: Deployment, CI/CD, Vercel, Railway, Docker
- security-auditor: Security reviews, vulnerability fixes
- performance-optimizer: Web performance, Core Web Vitals, optimization
- code-reviewer: Code quality, best practices, refactoring
- documentation-writer: Technical documentation, README files, API docs
- ux-researcher: User research, usability testing, personas
- accessibility-specialist: WCAG compliance, screen reader optimization

Please respond with a JSON object in this exact format:
{
  "overview": "Brief project overview",
  "steps": [
    {
      "step": 1,
      "title": "Step title",
      "description": "Detailed description of what to do",
      "skills": ["skill-name-1", "skill-name-2"],
      "estimatedHours": 4
    }
  ],
  "totalEstimatedHours": 20,
  "suggestedBudget": 2000
}

Important: Return ONLY the JSON object, no markdown formatting, no additional text.`;

    // Call Claude API
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Extract the response text
    const responseText = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    // Parse the JSON response
    let plan: ProjectPlan;
    try {
      // Remove markdown code blocks if present
      const cleanedResponse = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      plan = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('Failed to parse Claude response:', responseText);
      return {
        success: false,
        error: 'Failed to parse AI response. Please try again.',
      };
    }

    return {
      success: true,
      data: plan,
    };
  } catch (error) {
    console.error('Failed to generate project plan:', error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0].message,
      };
    }

    if (error instanceof Anthropic.APIError) {
      return {
        success: false,
        error: `API Error: ${error.message}`,
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate project plan',
    };
  }
}
