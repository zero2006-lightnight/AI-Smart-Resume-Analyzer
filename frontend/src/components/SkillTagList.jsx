import { motion, AnimatePresence } from "framer-motion";
import { useMemo } from "react";

// Skill category mapping for color coding
const SKILL_CATEGORIES = {
  // Programming Languages
  programming: {
    skills: ['javascript', 'python', 'java', 'typescript', 'c++', 'c#', 'go', 'rust', 'php', 'ruby', 'swift', 'kotlin'],
    color: 'text-blue-400',
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/30',
    glow: 'hover:shadow-blue-500/30'
  },
  // Frontend Technologies
  frontend: {
    skills: ['react', 'vue', 'angular', 'html', 'css', 'sass', 'less', 'tailwindcss', 'bootstrap', 'next.js', 'nuxt', 'svelte'],
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/20',
    border: 'border-emerald-500/30',
    glow: 'hover:shadow-emerald-500/30'
  },
  // Backend Technologies
  backend: {
    skills: ['node.js', 'express', 'fastapi', 'django', 'flask', 'spring', 'laravel', 'rails', 'asp.net', 'graphql'],
    color: 'text-purple-400',
    bg: 'bg-purple-500/20',
    border: 'border-purple-500/30',
    glow: 'hover:shadow-purple-500/30'
  },
  // Databases
  database: {
    skills: ['mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'sqlite', 'oracle', 'cassandra', 'dynamodb'],
    color: 'text-orange-400',
    bg: 'bg-orange-500/20',
    border: 'border-orange-500/30',
    glow: 'hover:shadow-orange-500/30'
  },
  // Cloud & DevOps
  cloud: {
    skills: ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'jenkins', 'github actions', 'ci/cd', 'nginx'],
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/20',
    border: 'border-cyan-500/30',
    glow: 'hover:shadow-cyan-500/30'
  },
  // Data Science & ML
  data: {
    skills: ['pandas', 'numpy', 'scikit-learn', 'tensorflow', 'pytorch', 'jupyter', 'matplotlib', 'seaborn', 'plotly'],
    color: 'text-pink-400',
    bg: 'bg-pink-500/20',
    border: 'border-pink-500/30',
    glow: 'hover:shadow-pink-500/30'
  },
  // Tools & Others
  tools: {
    skills: ['git', 'linux', 'bash', 'vim', 'vscode', 'postman', 'figma', 'photoshop', 'jira', 'slack'],
    color: 'text-slate-400',
    bg: 'bg-slate-500/20',
    border: 'border-slate-500/30',
    glow: 'hover:shadow-slate-500/30'
  }
};

function getSkillStyle(skill) {
  const skillLower = skill.toLowerCase();
  
  for (const [category, data] of Object.entries(SKILL_CATEGORIES)) {
    if (data.skills.some(s => skillLower.includes(s) || s.includes(skillLower))) {
      return data;
    }
  }
  
  // Default style for unmatched skills
  return {
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/20',
    border: 'border-indigo-500/30',
    glow: 'hover:shadow-indigo-500/30'
  };
}

export default function SkillTagList({ 
  skills = [], 
  title = "Skills", 
  subtitle,
  maxDisplay = null,
  showCount = true,
  onSkillClick
}) {
  const displaySkills = maxDisplay ? skills.slice(0, maxDisplay) : skills;
  const remainingCount = maxDisplay && skills.length > maxDisplay ? skills.length - maxDisplay : 0;

  const skillsByCategory = useMemo(() => {
    const categories = {};
    displaySkills.forEach(skill => {
      const skillLower = skill.toLowerCase();
      let categoryFound = false;
      
      for (const [category, data] of Object.entries(SKILL_CATEGORIES)) {
        if (data.skills.some(s => skillLower.includes(s) || s.includes(skillLower))) {
          if (!categories[category]) categories[category] = [];
          categories[category].push(skill);
          categoryFound = true;
          break;
        }
      }
      
      if (!categoryFound) {
        if (!categories.other) categories.other = [];
        categories.other.push(skill);
      }
    });
    
    return categories;
  }, [displaySkills]);

  if (skills.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-8 text-slate-400"
      >
        <div className="text-4xl mb-2">🔍</div>
        <p>No skills detected yet</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl border border-white/10 p-6 shadow-glow"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <motion.h3
            className="text-lg font-semibold text-white flex items-center gap-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <span>✨</span>
            <span>{title}</span>
          </motion.h3>
          {subtitle && (
            <motion.p
              className="text-sm text-slate-400 mt-1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              {subtitle}
            </motion.p>
          )}
        </div>
        
        {showCount && (
          <motion.div
            className="px-3 py-1 bg-slate-800 rounded-full text-sm font-medium text-slate-300"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            {skills.length} skill{skills.length !== 1 ? 's' : ''}
          </motion.div>
        )}
      </div>

      {/* Skills by Category */}
      <AnimatePresence>
        <motion.div className="space-y-4">
          {Object.entries(skillsByCategory).map(([category, categorySkills], categoryIndex) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + categoryIndex * 0.1 }}
            >
              {/* Category Label */}
              {Object.keys(skillsByCategory).length > 1 && (
                <motion.h4
                  className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 capitalize"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + categoryIndex * 0.1 }}
                >
                  {category === 'other' ? 'Other Skills' : category}
                </motion.h4>
              )}
              
              {/* Skills Grid */}
              <div className="flex flex-wrap gap-2">
                {categorySkills.map((skill, skillIndex) => {
                  const style = getSkillStyle(skill);
                  return (
                    <motion.button
                      key={skill}
                      className={`
                        px-3 py-2 rounded-xl text-sm font-medium border transition-all cursor-pointer
                        ${style.color} ${style.bg} ${style.border} ${style.glow}
                        hover:scale-105 hover:shadow-lg transform
                        focus:outline-none focus:ring-2 focus:ring-current/30
                        skill-tag
                      `}
                      onClick={() => onSkillClick?.(skill)}
                      initial={{ opacity: 0, scale: 0.8, y: 20 }}
                      animate={{ 
                        opacity: 1, 
                        scale: 1, 
                        y: 0 
                      }}
                      transition={{ 
                        delay: 0.7 + categoryIndex * 0.1 + skillIndex * 0.05,
                        type: "spring",
                        stiffness: 200,
                        damping: 20
                      }}
                      whileHover={{ 
                        scale: 1.05,
                        y: -2,
                      }}
                      whileTap={{ scale: 0.95 }}
                      title={`Click to learn more about ${skill}`}
                    >
                      {skill}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          ))}
          
          {/* Show remaining count */}
          {remainingCount > 0 && (
            <motion.div
              className="flex justify-center mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <span className="px-4 py-2 bg-slate-800/60 border border-slate-700 rounded-xl text-sm text-slate-400">
                +{remainingCount} more skill{remainingCount !== 1 ? 's' : ''}
              </span>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Skills Learning Tip */}
      <motion.div
        className="mt-6 p-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
      >
        <div className="flex items-start gap-2 text-sm">
          <span className="text-blue-400 mt-0.5">💡</span>
          <div>
            <p className="text-blue-200 font-medium">Tip: Diversify Your Skills</p>
            <p className="text-slate-400 text-xs mt-1">
              Consider adding skills from different categories to make your profile more versatile and attractive to employers.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
