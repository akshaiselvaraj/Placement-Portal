export interface AtsBreakdown {
  score: number;
  weights: {
    skills: number;
    education: number;
    cgpa: number;
    experience: number;
    certifications: number;
    projects: number;
  };
  scores: {
    skillsScore: number;
    educationScore: number;
    cgpaScore: number;
    experienceScore: number;
    certificationsScore: number;
    projectsScore: number;
  };
  matchedSkills: string[];
  missingSkills: string[];
  eligibility: {
    departmentEligible: boolean;
    gradYearEligible: boolean;
    cgpaEligible: boolean;
  };
  explanations: string[];
  aiPlagiarismScore?: number;
  aiPlagiarismReport?: {
    score: number;
    flaggedPhrases: string[];
    explanation: string;
  };
}

export class AtsService {
  /**
   * Normalizes skill strings into canonical lowercase tokens
   * e.g. "React.js" -> "react", "JavaScript" -> "javascript", "NodeJS" -> "node"
   */
  private static normalizeSkill(skill: string): string {
    const clean = skill
      .toLowerCase()
      .trim()
      .replace(/[._\-\s]+/g, '');

    const aliases: Record<string, string> = {
      js: 'javascript',
      javascript: 'javascript',
      ts: 'typescript',
      typescript: 'typescript',
      react: 'react',
      reactjs: 'react',
      reactnative: 'reactnative',
      node: 'nodejs',
      nodejs: 'nodejs',
      py: 'python',
      python: 'python',
      python3: 'python',
      postgres: 'postgresql',
      postgresql: 'postgresql',
      mongo: 'mongodb',
      mongodb: 'mongodb',
      cpp: 'c++',
      cplusplus: 'c++',
      cs: 'c#',
      csharp: 'c#',
    };

    return aliases[clean] || clean;
  }

  public static checkAiPlagiarism(text: string): { score: number; flaggedPhrases: string[]; explanation: string } {
    if (!text || text.trim().length === 0) {
      return { score: 0, flaggedPhrases: [], explanation: 'No text provided to analyze.' };
    }

    const aiBuzzwords = [
      'delve', 'testament', 'spearheaded', 'synergy', 'innovative',
      'transformative', 'revolutionary', 'leverage', 'robust', 'meticulously',
      'ecosystem', 'fostered', 'streamlined', 'seamlessly', 'cutting-edge',
      'rapidly evolving', 'not only', 'but also', 'pioneered', 'impactful',
      'utilized', 'harnessed', 'furthermore', 'moreover', 'in conclusion',
      'designed to', 'demystify', 'elevate', 'groundbreaking', 'vibrant'
    ];

    const textLower = text.toLowerCase();
    const flaggedPhrases: string[] = [];

    aiBuzzwords.forEach((word) => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = textLower.match(regex);
      if (matches && matches.length > 0) {
        flaggedPhrases.push(word);
      }
    });

    if (textLower.includes('not only') && textLower.includes('but also')) {
      if (!flaggedPhrases.includes('not only... but also')) {
        flaggedPhrases.push('not only... but also');
      }
    }

    const wordCount = text.split(/\s+/).filter(w => w.length > 0).length || 1;
    const uniqueFlaggedCount = flaggedPhrases.length;

    let densityFactor = 15;
    if (wordCount > 150) {
      densityFactor = 8;
    } else if (wordCount > 80) {
      densityFactor = 11;
    }

    let score = Math.min(100, Math.round(uniqueFlaggedCount * densityFactor));

    const verbToVerbMatches = textLower.match(/\b[a-z]+ed\s+to\s+[a-z]+/g);
    if (verbToVerbMatches && verbToVerbMatches.length > 2) {
      score = Math.min(100, score + 10);
      if (!flaggedPhrases.includes('repetitive "verb-ed to..." structure')) {
        flaggedPhrases.push('repetitive "verb-ed to..." structure');
      }
    }

    let explanation = 'Text appears highly human-written with organic structure and minimal AI jargon.';
    if (score >= 70) {
      explanation = 'Highly likely to be AI-generated (e.g. ChatGPT). It contains a high density of common AI transitional keywords and robotic resume phrasing.';
    } else if (score >= 35) {
      explanation = 'Possibly contains mixed AI and human-written content. Try rephrasing typical corporate jargon and adding specific project metrics.';
    }

