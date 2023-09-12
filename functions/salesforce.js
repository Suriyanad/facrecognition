// netlify/functions/salesforce.js

exports.handler = async (event) => {
    try {
      const { accessToken, instanceUrl } = JSON.parse(event.body);  
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, accessToken, instanceUrl }),
      };
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message }),
      };
    }
  };
  