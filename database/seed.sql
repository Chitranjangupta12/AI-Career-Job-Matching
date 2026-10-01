-- ==========================================================
-- AI-Powered Career Guidance & Intelligent Job Matching System
-- PostgreSQL Seed Data
-- ==========================================================

-- 1. Insert Initial Skills Taxonomy
INSERT INTO skills (name, category, normalized_name) VALUES
-- Programming Languages
('Python', 'Programming Language', 'python'),
('Java', 'Programming Language', 'java'),
('JavaScript', 'Programming Language', 'javascript'),
('TypeScript', 'Programming Language', 'typescript'),
('C++', 'Programming Language', 'c++'),
('C#', 'Programming Language', 'c#'),
('Go', 'Programming Language', 'go'),
('Rust', 'Programming Language', 'rust'),
('PHP', 'Programming Language', 'php'),
('Ruby', 'Programming Language', 'ruby'),
('Kotlin', 'Programming Language', 'kotlin'),
('Swift', 'Programming Language', 'swift'),
('SQL', 'Database', 'sql'),
('HTML5', 'Frontend', 'html5'),
('CSS3', 'Frontend', 'css3'),

-- Frontend Frameworks & Libraries
('React', 'Frontend', 'react'),
('Angular', 'Frontend', 'angular'),
('Vue.js', 'Frontend', 'vue.js'),
('Next.js', 'Frontend', 'next.js'),
('Redux', 'Frontend', 'redux'),
('Tailwind CSS', 'Frontend', 'tailwind css'),
('Bootstrap', 'Frontend', 'bootstrap'),

-- Backend Frameworks
('Node.js', 'Backend', 'node.js'),
('Express.js', 'Backend', 'express.js'),
('Spring Boot', 'Backend', 'spring boot'),
('Django', 'Backend', 'django'),
('FastAPI', 'Backend', 'fastapi'),
('Flask', 'Backend', 'flask'),
('ASP.NET Core', 'Backend', 'asp.net core'),
('Ruby on Rails', 'Backend', 'ruby on rails'),
('GraphQL', 'Backend', 'graphql'),
('REST API', 'Backend', 'rest api'),

-- Databases
('PostgreSQL', 'Database', 'postgresql'),
('MySQL', 'Database', 'mysql'),
('MongoDB', 'Database', 'mongodb'),
('Redis', 'Database', 'redis'),
('Elasticsearch', 'Database', 'elasticsearch'),
('Oracle Database', 'Database', 'oracle database'),

-- AI / ML & Data Science
('Machine Learning', 'Data Science', 'machine learning'),
('Deep Learning', 'Data Science', 'deep learning'),
('NLP', 'Data Science', 'nlp'),
('Computer Vision', 'Data Science', 'computer vision'),
('TensorFlow', 'Data Science', 'tensorflow'),
('PyTorch', 'Data Science', 'pytorch'),
('Scikit-Learn', 'Data Science', 'scikit-learn'),
('Pandas', 'Data Science', 'pandas'),
('NumPy', 'Data Science', 'numpy'),
('Data Visualization', 'Data Science', 'data visualization'),
('Power BI', 'Data Science', 'power bi'),
('Tableau', 'Data Science', 'tableau'),

-- Cloud & DevOps
('AWS', 'Cloud & DevOps', 'aws'),
('Azure', 'Cloud & DevOps', 'azure'),
('Google Cloud (GCP)', 'Cloud & DevOps', 'google cloud (gcp)'),
('Docker', 'Cloud & DevOps', 'docker'),
('Kubernetes', 'Cloud & DevOps', 'kubernetes'),
('CI/CD', 'Cloud & DevOps', 'ci/cd'),
('Terraform', 'Cloud & DevOps', 'terraform'),
('Linux', 'Cloud & DevOps', 'linux'),
('Git', 'Tools', 'git'),
('GitHub', 'Tools', 'github'),

-- Soft Skills
('Problem Solving', 'Soft Skills', 'problem solving'),
('Communication', 'Soft Skills', 'communication'),
('Team Collaboration', 'Soft Skills', 'team collaboration'),
('Critical Thinking', 'Soft Skills', 'critical thinking'),
('Agile Methodologies', 'Management', 'agile methodologies')
ON CONFLICT (name) DO NOTHING;

