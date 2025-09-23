const axios = require('axios');

async function testAnalytics() {
  try {
    console.log('Testing analytics endpoint...');
    const response = await axios.get('http://localhost:5000/api/analytics/summary?period=7d');
    
    console.log('Analytics response:');
    console.log('- Total subscribers:', response.data.subscribers);
    console.log('- Recent subscribers:', response.data.period?.recentSubscribers || 0);
    console.log('- Recent activity subscribers:', response.data.recentActivity?.subscribers?.length || 0);
    
    if (response.data.recentActivity?.subscribers) {
      console.log('\nRecent subscribers list:');
      response.data.recentActivity.subscribers.forEach((sub, index) => {
        console.log(`${index + 1}. ${sub.email} (${sub.name || 'No name'}) - ${new Date(sub.createdAt).toLocaleDateString()}`);
      });
    } else {
      console.log('\nNo recent subscribers found in response');
    }
    
  } catch (error) {
    console.error('Error testing analytics:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

testAnalytics();