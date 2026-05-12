const fs = require('fs');

let content = fs.readFileSync('src/data/curriculum.ts', 'utf8');

const modules = [
  'java-mastery', 'spring-boot-mastery', 'microservices-mastery', 'react-mastery',
  'javascript-mastery', 'nodejs-mastery', 'postgres-sql-mastery', 'rest-api-design',
  'docker-advanced', 'aws-advanced', 'system-design', 'dsa-mastery'
];

for (const mod of modules) {
  const modRegex = new RegExp(`(id:\\s*'${mod}'[\\s\\S]*?sections:\\s*\\[[\\s\\S]*?)(\\n\\s*\\]\\n\\s*\\},|\\n\\s*\\]\\n\\s*\\})`);
  
  content = content.replace(modRegex, (match, p1, p2) => {
    const quizSection = `,
      {
        id: '${mod}-quizzes',
        title: 'Quizzes & Assessments',
        topics: [
          { id: '${mod}-quiz-beginner', title: 'Beginner Quiz (50 Questions)' },
          { id: '${mod}-quiz-intermediate', title: 'Intermediate Quiz (50 Questions)' },
          { id: '${mod}-quiz-advanced', title: 'Advanced Quiz (50 Questions)' }
        ]
      }`;
    return p1 + quizSection + p2;
  });
}

fs.writeFileSync('src/data/curriculum.ts', content);
console.log('Curriculum updated successfully.');