-- 2. Insert Career Roles Knowledge Base
INSERT INTO career_roles (title, description, avg_salary, industry, growth_rate, icon) VALUES
('Software Developer', 'Designs, codes, tests, and maintains scalable software applications across multiple platforms and domains.', '$95,000 - $130,000', 'Technology', 'High (25%)', 'Code'),
('Java Developer', 'Specializes in enterprise backend architecture, microservices, and distributed systems using Java and Spring ecosystem.', '$90,000 - $125,000', 'Enterprise Software', 'High (20%)', 'Coffee'),
('Backend Developer', 'Builds server-side logic, REST/GraphQL APIs, database architectures, and ensures high availability and security.', '$100,000 - $140,000', 'Cloud & Web Services', 'Very High (28%)', 'Server'),
('Frontend Developer', 'Crafts intuitive, responsive, and performant user interfaces using modern JavaScript frameworks and design systems.', '$85,000 - $120,000', 'Web & Mobile', 'High (22%)', 'Layout'),
('Full Stack Developer', 'Masters both client-side and server-side engineering, bridging UI components with robust data backends.', '$105,000 - $145,000', 'Technology', 'Very High (30%)', 'Layers'),
('Data Analyst', 'Transforms raw datasets into actionable business intelligence through SQL queries, statistical models, and dashboards.', '$75,000 - $105,000', 'Data & Analytics', 'High (23%)', 'BarChart'),
('Data Scientist', 'Leverages statistical modeling, machine learning, and big data to discover hidden patterns and generate predictive insights.', '$115,000 - $160,000', 'AI & Data Science', 'Very High (35%)', 'Activity'),
('Machine Learning Engineer', 'Designs, trains, deploys, and optimizes state-of-the-art machine learning and deep learning pipelines in production.', '$125,000 - $175,000', 'Artificial Intelligence', 'Exceptional (40%)', 'Cpu'),
('DevOps Engineer', 'Automates build, test, and release pipelines, managing container orchestration, cloud infrastructure, and observability.', '$110,000 - $155,000', 'Cloud Infrastructure', 'Very High (32%)', 'Terminal'),
('Cloud Engineer', 'Architects, secures, and maintains scalable multi-cloud infrastructure and serverless solutions.', '$110,000 - $150,000', 'Cloud Services', 'Very High (29%)', 'Cloud')
ON CONFLICT (title) DO NOTHING;

-- 3. Map Skills to Career Roles (Career Skills)
-- Helper script to insert role skills
DO $$
DECLARE
    r_software_dev INT;
    r_java_dev INT;
    r_backend_dev INT;
    r_frontend_dev INT;
    r_fullstack_dev INT;
    r_data_analyst INT;
    r_data_scientist INT;
    r_ml_eng INT;
    r_devops_eng INT;
    r_cloud_eng INT;
