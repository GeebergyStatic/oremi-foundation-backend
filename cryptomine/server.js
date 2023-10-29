const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000; // You can use any port you prefer

app.use(bodyParser.json());

// Define a route to handle the Paystack webhook events
app.post('/paystack-webhook', (req, res) => {
  const eventData = req.body;
  // Handle the webhook event here
  console.log('Received Paystack Webhook:', eventData);

    // Handle different event types
    if (eventData.event === 'charge.success') {
      // Process a successful payment event
      const paymentReference = eventData.data.reference;
      const amount = eventData.data.amount;
  
      // Update your database or perform other necessary actions
      // You can call a function to handle this, e.g., updatePaymentStatus(paymentReference, amount);
  
      console.log('Payment successful:', paymentReference);
    }

  // Respond with a 200 OK to acknowledge receipt of the event
  res.status(200).end();
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
