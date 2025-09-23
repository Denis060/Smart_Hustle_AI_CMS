// Script to add recommended external courses
const { Course } = require('./models');

async function addRecommendedCourses() {
  try {
    console.log('Adding recommended external courses...');

    const recommendedCourses = [
      {
        title: "Machine Learning Specialization",
        description: "Learn the fundamentals of machine learning from Andrew Ng. This comprehensive course covers supervised learning, unsupervised learning, and best practices for ML projects.",
        external: true,
        affiliateLink: "https://www.coursera.org/specializations/machine-learning-introduction",
        provider: "Coursera",
        level: "beginner",
        price: 49.00,
        currency: "USD",
        duration: "3-6 months",
        status: "published",
        featured: true,
        difficulty: "beginner",
        learningOutcomes: JSON.stringify([
          "Build machine learning models in Python using NumPy & scikit-learn",
          "Build & train supervised machine learning models for prediction & binary classification tasks",
          "Build & train a neural network with TensorFlow to perform multi-class classification",
          "Apply best practices for machine learning development"
        ]),
        prerequisites: JSON.stringify([
          "Basic Python programming",
          "High school level mathematics"
        ])
      },
      {
        title: "Deep Learning Specialization",
        description: "Master deep learning and break into AI. This is the most comprehensive deep learning course available, taught by Andrew Ng and industry experts.",
        external: true,
        affiliateLink: "https://www.coursera.org/specializations/deep-learning",
        provider: "Coursera",
        level: "medium",
        price: 49.00,
        currency: "USD",
        duration: "4-6 months",
        status: "published",
        featured: true,
        difficulty: "intermediate",
        learningOutcomes: JSON.stringify([
          "Build and train deep neural networks",
          "Identify key architecture parameters",
          "Implement vectorized neural networks and deep learning to applications",
          "Understand key hyper-parameters in neural network's learning process"
        ]),
        prerequisites: JSON.stringify([
          "Machine Learning basics",
          "Python programming",
          "Linear algebra and calculus"
        ])
      },
      {
        title: "AI for Everyone",
        description: "Understand AI strategy and how to lead AI transformation in your company. Perfect for non-technical professionals who want to understand AI's business impact.",
        external: true,
        affiliateLink: "https://www.coursera.org/learn/ai-for-everyone",
        provider: "Coursera",
        level: "beginner",
        price: 39.00,
        currency: "USD",
        duration: "4 weeks",
        status: "published",
        featured: false,
        difficulty: "beginner",
        learningOutcomes: JSON.stringify([
          "Understand what AI can and cannot do",
          "Navigate AI projects from conception to launch",
          "Work with an AI team and build an AI strategy",
          "Navigate ethical and societal discussions around AI"
        ]),
        prerequisites: JSON.stringify([
          "No programming experience required",
          "Business or leadership experience helpful"
        ])
      },
      {
        title: "ChatGPT Prompt Engineering for Developers",
        description: "Learn to use ChatGPT API for applications. Taught by Isa Fulford (OpenAI) and Andrew Ng (DeepLearning.AI), this short course will teach you how to use LLMs.",
        external: true,
        affiliateLink: "https://www.deeplearning.ai/short-courses/chatgpt-prompt-engineering-for-developers/",
        provider: "DeepLearning.AI",
        level: "beginner",
        price: 0.00,
        currency: "USD",
        duration: "1 hour",
        status: "published",
        featured: true,
        difficulty: "beginner",
        learningOutcomes: JSON.stringify([
          "Learn prompting best practices for software development",
          "Discover new ways to use LLMs, including how to build a custom chatbot",
          "Gain hands-on practice writing and iterating on prompts",
          "Learn to use the ChatGPT API for various applications"
        ]),
        prerequisites: JSON.stringify([
          "Basic Python programming",
          "Familiarity with APIs helpful but not required"
        ])
      },
      {
        title: "Generative AI with Large Language Models",
        description: "Learn the fundamentals of how generative AI works, and how to deploy it in real-world applications. Created in partnership with AWS.",
        external: true,
        affiliateLink: "https://www.coursera.org/learn/generative-ai-with-llms",
        provider: "Coursera",
        level: "medium",
        price: 49.00,
        currency: "USD",
        duration: "3-4 weeks",
        status: "published",
        featured: true,
        difficulty: "intermediate",
        learningOutcomes: JSON.stringify([
          "Understand the transformer architecture that powers LLMs",
          "Learn to fine-tune and deploy LLMs for various use cases",
          "Explore methods for improving LLM performance",
          "Understand the computational and infrastructure requirements"
        ]),
        prerequisites: JSON.stringify([
          "Intermediate Python programming",
          "Basic machine learning knowledge",
          "Understanding of neural networks"
        ])
      }
    ];

    for (const courseData of recommendedCourses) {
      const [course, created] = await Course.findOrCreate({
        where: { 
          title: courseData.title,
          external: true 
        },
        defaults: courseData
      });

      if (created) {
        console.log(`✅ Added: ${course.title}`);
      } else {
        console.log(`⏭️  Already exists: ${course.title}`);
      }
    }

    console.log('\n🎉 Recommended courses setup complete!');
  } catch (error) {
    console.error('❌ Error adding recommended courses:', error);
  }
}

// Run the script
addRecommendedCourses();