BEGIN
    SELECT id INTO r_software_dev FROM career_roles WHERE title = 'Software Developer';
    SELECT id INTO r_java_dev FROM career_roles WHERE title = 'Java Developer';
    SELECT id INTO r_backend_dev FROM career_roles WHERE title = 'Backend Developer';
    SELECT id INTO r_frontend_dev FROM career_roles WHERE title = 'Frontend Developer';
    SELECT id INTO r_fullstack_dev FROM career_roles WHERE title = 'Full Stack Developer';
    SELECT id INTO r_data_analyst FROM career_roles WHERE title = 'Data Analyst';
    SELECT id INTO r_data_scientist FROM career_roles WHERE title = 'Data Scientist';
    SELECT id INTO r_ml_eng FROM career_roles WHERE title = 'Machine Learning Engineer';
    SELECT id INTO r_devops_eng FROM career_roles WHERE title = 'DevOps Engineer';
    SELECT id INTO r_cloud_eng FROM career_roles WHERE title = 'Cloud Engineer';

    -- Software Developer
    INSERT INTO career_skills (career_role_id, skill_id, importance_weight, is_core)
    SELECT r_software_dev, id, 1.0, TRUE FROM skills WHERE name IN ('Python', 'Java', 'SQL', 'Git', 'Problem Solving', 'Data Visualization')
    ON CONFLICT DO NOTHING;

    -- Java Developer
    INSERT INTO career_skills (career_role_id, skill_id, importance_weight, is_core)
    SELECT r_java_dev, id, 1.0, TRUE FROM skills WHERE name IN ('Java', 'Spring Boot', 'SQL', 'PostgreSQL', 'REST API', 'Git', 'Docker')
    ON CONFLICT DO NOTHING;

    -- Backend Developer
    INSERT INTO career_skills (career_role_id, skill_id, importance_weight, is_core)
    SELECT r_backend_dev, id, 1.0, TRUE FROM skills WHERE name IN ('Node.js', 'Express.js', 'PostgreSQL', 'MongoDB', 'REST API', 'Redis', 'Docker', 'Git')
    ON CONFLICT DO NOTHING;

    -- Frontend Developer
    INSERT INTO career_skills (career_role_id, skill_id, importance_weight, is_core)
    SELECT r_frontend_dev, id, 1.0, TRUE FROM skills WHERE name IN ('JavaScript', 'TypeScript', 'React', 'HTML5', 'CSS3', 'Redux', 'Tailwind CSS', 'Git')
    ON CONFLICT DO NOTHING;

    -- Full Stack Developer
    INSERT INTO career_skills (career_role_id, skill_id, importance_weight, is_core)
    SELECT r_fullstack_dev, id, 1.0, TRUE FROM skills WHERE name IN ('JavaScript', 'TypeScript', 'React', 'Node.js', 'Express.js', 'PostgreSQL', 'REST API', 'Git', 'Docker')
    ON CONFLICT DO NOTHING;

    -- Data Analyst
    INSERT INTO career_skills (career_role_id, skill_id, importance_weight, is_core)
    SELECT r_data_analyst, id, 1.0, TRUE FROM skills WHERE name IN ('SQL', 'Python', 'Pandas', 'Power BI', 'Tableau', 'Data Visualization', 'Communication')
    ON CONFLICT DO NOTHING;

    -- Data Scientist
    INSERT INTO career_skills (career_role_id, skill_id, importance_weight, is_core)
    SELECT r_data_scientist, id, 1.0, TRUE FROM skills WHERE name IN ('Python', 'SQL', 'Machine Learning', 'Pandas', 'NumPy', 'Scikit-Learn', 'Deep Learning', 'Data Visualization')
    ON CONFLICT DO NOTHING;

    -- Machine Learning Engineer
    INSERT INTO career_skills (career_role_id, skill_id, importance_weight, is_core)
    SELECT r_ml_eng, id, 1.0, TRUE FROM skills WHERE name IN ('Python', 'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'FastAPI', 'Docker', 'NLP')
    ON CONFLICT DO NOTHING;

    -- DevOps Engineer
    INSERT INTO career_skills (career_role_id, skill_id, importance_weight, is_core)
    SELECT r_devops_eng, id, 1.0, TRUE FROM skills WHERE name IN ('Linux', 'Docker', 'Kubernetes', 'CI/CD', 'AWS', 'Terraform', 'Git', 'Python')
    ON CONFLICT DO NOTHING;

    -- Cloud Engineer
    INSERT INTO career_skills (career_role_id, skill_id, importance_weight, is_core)
    SELECT r_cloud_eng, id, 1.0, TRUE FROM skills WHERE name IN ('AWS', 'Azure', 'Google Cloud (GCP)', 'Docker', 'Kubernetes', 'Linux', 'Terraform')
    ON CONFLICT DO NOTHING;
END $$;

-- 4. Sample Seed Users (Password is 'Admin@123', 'Student@123', 'Recruiter@123' bcrypt hashed)
-- Password Hash for 'Password123!': $2a$10$wE99q49V7n6kMJ6.b2r4nODN1fN7k2p9fA4c9W3y2M.gQO3pAxeaO
INSERT INTO users (name, email, password_hash, role) VALUES
('System Administrator', 'admin@careerguidance.com', '$2a$10$wE99q49V7n6kMJ6.b2r4nODN1fN7k2p9fA4c9W3y2M.gQO3pAxeaO', 'admin'),
('Sarah Recruiter', 'recruiter@techcorp.com', '$2a$10$wE99q49V7n6kMJ6.b2r4nODN1fN7k2p9fA4c9W3y2M.gQO3pAxeaO', 'recruiter'),
('Alex Johnson', 'alex.student@university.edu', '$2a$10$wE99q49V7n6kMJ6.b2r4nODN1fN7k2p9fA4c9W3y2M.gQO3pAxeaO', 'student')
ON CONFLICT (email) DO NOTHING;

-- 5. Seed Recruiter Profile
INSERT INTO recruiter_profiles (user_id, company_name, company_website, company_description, designation, location, industry)
SELECT id, 'TechCorp Solutions', 'https://techcorp.example.com', 'Leading cloud and enterprise software innovation firm.', 'Lead Technical Recruiter', 'San Francisco, CA (Remote)', 'Information Technology'
FROM users WHERE email = 'recruiter@techcorp.com'
ON CONFLICT (user_id) DO NOTHING;

-- 6. Seed Student Profile
INSERT INTO student_profiles (user_id, headline, phone, location, bio, education_level, major, experience_years, interests, github_url, linkedin_url)
SELECT id, 'Aspiring Full Stack Engineer & Machine Learning Enthusiast', '+1 (555) 234-5678', 'Austin, TX', 'Computer Science graduate passionate about building scalable web apps and AI-driven platforms.', 'Bachelor of Technology', 'Computer Science and Engineering', 1.0, 'Full Stack Development, AI/ML, Cloud Systems', 'https://github.com/alexjohnson', 'https://linkedin.com/in/alexjohnson'
FROM users WHERE email = 'alex.student@university.edu'
ON CONFLICT (user_id) DO NOTHING;

-- Student Education & Skills
DO $$
DECLARE
    s_id INT;
BEGIN
    SELECT id INTO s_id FROM student_profiles WHERE user_id = (SELECT id FROM users WHERE email = 'alex.student@university.edu');
    IF s_id IS NOT NULL THEN
        -- Education
        INSERT INTO student_education (student_id, institution, degree, field_of_study, start_year, end_year, grade)
        VALUES (s_id, 'State Institute of Technology', 'B.Tech', 'Computer Science & Engineering', 2022, 2026, '3.8 GPA')
        ON CONFLICT DO NOTHING;

        -- Skills
        INSERT INTO student_skills (student_id, skill_id, proficiency_level, years_of_experience)
        SELECT s_id, id, 'Advanced', 2.0 FROM skills WHERE name IN ('Python', 'JavaScript', 'React', 'Node.js', 'SQL', 'Git', 'PostgreSQL')
        ON CONFLICT DO NOTHING;

        -- Experience
        INSERT INTO student_experience (student_id, title, company, location, start_date, end_date, is_current, description)
        VALUES (s_id, 'Software Engineering Intern', 'CloudScale Inc.', 'Remote', '2025-06-01', '2025-08-31', FALSE, 'Developed RESTful microservices using Node.js, Express, and PostgreSQL. Implemented React dashboard features.')
        ON CONFLICT DO NOTHING;

        -- Projects
        INSERT INTO student_projects (student_id, title, description, technologies, project_url)
        VALUES (s_id, 'AI Resume Analyzer', 'Built an NLP-based resume skill extraction and job matching web platform.', 'React, Node.js, Python, PostgreSQL', 'https://github.com/alexjohnson/ai-resume-matcher')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- 7. Seed Sample Jobs
DO $$
DECLARE
    r_id INT;
    j1_id INT;
    j2_id INT;
    j3_id INT;
    j4_id INT;
BEGIN
    SELECT id INTO r_id FROM recruiter_profiles WHERE user_id = (SELECT id FROM users WHERE email = 'recruiter@techcorp.com');
    IF r_id IS NOT NULL THEN
        -- Job 1: Full Stack Developer
        INSERT INTO jobs (recruiter_id, title, company_name, location, job_type, experience_level, min_exp_years, education_required, salary_range, description, responsibilities, benefits)
        VALUES (
            r_id,
            'Full Stack Developer (React & Node.js)',
            'TechCorp Solutions',
            'Remote / New York, NY',
            'Full-Time',
            'Junior',
            1.0,
            'Bachelor''s in Computer Science or related field',
            '$85,000 - $115,000',
            'We are seeking a talented Junior Full Stack Developer to build next-generation web applications. You will collaborate with cross-functional teams to design, develop, and deploy scalable frontend interfaces and backend APIs.',
            '• Develop responsive React frontend components\n• Build and maintain REST APIs with Node.js and Express\n• Optimize SQL queries and PostgreSQL database schemas\n• Participate in agile code reviews and team sprints',
            '• Health, Dental & Vision Insurance\n• Flexible Remote Work Policy\n• $2,000 Annual Learning Stipend\n• 401(k) Matching'
        ) RETURNING id INTO j1_id;

        -- Job 2: Backend Java Engineer
        INSERT INTO jobs (recruiter_id, title, company_name, location, job_type, experience_level, min_exp_years, education_required, salary_range, description, responsibilities, benefits)
        VALUES (
            r_id,
            'Backend Java & Spring Boot Engineer',
            'TechCorp Solutions',
            'Austin, TX (Hybrid)',
            'Full-Time',
            'Mid-Level',
            2.0,
            'Bachelor''s in Computer Science',
            '$100,000 - $130,000',
            'Join our backend infrastructure team to architect high-throughput distributed microservices using Java and Spring Boot.',
            '• Architect microservices using Java and Spring Boot\n• Design relational database schemas and queries\n• Implement Docker containerization and CI/CD pipelines',
            '• Competitive compensation + equity\n• Comprehensive health coverage\n• Unlimited PTO'
        ) RETURNING id INTO j2_id;

        -- Job 3: Machine Learning Engineer
        INSERT INTO jobs (recruiter_id, title, company_name, location, job_type, experience_level, min_exp_years, education_required, salary_range, description, responsibilities, benefits)
        VALUES (
            r_id,
            'Junior Machine Learning & NLP Engineer',
            'TechCorp Solutions',
            'San Francisco, CA (Remote)',
            'Full-Time',
            'Junior',
            1.0,
            'Bachelor''s or Master''s in CS / Data Science / AI',
            '$95,000 - $125,000',
            'We are building AI-first features for career intelligence. You will develop NLP models for text extraction, skill normalization, and intelligent matching algorithms.',
            '• Implement NLP extraction pipelines using Python and spaCy/Transformers\n• Build FastAPI microservices for real-time model inference\n• Conduct model validation and explainability analysis',
            '• Top-tier AI compute budget\n• Conference attendance budget\n• Full medical coverage'
        ) RETURNING id INTO j3_id;

        -- Map Skills to Job 1 (Full Stack)
        INSERT INTO job_skills (job_id, skill_id, is_required)
        SELECT j1_id, id, TRUE FROM skills WHERE name IN ('JavaScript', 'React', 'Node.js', 'Express.js', 'SQL')
        ON CONFLICT DO NOTHING;
        INSERT INTO job_skills (job_id, skill_id, is_required)
        SELECT j1_id, id, FALSE FROM skills WHERE name IN ('TypeScript', 'PostgreSQL', 'Docker', 'Git')
        ON CONFLICT DO NOTHING;

        -- Map Skills to Job 2 (Java)
        INSERT INTO job_skills (job_id, skill_id, is_required)
        SELECT j2_id, id, TRUE FROM skills WHERE name IN ('Java', 'Spring Boot', 'SQL', 'PostgreSQL')
        ON CONFLICT DO NOTHING;
        INSERT INTO job_skills (job_id, skill_id, is_required)
        SELECT j2_id, id, FALSE FROM skills WHERE name IN ('Docker', 'AWS', 'Git', 'REST API')
        ON CONFLICT DO NOTHING;

        -- Map Skills to Job 3 (ML/NLP)
        INSERT INTO job_skills (job_id, skill_id, is_required)
        SELECT j3_id, id, TRUE FROM skills WHERE name IN ('Python', 'Machine Learning', 'NLP', 'FastAPI')
        ON CONFLICT DO NOTHING;
        INSERT INTO job_skills (job_id, skill_id, is_required)
        SELECT j3_id, id, FALSE FROM skills WHERE name IN ('PyTorch', 'Docker', 'Scikit-Learn', 'Pandas')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;