    return {
      score,
      flaggedPhrases,
      explanation
    };
  }

  public static calculateMatch(candidate: any, job: any): AtsBreakdown {
    const requiredSkills: string[] = job.requiredSkills || [];
    const preferredSkills: string[] = job.preferredSkills || [];
    const minCgpa: number | null = job.minCgpa ?? null;
    const eligibleDepartments: string[] = job.eligibleDepartments || [];
    const eligibleGradYears: number[] = job.eligibleGradYears || [];
    const requiredExperience: number = job.requiredExperience || 0;

    const candidateSkillsRaw: string[] = (candidate.skills || []).map((s: any) => s.name || s);
    const candidateSkillsNormalized = candidateSkillsRaw.map(this.normalizeSkill);

    // 1. SKILLS MATCHING (Weight: 50%)
    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];

    requiredSkills.forEach((reqSkill) => {
      const normalizedReq = this.normalizeSkill(reqSkill);
      if (candidateSkillsNormalized.includes(normalizedReq)) {
        matchedSkills.push(reqSkill);
      } else {
        missingSkills.push(reqSkill);
      }
    });

    let skillsScore = 100;
    if (requiredSkills.length > 0) {
      skillsScore = Math.round((matchedSkills.length / requiredSkills.length) * 100);
    }

    // Give bonus for preferred skills if matched
    let preferredMatchedCount = 0;
    preferredSkills.forEach((prefSkill) => {
      if (candidateSkillsNormalized.includes(this.normalizeSkill(prefSkill))) {
        preferredMatchedCount++;
      }
    });
    if (preferredSkills.length > 0 && skillsScore < 100) {
      const bonus = Math.round((preferredMatchedCount / preferredSkills.length) * 10);
      skillsScore = Math.min(100, skillsScore + bonus);
    }

    // 2. EDUCATION ELIGIBILITY (Weight: 15%)
    let departmentEligible = true;
    if (eligibleDepartments.length > 0 && candidate.department) {
      const candDept = candidate.department.toLowerCase().trim();
      departmentEligible = eligibleDepartments.some(
        (dept) => dept.toLowerCase().trim() === candDept || candDept.includes(dept.toLowerCase().trim())
      );
    }

    let gradYearEligible = true;
    if (eligibleGradYears.length > 0 && candidate.batch) {
      const candYear = parseInt(candidate.batch, 10);
      if (!isNaN(candYear)) {
        gradYearEligible = eligibleGradYears.includes(candYear);
      }
    }

    const educationScore = departmentEligible && gradYearEligible ? 100 : departmentEligible || gradYearEligible ? 50 : 0;

    // 3. CGPA MATCHING (Weight: 15%)
    let cgpaEligible = true;
    let cgpaScore = 100;
    const candCgpa = candidate.cgpa ?? null;

    if (minCgpa !== null) {
      if (candCgpa === null) {
        cgpaEligible = false;
        cgpaScore = 50;
      } else if (candCgpa >= minCgpa) {
        cgpaEligible = true;
        cgpaScore = 100;
      } else {
        cgpaEligible = false;
        cgpaScore = Math.max(0, Math.round((candCgpa / minCgpa) * 100));
      }
    }

    // 4. EXPERIENCE MATCHING (Weight: 10%)
    let experienceScore = 100;
    const projectCount = (candidate.projects || []).length;
    const certCount = (candidate.certifications || []).length;
    const estimatedExp = (projectCount * 0.5) + (certCount * 0.3); // Rule-based estimation in years

    if (requiredExperience > 0) {
      if (estimatedExp >= requiredExperience) {
        experienceScore = 100;
      } else {
        experienceScore = Math.round((estimatedExp / requiredExperience) * 100);
      }
    }

    // 5. CERTIFICATIONS MATCHING (Weight: 5%)
    const certificationsScore = certCount > 0 ? 100 : 50;

    // 6. PROJECTS MATCHING (Weight: 5%)
    const projectsScore = projectCount > 0 ? 100 : 50;

    // Calculate AI plagiarism on bio and project descriptions
    let combinedText = '';
    if (candidate.bio) combinedText += ' ' + candidate.bio;
    if (candidate.projects && Array.isArray(candidate.projects)) {
      candidate.projects.forEach((proj: any) => {
        if (proj.description) combinedText += ' ' + proj.description;
      });
    }
    const aiPlagiarismReport = this.checkAiPlagiarism(combinedText);
    const weights = {
      skills: 0.50,
      education: 0.15,
      cgpa: 0.15,
      experience: 0.10,
      certifications: 0.05,
      projects: 0.05,
    };

    const totalScore = Math.round(
      skillsScore * weights.skills +
      educationScore * weights.education +
      cgpaScore * weights.cgpa +
      experienceScore * weights.experience +
      certificationsScore * weights.certifications +
      projectsScore * weights.projects
    );

    // RULE-BASED EXPLANATIONS
    const explanations: string[] = [];

    if (requiredSkills.length > 0) {
      explanations.push(`Candidate matches ${matchedSkills.length} of ${requiredSkills.length} required skills.`);
    } else {
      explanations.push('No mandatory required skills defined for this job posting.');
    }

    if (missingSkills.length > 0) {
      explanations.push(`Missing required skill(s): ${missingSkills.join(', ')}.`);
    }

    if (minCgpa !== null) {
      if (candCgpa !== null && candCgpa >= minCgpa) {
        explanations.push(`Candidate meets minimum CGPA requirement (${candCgpa.toFixed(2)} ≥ ${minCgpa}).`);
      } else if (candCgpa !== null) {
        explanations.push(`Candidate CGPA (${candCgpa.toFixed(2)}) is below the required minimum (${minCgpa}).`);
      } else {
        explanations.push(`Candidate has not provided CGPA (Required: ${minCgpa}).`);
      }
    }

    if (eligibleDepartments.length > 0) {
      if (departmentEligible) {
        explanations.push(`Candidate department (${candidate.department || 'N/A'}) is eligible.`);
      } else {
        explanations.push(`Candidate department (${candidate.department || 'N/A'}) does not match eligible departments (${eligibleDepartments.join(', ')}).`);
      }
    }

    if (eligibleGradYears.length > 0) {
      if (gradYearEligible) {
        explanations.push(`Candidate graduation year (${candidate.batch || 'N/A'}) is eligible.`);
      } else {
        explanations.push(`Candidate graduation year (${candidate.batch || 'N/A'}) is not in eligible list (${eligibleGradYears.join(', ')}).`);
      }
    }

    return {
      score: totalScore,
      weights: {
        skills: 50,
        education: 15,
        cgpa: 15,
        experience: 10,
        certifications: 5,
        projects: 5,
      },
      scores: {
        skillsScore,
        educationScore,
        cgpaScore,
        experienceScore,
        certificationsScore,
        projectsScore,
      },
      matchedSkills,
      missingSkills,
      eligibility: {
        departmentEligible,
        gradYearEligible,
        cgpaEligible,
      },
      explanations,
      aiPlagiarismScore: aiPlagiarismReport.score,
      aiPlagiarismReport,
    };
  }
}

export default AtsService;
