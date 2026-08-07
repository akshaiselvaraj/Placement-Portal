import 'dotenv/config';
import { Role, ProfileStatus, DriveStatus, JobStatus, ApplicationStatus, InterviewStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Import the configured prisma client
import prisma from '../src/config/database';

async function main() {
  console.log('Starting comprehensive database seeding...');

  const passwordHash = await bcrypt.hash('Password123', 10);

  // 1. Seed / Upsert Companies
  console.log('Seeding companies...');
  const googleCompany = await prisma.company.upsert({
    where: { name: 'Google' },
    update: {
      logo: 'https://rgmfsmjhrupnckzwbpex.supabase.co/storage/v1/object/public/placement-portal/companies/google.png',
      website: 'https://careers.google.com',
      industry: 'Technology & Internet',
      description: 'A global technology leader focused on improving the ways people connect with information.',
      location: 'Mountain View, CA / Bangalore, India',
      email: 'recruiting-india@google.com',
      phone: '+91-80-67218000',
      size: '10,000+ employees',
      foundedYear: 1998,
      address: 'Google Signature Towers, Gurgaon, India',
      recruiterName: 'Elena Rostova',
      recruiterEmail: 'elena.rostova@google.com',
      recruiterPhone: '9888877777',
      hrContact: 'Amit Sharma',
      averagePackage: 30.5,
      highestPackage: 45.0,
      previousVisitDate: new Date('2025-09-12'),
      studentsHired: 5,
      notes: 'Focuses heavily on Core CS fundamentals, DSA, and System Design.',
    },
    create: {
      name: 'Google',
      logo: 'https://rgmfsmjhrupnckzwbpex.supabase.co/storage/v1/object/public/placement-portal/companies/google.png',
      website: 'https://careers.google.com',
      industry: 'Technology & Internet',
      description: 'A global technology leader focused on improving the ways people connect with information.',
      location: 'Mountain View, CA / Bangalore, India',
      email: 'recruiting-india@google.com',
      phone: '+91-80-67218000',
      size: '10,000+ employees',
      foundedYear: 1998,
      address: 'Google Signature Towers, Gurgaon, India',
      recruiterName: 'Elena Rostova',
      recruiterEmail: 'elena.rostova@google.com',
      recruiterPhone: '9888877777',
      hrContact: 'Amit Sharma',
      averagePackage: 30.5,
      highestPackage: 45.0,
      previousVisitDate: new Date('2025-09-12'),
      studentsHired: 5,
      notes: 'Focuses heavily on Core CS fundamentals, DSA, and System Design.',
    },
  });

  const amazonCompany = await prisma.company.upsert({
    where: { name: 'Amazon' },
    update: {
      logo: 'https://rgmfsmjhrupnckzwbpex.supabase.co/storage/v1/object/public/placement-portal/companies/amazon.png',
      website: 'https://amazon.jobs',
      industry: 'Technology & e-Commerce',
      description: 'Amazon is guided by four principles: customer obsession rather than competitor focus, passion for invention, commitment to operational excellence, and long-term thinking.',
      location: 'Seattle, WA / Hyderabad, India',
      email: 'careers-india@amazon.com',
      phone: '+91-40-40004000',
      size: '10,000+ employees',
      foundedYear: 1994,
      address: 'Amazon Development Centre, Nanakramguda, Hyderabad, India',
      recruiterName: 'Sarah Jenkins',
      recruiterEmail: 'sarah-jenkins@amazon.com',
      recruiterPhone: '9777766666',
      hrContact: 'Rohan Verma',
      averagePackage: 22.0,
      highestPackage: 35.5,
      previousVisitDate: new Date('2025-10-05'),
      studentsHired: 8,
      notes: 'Evaluates extensively on 16 Leadership Principles.',
    },
    create: {
      name: 'Amazon',
      logo: 'https://rgmfsmjhrupnckzwbpex.supabase.co/storage/v1/object/public/placement-portal/companies/amazon.png',
      website: 'https://amazon.jobs',
      industry: 'Technology & e-Commerce',
      description: 'Amazon is guided by four principles: customer obsession rather than competitor focus, passion for invention, commitment to operational excellence, and long-term thinking.',
      location: 'Seattle, WA / Hyderabad, India',
      email: 'careers-india@amazon.com',
      phone: '+91-40-40004000',
      size: '10,000+ employees',
      foundedYear: 1994,
      address: 'Amazon Development Centre, Nanakramguda, Hyderabad, India',
      recruiterName: 'Sarah Jenkins',
      recruiterEmail: 'sarah-jenkins@amazon.com',
      recruiterPhone: '9777766666',
      hrContact: 'Rohan Verma',
      averagePackage: 22.0,
      highestPackage: 35.5,
      previousVisitDate: new Date('2025-10-05'),
      studentsHired: 8,
      notes: 'Evaluates extensively on 16 Leadership Principles.',
    },
  });

  const tcsCompany = await prisma.company.upsert({
    where: { name: 'Tata Consultancy Services (TCS)' },
    update: {
      logo: 'https://rgmfsmjhrupnckzwbpex.supabase.co/storage/v1/object/public/placement-portal/companies/tcs.png',
      website: 'https://www.tcs.com',
      industry: 'Information Technology & IT Services',
      description: 'A purpose-led organization that builds meaningful futures through innovation, technology, and collective knowledge.',
      location: 'Mumbai, Maharashtra, India',
      email: 'campus.queries@tcs.com',
      phone: '+91-22-67789999',
      size: '10,000+ employees',
      foundedYear: 1968,
      address: 'TCS House, Raveline Street, Fort, Mumbai, India',
      recruiterName: 'Vikram Aditya',
      recruiterEmail: 'vikram.aditya@tcs.com',
      recruiterPhone: '9666655555',
      hrContact: 'Neha Sen',
      averagePackage: 5.5,
      highestPackage: 11.2,
      previousVisitDate: new Date('2025-08-20'),
      studentsHired: 45,
      notes: 'Mass hiring through TCS NQT (National Qualifier Test) for Ninja and Digital roles.',
    },
    create: {
      name: 'Tata Consultancy Services (TCS)',
      logo: 'https://rgmfsmjhrupnckzwbpex.supabase.co/storage/v1/object/public/placement-portal/companies/tcs.png',
      website: 'https://www.tcs.com',
      industry: 'Information Technology & IT Services',
      description: 'A purpose-led organization that builds meaningful futures through innovation, technology, and collective knowledge.',
      location: 'Mumbai, Maharashtra, India',
      email: 'campus.queries@tcs.com',
      phone: '+91-22-67789999',
      size: '10,000+ employees',
      foundedYear: 1968,
      address: 'TCS House, Raveline Street, Fort, Mumbai, India',
      recruiterName: 'Vikram Aditya',
      recruiterEmail: 'vikram.aditya@tcs.com',
      recruiterPhone: '9666655555',
      hrContact: 'Neha Sen',
      averagePackage: 5.5,
      highestPackage: 11.2,
      previousVisitDate: new Date('2025-08-20'),
      studentsHired: 45,
      notes: 'Mass hiring through TCS NQT (National Qualifier Test) for Ninja and Digital roles.',
    },
  });

  // 2. Seed / Upsert Student Profiles
  console.log('Seeding students...');
  const mockStudents = [
    {
      email: 'alex.johnson@example.com',
      name: 'Alex Johnson',
      rollNumber: '2023CS01',
      department: 'Computer Science and Engineering',
      batch: '2022-2026',
      cgpa: 8.92,
      tenthMarks: 95.0,
      twelfthMarks: 92.5,
      activityPoints: 120,
      phone: '9876543210',
      bio: 'Enthusiastic full-stack developer with a passion for building scalable web applications and solving algorithmic challenges.',
      profileStatus: ProfileStatus.PENDING,
      linkedin: 'https://linkedin.com/in/alex-johnson-dev',
      github: 'https://github.com/alexjohnson',
      website: 'https://alexjohnson.dev',
      educations: [
        { institution: 'St. Xavier High School', degree: 'Higher Secondary', field: 'Science', startYear: 2020, endYear: 2022, grade: '95%' },
        { institution: 'National Institute of Technology', degree: 'Bachelor of Technology', field: 'Computer Science', startYear: 2022, endYear: 2026, grade: '8.92 CGPA' }
      ],
      projects: [
        { title: 'E-Commerce Analytics Engine', description: 'Real-time analytics using Next.js & Redis.', techStack: ['React', 'Next.js', 'Node.js', 'Redis'], liveUrl: 'https://demo.com', repoUrl: 'https://github.com' }
      ],
      skills: [{ name: 'JavaScript', level: 'Expert' }, { name: 'React', level: 'Expert' }, { name: 'Node.js', level: 'Advanced' }],
      certifications: [{ name: 'AWS Cloud Practitioner', issuer: 'AWS', date: new Date('2025-05-15'), url: 'https://aws.com' }],
      documents: [{ type: 'RESUME', title: 'Alex_Resume.pdf', url: 'https://example.com/alex_resume.pdf', status: 'PENDING' }]
    },
    {
      email: 'priya.sharma@example.com',
      name: 'Priya Sharma',
      rollNumber: '2023IT12',
      department: 'Information Technology',
      batch: '2022-2026',
      cgpa: 9.45,
      tenthMarks: 98.0,
      twelfthMarks: 96.0,
      activityPoints: 150,
      phone: '9812345678',
      bio: 'Machine learning practitioner specializing in NLP and predictive analytics.',
      profileStatus: ProfileStatus.VERIFIED, // verified so she can be hired/selected
      linkedin: 'https://linkedin.com/in/priyasharma',
      github: 'https://github.com/priyasharma',
      website: 'https://priyasharma.ai',
      educations: [
        { institution: 'Delhi Public School', degree: 'Higher Secondary', field: 'Science', startYear: 2020, endYear: 2022, grade: '98%' },
        { institution: 'National Institute of Technology', degree: 'Bachelor of Technology', field: 'Information Technology', startYear: 2022, endYear: 2026, grade: '9.45 CGPA' }
      ],
      projects: [
        { title: 'Sentiment Analysis API', description: 'Fine-tuned LLM classifier.', techStack: ['Python', 'PyTorch', 'FastAPI'], liveUrl: '', repoUrl: 'https://github.com' }
      ],
      skills: [{ name: 'Python', level: 'Expert' }, { name: 'PyTorch', level: 'Advanced' }, { name: 'FastAPI', level: 'Advanced' }],
      certifications: [{ name: 'Deep Learning Specialization', issuer: 'DeepLearning.AI', date: new Date('2024-08-10'), url: 'https://coursera.org' }],
      documents: [{ type: 'RESUME', title: 'Priya_Resume.pdf', url: 'https://example.com/priya_resume.pdf', status: 'APPROVED' }]
    },
    {
      email: 'siddharth.roy@example.com',
      name: 'Siddharth Roy',
      rollNumber: '2023EC45',
      department: 'Electronics and Communication Engineering',
      batch: '2022-2026',
      cgpa: 7.85,
      tenthMarks: 91.0,
      twelfthMarks: 89.0,
      activityPoints: 90,
      phone: '9567890123',
      bio: 'Electronics enthusiast interested in embedded systems and IoT architecture.',
      profileStatus: ProfileStatus.VERIFIED,
      linkedin: 'https://linkedin.com/in/siddharthroy',
      github: 'https://github.com/siddharthroy',
      website: '',
      educations: [
        { institution: 'KV School', degree: 'Higher Secondary', field: 'Science', startYear: 2020, endYear: 2022, grade: '91%' },
        { institution: 'National Institute of Technology', degree: 'Bachelor of Technology', field: 'Electronics', startYear: 2022, endYear: 2026, grade: '7.85 CGPA' }
      ],
      projects: [
        { title: 'Smart Agriculture IoT Node', description: 'Low-power ESP32 MQTT project.', techStack: ['C++', 'MQTT', 'InfluxDB'], liveUrl: '', repoUrl: 'https://github.com' }
      ],
      skills: [{ name: 'C++', level: 'Advanced' }, { name: 'Embedded Programming', level: 'Advanced' }],
      certifications: [{ name: 'Embedded Systems Architecture', issuer: 'CU Boulder', date: new Date('2025-01-30'), url: '' }],
      documents: [{ type: 'RESUME', title: 'Siddharth_Resume.pdf', url: 'https://example.com/sid_resume.pdf', status: 'APPROVED' }]
    },
    {
      email: 'neha.verma@example.com',
      name: 'Neha Verma',
      rollNumber: '2023ME29',
      department: 'Mechanical Engineering',
      batch: '2022-2026',
      cgpa: 8.20,
      tenthMarks: 94.0,
      twelfthMarks: 90.0,
      activityPoints: 110,
      phone: '8976543210',
      bio: 'Mechanical engineering major transitioning to industrial analytics.',
      profileStatus: ProfileStatus.REJECTED,
      linkedin: 'https://linkedin.com/in/nehaverma',
      github: 'https://github.com/nehaverma',
      website: '',
      educations: [
        { institution: 'Modern School', degree: 'High School', field: 'Science', startYear: 2020, endYear: 2022, grade: '94%' },
        { institution: 'National Institute of Technology', degree: 'Bachelor of Technology', field: 'Mechanical Engineering', startYear: 2022, endYear: 2026, grade: '8.20 CGPA' }
      ],
      projects: [
        { title: 'Formula Chassis Optimization', description: 'CAD optimization & FEA stress analysis.', techStack: ['SolidWorks', 'ANSYS'], liveUrl: '', repoUrl: '' }
      ],
      skills: [{ name: 'SolidWorks', level: 'Advanced' }, { name: 'ANSYS', level: 'Intermediate' }],
      certifications: [{ name: 'CSWA', issuer: 'SolidWorks', date: new Date('2024-06-12'), url: '' }],
      documents: [{ type: 'RESUME', title: 'Neha_Resume.pdf', url: 'https://example.com/neha_resume.pdf', status: 'REJECTED' }]
    }
  ];

  const studentProfiles: any[] = [];

  for (const studentData of mockStudents) {
    const user = await prisma.user.upsert({
      where: { email: studentData.email },
      update: {
        name: studentData.name,
        password: passwordHash,
        role: Role.STUDENT,
        isActive: true,
      },
      create: {
        email: studentData.email,
        name: studentData.name,
        password: passwordHash,
        role: Role.STUDENT,
        isActive: true,
      },
    });

    const profile = await prisma.studentProfile.upsert({
      where: { userId: user.id },
      update: {
        rollNumber: studentData.rollNumber,
        department: studentData.department,
        batch: studentData.batch,
        cgpa: studentData.cgpa,
        tenthMarks: studentData.tenthMarks,
        twelfthMarks: studentData.twelfthMarks,
        activityPoints: studentData.activityPoints,
        phone: studentData.phone,
        bio: studentData.bio,
        profileStatus: studentData.profileStatus,
        linkedin: studentData.linkedin,
        github: studentData.github,
        website: studentData.website,
      },
      create: {
        userId: user.id,
        rollNumber: studentData.rollNumber,
        department: studentData.department,
        batch: studentData.batch,
        cgpa: studentData.cgpa,
        tenthMarks: studentData.tenthMarks,
        twelfthMarks: studentData.twelfthMarks,
        activityPoints: studentData.activityPoints,
        phone: studentData.phone,
        bio: studentData.bio,
        profileStatus: studentData.profileStatus,
        linkedin: studentData.linkedin,
        github: studentData.github,
        website: studentData.website,
      },
    });

    studentProfiles.push(profile);

    // Recreate relations
    await prisma.education.deleteMany({ where: { studentId: profile.id } });
    await prisma.project.deleteMany({ where: { studentId: profile.id } });
    await prisma.skill.deleteMany({ where: { studentId: profile.id } });
    await prisma.certification.deleteMany({ where: { studentId: profile.id } });
    await prisma.document.deleteMany({ where: { studentId: profile.id } });

    for (const edu of studentData.educations) {
      await prisma.education.create({ data: { studentId: profile.id, ...edu } });
    }
    for (const proj of studentData.projects) {
      await prisma.project.create({ data: { studentId: profile.id, ...proj } });
    }
    for (const skill of studentData.skills) {
      await prisma.skill.create({ data: { studentId: profile.id, ...skill } });
    }
    for (const cert of studentData.certifications) {
      await prisma.certification.create({ data: { studentId: profile.id, ...cert } });
    }
    for (const doc of studentData.documents) {
      await prisma.document.create({ data: { studentId: profile.id, ...doc } });
    }
  }

  // 3. Seed / Upsert Jobs
  console.log('Seeding jobs...');
  const googleSdeJob = await prisma.job.create({
    data: {
      title: 'Software Development Engineer (SDE)',
      description: 'Responsible for developing robust infrastructure and backend microservices at scale.',
      companyId: googleCompany.id,
      type: 'Full-time',
      location: 'Bangalore, India',
      workMode: 'Hybrid',
      employmentType: 'Full-time',
      salaryMin: 2800000.0,
      salaryMax: 3600000.0,
      deadline: new Date('2026-09-30'),
      status: JobStatus.OPEN,
      eligibility: 'CGPA > 8.5, No active backlogs',
      requirements: 'Strong DSA, system design, and coding skills in Java, C++ or Go.',
      requiredSkills: ['Java', 'C++', 'Algorithms', 'Distributed Systems'],
      minCgpa: 8.5,
      minActivityPoints: 100,
      eligibleDepartments: ['Computer Science and Engineering', 'Information Technology'],
      eligibleGradYears: [2026],
      openings: 3,
      postedBy: 'Elena Rostova',
    },
  });

  const googleFrontendJob = await prisma.job.create({
    data: {
      title: 'UX Engineer / Frontend Developer',
      description: 'Create beautiful, responsive user-facing product screens utilizing modern React practices.',
      companyId: googleCompany.id,
      type: 'Full-time',
      location: 'Hyderabad, India',
      workMode: 'On-site',
      employmentType: 'Full-time',
      salaryMin: 2000000.0,
      salaryMax: 2600000.0,
      deadline: new Date('2026-10-15'),
      status: JobStatus.OPEN,
      eligibility: 'CGPA > 8.0',
      requirements: 'High proficiency in React, browser architecture, CSS grids, and Web performance tools.',
      requiredSkills: ['JavaScript', 'TypeScript', 'React', 'HTML/CSS'],
      minCgpa: 8.0,
      minActivityPoints: 80,
      eligibleDepartments: ['Computer Science and Engineering', 'Information Technology', 'Electronics and Communication Engineering'],
      eligibleGradYears: [2026],
      openings: 2,
      postedBy: 'Elena Rostova',
    },
  });

  const amazonCloudJob = await prisma.job.create({
    data: {
      title: 'Cloud Support Associate',
      description: 'Support cloud customers debugging hosting systems, AWS deployments, and network configurations.',
      companyId: amazonCompany.id,
      type: 'Full-time',
      location: 'Hyderabad, India',
      workMode: 'On-site',
      employmentType: 'Full-time',
      salaryMin: 1400000.0,
      salaryMax: 1800000.0,
      deadline: new Date('2026-08-25'),
      status: JobStatus.OPEN,
      eligibility: 'CGPA > 7.5',
      requirements: 'Networking, AWS Cloud, Operating Systems, Linux shell scripting.',
      requiredSkills: ['AWS', 'Linux', 'Networking', 'Python'],
      minCgpa: 7.5,
      eligibleDepartments: ['Computer Science and Engineering', 'Information Technology', 'Electronics and Communication Engineering'],
      eligibleGradYears: [2026],
      openings: 5,
      postedBy: 'Sarah Jenkins',
    },
  });

  const tcsSystemsJob = await prisma.job.create({
    data: {
      title: 'Systems Engineer (Digital)',
      description: 'Work on TCS innovation projects, client enterprise stacks, and modern business software solutions.',
      companyId: tcsCompany.id,
      type: 'Full-time',
      location: 'Chennai/Pune, India',
      workMode: 'On-site',
      employmentType: 'Full-time',
      salaryMin: 700000.0,
      salaryMax: 750000.0,
      deadline: new Date('2025-08-15'),
      status: JobStatus.CLOSED, // closed because drive is completed
      eligibility: 'CGPA > 6.0',
      requirements: 'General engineering logical reasoning and basic coding skills.',
      requiredSkills: ['C', 'Java', 'SQL', 'Python'],
      minCgpa: 6.0,
      eligibleDepartments: ['Computer Science and Engineering', 'Information Technology', 'Electronics and Communication Engineering', 'Mechanical Engineering'],
      eligibleGradYears: [2026],
      openings: 15,
      postedBy: 'Vikram Aditya',
    },
  });

  // 4. Seed / Upsert PlacementDrives
  console.log('Seeding placement drives...');
  const googleDrive = await prisma.placementDrive.create({
    data: {
      title: 'Google Elite Campus Hiring Drive',
      description: 'Google Annual Campus Recruitment drive targeting highly skilled developers for SDE and UX Engineering placements.',
      companyId: googleCompany.id,
      status: DriveStatus.ONGOING,
      eligibilityCriteria: 'Minimum 8.0 CGPA, Computer Science or IT streams preferred.',
      startDate: new Date('2026-07-15'),
      endDate: new Date('2026-09-10'),
      jobRole: 'SDE & UX Engineer',
      package: 32.0,
      location: 'Bangalore, India',
      employmentType: 'Full-time',
      registrationDeadline: new Date('2026-08-30'),
      departmentsEligible: ['Computer Science and Engineering', 'Information Technology'],
      minCgpa: 8.0,
      minActivityPoints: 100,
      maxBacklogs: 0,
      requiredSkills: ['Data Structures', 'Algorithms', 'System Design', 'React'],
      batchYear: 2026,
      openings: 5,
    },
  });

  const amazonDrive = await prisma.placementDrive.create({
    data: {
      title: 'Amazon AWS Cloud Talent Hunt',
      description: 'AWS Support Team recruitment drive aiming for Cloud Support engineers.',
      companyId: amazonCompany.id,
      status: DriveStatus.UPCOMING,
      eligibilityCriteria: 'Minimum 7.5 CGPA, ECE, CSE, and IT departments eligible.',
      startDate: new Date('2026-08-20'),
      endDate: new Date('2026-09-15'),
      jobRole: 'Cloud Support Associate',
      package: 16.0,
      location: 'Hyderabad, India',
      employmentType: 'Full-time + Internship',
      registrationDeadline: new Date('2026-08-18'),
      departmentsEligible: ['Computer Science and Engineering', 'Information Technology', 'Electronics and Communication Engineering'],
      minCgpa: 7.5,
      minActivityPoints: 50,
      maxBacklogs: 0,
      requiredSkills: ['Linux', 'Networking Basics', 'AWS services', 'Scripting'],
      batchYear: 2026,
      openings: 5,
    },
  });

  const tcsDrive = await prisma.placementDrive.create({
    data: {
      title: 'TCS National Qualifier Drive',
      description: 'TCS Annual national campus deployment drive for standard Digital engineering roles.',
      companyId: tcsCompany.id,
      status: DriveStatus.COMPLETED,
      eligibilityCriteria: 'Minimum 6.0 CGPA, open to all branches.',
      startDate: new Date('2025-07-01'),
      endDate: new Date('2025-08-20'),
      jobRole: 'Systems Engineer',
      package: 7.0,
      location: 'PAN India Locations',
      employmentType: 'Full-time',
      registrationDeadline: new Date('2025-07-20'),
      departmentsEligible: ['Computer Science and Engineering', 'Information Technology', 'Electronics and Communication Engineering', 'Mechanical Engineering'],
      minCgpa: 6.0,
      maxBacklogs: 2,
      requiredSkills: ['C Programming', 'Analytical Skills', 'RDBMS concepts'],
      batchYear: 2026,
      openings: 15,
    },
  });

  // 5. Seed / Upsert Applications
  console.log('Seeding applications...');
  const alexProfile = studentProfiles.find((s) => s.rollNumber === '2023CS01');
  const priyaProfile = studentProfiles.find((s) => s.rollNumber === '2023IT12');
  const sidProfile = studentProfiles.find((s) => s.rollNumber === '2023EC45');

  // Alex applied to Google SDE (Interviewing)
  const alexGoogleApp = await prisma.application.create({
    data: {
      studentId: alexProfile.id,
      jobId: googleSdeJob.id,
      status: ApplicationStatus.INTERVIEWING,
      atsScore: 88.5,
      atsBreakdown: { keywords: 85, layout: 90, matchingSkills: ['Java', 'C++', 'Algorithms'] },
      offerStatus: 'PENDING',
    },
  });

  // Alex applied to Amazon Cloud (Shortlisted)
  const alexAmazonApp = await prisma.application.create({
    data: {
      studentId: alexProfile.id,
      jobId: amazonCloudJob.id,
      status: ApplicationStatus.SHORTLISTED,
      atsScore: 79.0,
      atsBreakdown: { keywords: 75, layout: 85, matchingSkills: ['AWS', 'Linux'] },
      offerStatus: 'PENDING',
    },
  });

  // Priya applied to Google SDE and is Hired (offer accepted!)
  const priyaGoogleApp = await prisma.application.create({
    data: {
      studentId: priyaProfile.id,
      jobId: googleSdeJob.id,
      status: ApplicationStatus.HIRED,
      atsScore: 94.2,
      atsBreakdown: { keywords: 95, layout: 92, matchingSkills: ['Python', 'FastAPI', 'Algorithms'] },
      hiredAt: new Date('2026-07-28'),
      joiningDate: new Date('2026-10-01'),
      offerStatus: 'ACCEPTED',
      ctc: 32.0,
      baseSalary: 22.0,
      bonus: 5.0,
      stocks: 5.0,
      benefits: 'Health Insurance, Free Food, Relocation Bonus',
      offerLetter: 'https://example.com/priya_google_offer.pdf',
      joiningStatus: 'JOINED',
    },
  });

  // Siddharth applied to TCS Systems Engineer and is Hired (offer accepted!)
  const sidTcsApp = await prisma.application.create({
    data: {
      studentId: sidProfile.id,
      jobId: tcsSystemsJob.id,
      status: ApplicationStatus.HIRED,
      atsScore: 82.0,
      atsBreakdown: { keywords: 80, layout: 85, matchingSkills: ['C++', 'SQL'] },
      hiredAt: new Date('2025-08-18'),
      joiningDate: new Date('2026-06-01'),
      offerStatus: 'ACCEPTED',
      ctc: 7.2,
      baseSalary: 6.0,
      bonus: 0.5,
      stocks: 0.7,
      benefits: 'Provident Fund, Medical Cover',
      offerLetter: 'https://example.com/sid_tcs_offer.pdf',
      joiningStatus: 'PENDING',
    },
  });

  // 6. Seed ApplicationStatusHistories
  console.log('Seeding status history logs...');
  await prisma.applicationStatusHistory.createMany({
    data: [
      { applicationId: alexGoogleApp.id, fromStatus: null, toStatus: ApplicationStatus.APPLIED, changedBy: 'System', notes: 'Initial application submitted.' },
      { applicationId: alexGoogleApp.id, fromStatus: ApplicationStatus.APPLIED, toStatus: ApplicationStatus.UNDER_REVIEW, changedBy: 'Elena Rostova', notes: 'Resume matches SDE skill requirements.' },
      { applicationId: alexGoogleApp.id, fromStatus: ApplicationStatus.UNDER_REVIEW, toStatus: ApplicationStatus.SHORTLISTED, changedBy: 'Elena Rostova', notes: 'Qualified for technical interview rounds.' },
      { applicationId: alexGoogleApp.id, fromStatus: ApplicationStatus.SHORTLISTED, toStatus: ApplicationStatus.INTERVIEWING, changedBy: 'Elena Rostova', notes: 'Scheduled Coding & DSA round.' },

      { applicationId: priyaGoogleApp.id, fromStatus: null, toStatus: ApplicationStatus.APPLIED, changedBy: 'System' },
      { applicationId: priyaGoogleApp.id, fromStatus: ApplicationStatus.APPLIED, toStatus: ApplicationStatus.SHORTLISTED, changedBy: 'Elena Rostova' },
      { applicationId: priyaGoogleApp.id, fromStatus: ApplicationStatus.SHORTLISTED, toStatus: ApplicationStatus.INTERVIEWING, changedBy: 'Elena Rostova' },
      { applicationId: priyaGoogleApp.id, fromStatus: ApplicationStatus.INTERVIEWING, toStatus: ApplicationStatus.SELECTED, changedBy: 'Elena Rostova', notes: 'All interviewers gave strong Hire ratings.' },
      { applicationId: priyaGoogleApp.id, fromStatus: ApplicationStatus.SELECTED, toStatus: ApplicationStatus.HIRED, changedBy: 'Elena Rostova', notes: 'Signed offer letter.' },

      { applicationId: sidTcsApp.id, fromStatus: null, toStatus: ApplicationStatus.APPLIED, changedBy: 'System' },
      { applicationId: sidTcsApp.id, fromStatus: ApplicationStatus.APPLIED, toStatus: ApplicationStatus.SHORTLISTED, changedBy: 'Vikram Aditya' },
      { applicationId: sidTcsApp.id, fromStatus: ApplicationStatus.SHORTLISTED, toStatus: ApplicationStatus.SELECTED, changedBy: 'Vikram Aditya' },
      { applicationId: sidTcsApp.id, fromStatus: ApplicationStatus.SELECTED, toStatus: ApplicationStatus.HIRED, changedBy: 'Vikram Aditya' }
    ]
  });

  // 7. Seed / Upsert Interviews
  console.log('Seeding interviews...');
  // Alex Google SDE Interview: Upcoming
  await prisma.interview.create({
    data: {
      applicationId: alexGoogleApp.id,
      driveId: googleDrive.id,
      date: new Date('2026-08-10T11:00:00Z'),
      time: '11:00 AM - 11:45 AM',
      duration: 45,
      interviewer: 'David Miller (Staff Engineer)',
      meetingLink: 'https://meet.google.com/abc-defg-hij',
      roundType: 'Technical',
      location: 'Virtual (Google Meet)',
      status: InterviewStatus.SCHEDULED,
      result: 'PENDING',
      attendance: 'PENDING',
      instructions: 'Prepare topics on Graphs, Dynamic Programming, and Multi-threading design.',
    },
  });

  // Priya Google SDE Interviews: Completed
  await prisma.interview.create({
    data: {
      applicationId: priyaGoogleApp.id,
      driveId: googleDrive.id,
      date: new Date('2026-07-20T10:00:00Z'),
      time: '10:00 AM',
      duration: 45,
      interviewer: 'Sarah Connor',
      meetingLink: 'https://meet.google.com/gog-meet-sde',
      roundType: 'Technical (DSA)',
      location: 'Virtual',
      status: InterviewStatus.COMPLETED,
      result: 'QUALIFIED',
      attendance: 'PRESENT',
      instructions: 'Coding challenge.',
    },
  });

  await prisma.interview.create({
    data: {
      applicationId: priyaGoogleApp.id,
      driveId: googleDrive.id,
      date: new Date('2026-07-23T15:00:00Z'),
      time: '03:00 PM',
      duration: 60,
      interviewer: 'Jon Doe (Director of Engineering)',
      meetingLink: 'https://meet.google.com/gog-meet-mgr',
      roundType: 'Managerial (System Design)',
      location: 'Virtual',
      status: InterviewStatus.COMPLETED,
      result: 'QUALIFIED',
      attendance: 'PRESENT',
      instructions: 'Architecture assessment.',
    },
  });

  // Siddharth TCS Completed Interview
  await prisma.interview.create({
    data: {
      applicationId: sidTcsApp.id,
      driveId: tcsDrive.id,
      date: new Date('2025-08-10T09:30:00Z'),
      time: '09:30 AM',
      duration: 30,
      interviewer: 'Karan Johar',
      meetingLink: '',
      roundType: 'Technical & HR Combined',
      location: 'NIT Campus Seminar Hall 1',
      status: InterviewStatus.COMPLETED,
      result: 'QUALIFIED',
      attendance: 'PRESENT',
      instructions: 'Report in formal dress code with printed resume copy.',
    },
  });

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error while seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
