const { Subscriber } = require('./models');
const crypto = require('crypto');

async function testSubscribers() {
  try {
    console.log('Checking existing subscribers...');
    const existingSubscribers = await Subscriber.findAll({
      order: [['createdAt', 'DESC']],
      limit: 10
    });
    
    console.log(`Found ${existingSubscribers.length} existing subscribers:`);
    existingSubscribers.forEach(sub => {
      console.log(`- ${sub.email} (${sub.createdAt})`);
    });

    // Check recent subscribers (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - (7 * 24 * 60 * 60 * 1000));
    const recentSubscribers = await Subscriber.findAll({
      where: {
        createdAt: { 
          [require('sequelize').Op.gte]: sevenDaysAgo 
        },
        unsubscribed: false
      },
      order: [['createdAt', 'DESC']]
    });
    
    console.log(`\nRecent subscribers (last 7 days): ${recentSubscribers.length}`);
    recentSubscribers.forEach(sub => {
      console.log(`- ${sub.email} (${sub.createdAt})`);
    });

    // If no recent subscribers, create some sample data
    if (recentSubscribers.length === 0) {
      console.log('\nCreating sample recent subscribers...');
      
      const sampleData = [
        { email: 'john.doe@example.com', name: 'John Doe' },
        { email: 'sarah.smith@gmail.com', name: 'Sarah Smith' },
        { email: 'mike.johnson@yahoo.com', name: 'Mike Johnson' },
        { email: 'emma.wilson@outlook.com', name: 'Emma Wilson' },
        { email: 'alex.brown@protonmail.com', name: 'Alex Brown' }
      ];

      const now = new Date();
      const createdSubscribers = [];

      for (let i = 0; i < sampleData.length; i++) {
        const createdAt = new Date(now.getTime() - (i * 6 * 60 * 60 * 1000)); // Every 6 hours
        const unsubscribeToken = crypto.randomBytes(24).toString('hex');
        
        // Check if already exists
        const existing = await Subscriber.findOne({ where: { email: sampleData[i].email } });
        if (!existing) {
          const subscriber = await Subscriber.create({
            email: sampleData[i].email,
            name: sampleData[i].name,
            unsubscribeToken,
            createdAt,
            updatedAt: createdAt
          });
          createdSubscribers.push(subscriber);
          console.log(`Created: ${subscriber.email} (${subscriber.createdAt})`);
        } else {
          console.log(`Already exists: ${sampleData[i].email}`);
        }
      }
      
      console.log(`\nCreated ${createdSubscribers.length} new sample subscribers`);
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

testSubscribers();