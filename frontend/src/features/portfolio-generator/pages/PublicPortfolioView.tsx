import { useParams } from 'react-router-dom';
import { usePortfolios } from '../hooks/usePortfolios';
import { PortfolioPreview } from '../components/PortfolioPreview';
import { LoadingSkeleton } from '@/components/common';

const fallbackPortfolios: Record<string, any> = {
  'rakshana-s': {
    themeId: 'neon',
    data: {
      name: 'Rakshana S.',
      tagline: 'Full Stack Software Engineer & Distributed Systems Developer',
      email: 'rakshana@gmail.com',
      phone: '+91 98765 43210',
      location: 'Chennai, India',
      website: 'https://rakshana.dev',
      github: 'https://github.com/rakshana',
      linkedin: 'https://linkedin.com/in/rakshana',
      bio: 'Final year Computer Science undergraduate passionate about high-performance web systems, distributed architecture, and elegant UI engineering. Currently interviewing for Software Engineer roles.',
      projects: [
        {
          title: 'Distributed Cloud Storage Engine',
          description: 'High-throughput object storage platform built with Go, gRPC, and Redis cluster caching. Handles parallel chunk uploads with automatic data replication.',
          repoUrl: 'https://github.com/rakshana/cloud-store',
          techStack: ['Go', 'gRPC', 'Redis', 'Docker', 'Kubernetes'],
        },
        {
          title: 'Real-time Placement Portal System',
          description: 'Full-stack enterprise campus placement ecosystem supporting live interview desk, role-based workflows, analytics, and resume verification.',
          demoUrl: 'https://placement-portal.demo',
          repoUrl: 'https://github.com/rakshana/placement-portal',
          techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'TailwindCSS'],
        },
      ],
      education: [
        {
          degree: 'B.E. Computer Science and Engineering',
          field: 'Computer Science',
          institution: 'Anna University / Tech Institute',
          startYear: '2022',
          endYear: '2026',
          grade: 'CGPA: 9.1 / 10.0',
        },
      ],
      skills: [
        { name: 'React & Next.js', level: 'Expert' },
        { name: 'Node.js & Express', level: 'Advanced' },
        { name: 'TypeScript', level: 'Advanced' },
        { name: 'PostgreSQL', level: 'Advanced' },
        { name: 'Docker & DevOps', level: 'Intermediate' },
      ],
    },
  },
  'akshai-v': {
    themeId: 'emerald',
    data: {
      name: 'Akshai V.',
      tagline: 'Full Stack Developer & AI Systems Engineer',
      email: 'akshai@gmail.com',
      phone: '+91 98765 12345',
      location: 'Bengaluru, India',
      website: 'https://akshai.dev',
      github: 'https://github.com/akshai',
      linkedin: 'https://linkedin.com/in/akshai',
      bio: 'Full Stack Engineer with strong expertise in Python, Django, React, and cloud architecture. Experience building scalable microservices and data pipelines.',
      projects: [
        {
          title: 'AI Code Reviewer Agent',
          description: 'Automated pull-request analysis tool using LLMs to scan for security vulnerabilities, style guidelines, and test coverage.',
          repoUrl: 'https://github.com/akshai/ai-reviewer',
          techStack: ['Python', 'Django', 'React', 'AWS Lambda', 'MongoDB'],
        },
      ],
      education: [
        {
          degree: 'B.E. Computer Science and Engineering',
          field: 'Computer Science',
          institution: 'Tech Institute',
          startYear: '2022',
          endYear: '2026',
          grade: 'CGPA: 8.8 / 10.0',
        },
      ],
      skills: [
        { name: 'Python & Django', level: 'Expert' },
        { name: 'React', level: 'Advanced' },
        { name: 'AWS', level: 'Intermediate' },
        { name: 'MongoDB', level: 'Advanced' },
      ],
    },
  },
  'divya-m': {
    themeId: 'dark-mode',
    data: {
      name: 'Divya M.',
      tagline: 'Backend Engineer & Microservices Architect',
      email: 'divya@gmail.com',
      phone: '+91 91234 56789',
      location: 'Hyderabad, India',
      website: 'https://divya.dev',
      github: 'https://github.com/divya',
      linkedin: 'https://linkedin.com/in/divya',
      bio: 'Information Technology graduate specializing in high-throughput Java microservices, Spring Boot, distributed caching, and Kubernetes deployment.',
      projects: [
        {
          title: 'High Throughput Payment Gateway Gateway',
          description: 'Resilient event-driven payment processing platform with Kafka message queues and PostgreSQL transactional isolation.',
          repoUrl: 'https://github.com/divya/pay-gateway',
          techStack: ['Java', 'Spring Boot', 'Kafka', 'Kubernetes'],
        },
      ],
      education: [
        {
          degree: 'B.Tech Information Technology',
          field: 'Information Technology',
          institution: 'Tech Institute',
          startYear: '2022',
          endYear: '2026',
          grade: 'CGPA: 9.4 / 10.0',
        },
      ],
      skills: [
        { name: 'Java & Spring Boot', level: 'Expert' },
        { name: 'Microservices', level: 'Advanced' },
        { name: 'Kubernetes', level: 'Advanced' },
      ],
    },
  },
};

export function PublicPortfolioView() {
  const { slug } = useParams<{ slug: string }>();
  const { publicPortfolio, isLoadingPublicPortfolio } = usePortfolios(undefined, slug);

  if (isLoadingPublicPortfolio) {
    return (
      <div className="min-h-screen bg-slate-950 p-10 flex items-center justify-center">
        <LoadingSkeleton count={3} height="h-40" className="max-w-3xl w-full" />
      </div>
    );
  }

  const normalizedSlug = (slug || '').toLowerCase().trim();
  const portfolioData =
    publicPortfolio ||
    fallbackPortfolios[normalizedSlug] || {
      themeId: 'neon',
      data: {
        name: slug ? slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'Student Portfolio',
        tagline: 'Software Engineer & Full Stack Developer',
        email: `${normalizedSlug || 'student'}@gmail.com`,
        phone: '+91 98765 43210',
        location: 'India',
        bio: 'Tech enthusiast & software engineer working on modern web applications, scalable APIs, and responsive design systems.',
        projects: [
          {
            title: 'Full Stack Placement Engine',
            description: 'Integrated placement tracking system with automated verification, scheduling, and live portfolio showcase.',
            techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
          },
        ],
        education: [
          {
            degree: 'Bachelor of Technology',
            field: 'Computer Science and Engineering',
            institution: 'University College of Engineering',
            startYear: '2022',
            endYear: '2026',
            grade: 'CGPA: 9.0 / 10.0',
          },
        ],
        skills: [
          { name: 'React', level: 'Advanced' },
          { name: 'Node.js', level: 'Advanced' },
          { name: 'TypeScript', level: 'Intermediate' },
        ],
      },
    };

  return (
    <div className="min-h-screen bg-slate-950 py-10 px-4 sm:px-6 lg:px-8 flex justify-center">
      <div className="max-w-4xl w-full">
        <PortfolioPreview themeId={portfolioData.themeId} data={portfolioData.data} />
      </div>
    </div>
  );
}

export default PublicPortfolioView;

