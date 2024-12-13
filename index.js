
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const Lead = require('./models/Lead');
const { MONGO_URI, PORT } = process.env;
const axios = require("axios");
const { getAccessToken } = require('./config/zcrm_config');


const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));


 

/////--------------fetch newly created  leads and stpre it on db-------------------------////


app.post('/webhook/zoho/leads', async (req, res) => {
  try {
    const webhookData = req.body;
    console.log('Headers:', req.headers);
    console.log('Query Params:', req.query);
    console.log('Received webhook data:', webhookData);
    const lead = new Lead(webhookData);
    await lead.save();
    console.log('Lead saved successfully:', lead);
    res.status(200).send('Success');
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).send('Internal Server Error');
  }
});


//////---------------------------------------------------------------------------------//////





// app.post('/webhook/sendgrid', async (req, res) => {
//   const accessToken = await getAccessToken();
//   console.log(accessToken,"accessToken");
  
//   // try {
//   //   const webhookData = req.body;  // The SendGrid event data
//   //   console.log('Received SendGrid webhook data:', webhookData);
//   //   res.status(200).send('Webhook processed successfully');
//   //   return res.status(200).json(webhookData);
  
  
//   // } catch (error) {
//   //   console.error('Error processing SendGrid webhook:', error);
//   //   res.status(500).send('Internal Server Error');
//   // }
//   try {
//     // Hardcoded dummy emailData
//     console.log("Incoming req.body:", req.body); // Debugging line

//     // Use req.body or fallback to hardcoded data
//     const emailData = Array.isArray(req.body) ? req.body :  [
//       {
//         "email": "aakash123@gmail.com",
//         "timestamp": 1733295343,
//         "smtp-id": "<14c5d75ce93.dfd.64b469@ismtpd-555>",
//         "event": "WORKING",
//         "category": ["cat facts"],
//         "sg_event_id": "TSYQAunWzE4Zr8ubaWCDxA==",
//         "sg_message_id": "14c5d75ce93.dfd.64b469.filter0001.16648.5515E0B88.4"
//       },
//       {
//         "email": "st21024@gmail.com",
//         "timestamp": 1733295343,
//         "smtp-id": "<14c5d75ce93.dfd.64b469@ismtpd-555>",
//         "event": "WORKING",
//         "category": ["cat facts"],
//         "sg_event_id": "hdtOlKupDV5Pj7qy7qd9FQ==",
//         "sg_message_id": "14c5d75ce93.dfd.64b469.filter0001.16648.5515E0B88.4",
//         "useragent": "Mozilla/4.0 (compatible; MSIE 6.1; Windows XP; .NET CLR 1.1.4322; .NET CLR 2.0.50727)",
//         "ip": "255.255.255.255",
//         "url": "http://www.sendgrid.com/",
//         "asm_group_id": 10
//       },
//       {
//         "email": "st21025@gmail.com",
//         "timestamp": 1733295343,
//         "smtp-id": "<14c5d75ce93.dfd.64b469@ismtpd-555>",
//         "event": "WORKING",
//         "category": ["cat facts"],
//         "sg_event_id": "kO5XPEde-GpFTp-b8mdojQ==",
//         "sg_message_id": "14c5d75ce93.dfd.64b469.filter0001.16648.5515E0B88.4",
//         "useragent": "Mozilla/4.0 (compatible; MSIE 6.1; Windows XP; .NET CLR 1.1.4322; .NET CLR 2.0.50727)",
//         "ip": "255.255.255.255",
//         "url": "http://www.sendgrid.com/",
//         "asm_group_id": 10
//       }
//     ];

//     // Extract emails from the emailData
//     const emails = emailData.map((item) => item.email.trim());
//     const leads = await Lead.find({ Email: { $in: emails } });

//     // Check if any matching leads were found
//     if (leads.length > 0) {
//       const responseData = emailData.map((item) => {
//         const lead = leads.find(
//           (lead) => lead.Email.trim() === item.email.trim()
//         );
//         return {
//           ...item,
//           Lead_Owner: lead ? lead.Lead_Owner : null,

//         };
//       });

//       console.log(responseData, "responseData");

//       // Send the response to the client first (asynchronously)
//       res.status(200).json({
//         success: true,
//         data: responseData,
//       });
// const zohoApiUrl = 'https://www.zohoapis.com/crm/v5/Solutions';

//       // Process data for Zoho CRM
//       for (let data of responseData) {
//         const { email, sg_message_id, event, ip, sg_event_id, timestamp, category, Lead_Owner } = data;

//         const zohoData = {
//           data: [
//             {
//               Email: email,
//               Event: event,
//               IP: ip,
//               Event_ID: sg_event_id,
//               Message_ID: sg_message_id,
//               Date_and_Time: new Date(timestamp * 1000).toISOString(),
//               Solution_Title: category ? category.join(", ") : 'No Category',
//               Title: `Solution for ${email}`,
//               Lead_Owner: Lead_Owner || 'Not Assigned',

//             },
//           ],
//         };

//         try {
//           // Search for existing record in Zoho CRM
//           const searchZohoApiUrl = `https://www.zohoapis.com/crm/v5/Solutions/search?criteria=(Email:equals:${email})and(Message_ID:equals:${sg_message_id})`;
//           const existingRecordResponse = await axios.get(searchZohoApiUrl, {
//             headers: {
//               Authorization: `Zoho-oauthtoken ${accessToken}`,
//             },
//           });

//           if (existingRecordResponse.data?.data?.length > 0) {
//             const existingRecordId = existingRecordResponse.data.data[0].id;
//             const updateApiUrl = `https://www.zohoapis.com/crm/v5/Solutions/${existingRecordId}`;
//             await axios.put(updateApiUrl, zohoData, {
//               headers: {
//                 Authorization: `Zoho-oauthtoken ${accessToken}`,
//               },
//             });

//             console.log(`Record successfully updated for ${email} with Message_ID ${sg_message_id}`);
//           } else {
//             await axios.post(zohoApiUrl, zohoData, {
//               headers: {
//                 Authorization: `Zoho-oauthtoken ${accessToken}`,
//               },
//             });

//             console.log(`New record successfully created for ${email} with Message_ID ${sg_message_id}`);
//           }
//         } catch (zohoError) {
//           console.error("Error updating/creating record in Zoho CRM:", zohoError.message || zohoError.response?.data || zohoError);
//         }
//       }
//     } else {
//       return res.status(404).json({
//         message: "No matching leads found for the provided emails.",
//       });
//     }
//   } catch (error) {
//     console.error('Error processing webhook:', error);
//     // Only send one response, don't do a second res.send after an error
//     return res.status(500).send('Internal Server Error');
//   }
// });











//////send grid web hook and update and create record function for the soution tab 







//////////----------  old working live ----------------------------------------------------------------------------------------------//////////////////

///////fuction for send gred web hook to crete and unddate recods for solution tab

// app.post('/webhook/sendgrid', async (req, res) => {
//   const accessToken = await getAccessToken();
//   console.log(accessToken, "accessToken"); 

//   try {
//     // Use webhook data dynamically
//     const webhookData = req.body; // The SendGrid event data
//     console.log('Received SendGrid webhook data:', webhookData);   ///console the web hookdata 

//     // Extract emails from the webhookData
//     const emails = webhookData.map((item) => item.email.trim());       ///select the eamil a from the compnig web hook data
//     const leads = await Lead.find({ Email: { $in: emails } });         ////mayching with the leads data throgh email

//     // Check if any matching leads were found
//     if (leads.length > 0) {
//       const responseData = webhookData.map((item) => {
//         const lead = leads.find(
//           (lead) => lead.Email.trim() === item.email.trim()
//         );
//         return {
//           ...item,
//           Lead_Owner: lead ? lead.Lead_Owner : null,       ///finding the lead owner name
//         };
//       });

//       console.log(responseData, "responseData");            ///console the responce data with all the details

//       // Send the response to the client first (asynchronously)
//       res.status(200).json({
//         success: true,
//         data: responseData,
//       });



//       ///zoho functions for to store tyhe data
//       const zohoApiUrl = 'https://www.zohoapis.com/crm/v5/Solutions';

//       // Process data for Zoho CRM
//       for (let data of responseData) {
//         const { email, sg_message_id, event, ip, sg_event_id, timestamp, category, Lead_Owner } = data;

//         const zohoData = {
//           data: [
//             {
//               Email: email,
//               Event: event,
//               IP: ip,
//               Event_ID: sg_event_id,
//               Message_ID: sg_message_id,
//               Date_and_Time: new Date(timestamp * 1000).toISOString(),
//               Solution_Title: category ? category.join(", ") : 'No Category',
//               Title: `Solution for ${email}`,
//               Lead_Owner: Lead_Owner || 'Not Assigned',
//             },
//           ],
//         };

//         try {
//           // Search for existing record in Zoho CRM
//           const searchZohoApiUrl = `https://www.zohoapis.com/crm/v5/Solutions/search?criteria=(Email:equals:${email})and(Message_ID:equals:${sg_message_id})`;
//           const existingRecordResponse = await axios.get(searchZohoApiUrl, {
//             headers: {
//               Authorization: `Zoho-oauthtoken ${accessToken}`,
//             },
//           });

//           if (existingRecordResponse.data?.data?.length > 0) {
//             const existingRecordId = existingRecordResponse.data.data[0].id;
//             const updateApiUrl = `https://www.zohoapis.com/crm/v5/Solutions/${existingRecordId}`;
//             await axios.put(updateApiUrl, zohoData, {
//               headers: {
//                 Authorization: `Zoho-oauthtoken ${accessToken}`,
//               },
//             });

//             console.log(`Record successfully updated for ${email} with Message_ID ${sg_message_id}`);
//           } else {
//             await axios.post(zohoApiUrl, zohoData, {
//               headers: {
//                 Authorization: `Zoho-oauthtoken ${accessToken}`,
//               },
//             });

//             console.log(`New record successfully created for ${email} with Message_ID ${sg_message_id}`);
//           }
//         } catch (zohoError) {
//           console.error("Error updating/creating record in Zoho CRM:", zohoError.message || zohoError.response?.data || zohoError);
//         }
//       }
//     } else {
//       return res.status(404).json({
//         message: "No matching leads found for the provided emails.",
//       });
//     }
//   } catch (error) {
//     console.error('Error processing webhook:', error);
//     res.status(500).send('Internal Server Error');
//   }
// });

/////////-----------------------------------------------------------------------------------------------------------------------------------//////////////////







//////-------------------------------------------------------------------------testing ------------------------------------------------------------------------/////////////


/////////-------------static controler web hook for  for leads and solution tab--------------///////////////////////


// app.post('/webhook/sendgrid', async (req, res) => {
//   const accessToken = await getAccessToken();
//   console.log(accessToken, "accessToken");

//   try {
//     // Hardcoded dummy emailData
//     console.log("Incoming req.body:", req.body); // Debugging line

//     const emailData = Array.isArray(req.body) ? req.body : [
//       {
//         "email": "st21024@gmail.com",
//         "timestamp": 1733295343,
//         "smtp-id": "<14c5d75ce93.dfd.64b469@ismtpd-555>",
//         "event": "Working2.0 ",
//         "category": ["cat facts"],
//         "sg_event_id": "hdtOlKupDV5Pj7qy7qd9FQ==",
//         "sg_message_id": "14c5d75ce93.dfd.64b469.filter0001.16648.5515E0B88.4",
//         "useragent": "Mozilla/4.0 (compatible; MSIE 6.1; Windows XP; .NET CLR 1.1.4322; .NET CLR 2.0.50727)",
//         "ip": "255.255.255.255",
//         "url": "http://www.sendgrid.com/",
//         "asm_group_id": 10
//       }
//     ];

//     // Extract emails from the emailData
//     const emails = emailData.map((item) => item.email.trim());
//     const leads = await Lead.find({ Email: { $in: emails } });

//     if (leads.length > 0) {
//       const responseData = emailData.map((item) => {
//         const lead = leads.find(
//           (lead) => lead.Email.trim() === item.email.trim()
//         );
//         return {
//           ...item,
//           Lead_Owner: lead ? lead.Lead_Owner : null,
//         };
//       });

//       console.log(responseData, "responseData");

//       // Send the response to the client first (asynchronously)
//       res.status(200).json({
//         success: true,
//         data: responseData,
//       });

//       const zohoApiUrl = 'https://www.zohoapis.com/crm/v5/Solutions';

//       // Process data for Zoho CRM Solutions
//       for (let data of responseData) {
//         const { email, sg_message_id, event, ip, sg_event_id, timestamp, category, Lead_Owner } = data;

//         const zohoData = {
//           data: [
//             {
//               Email: email,
//               Event: event,
//               IP: ip,
//               Event_ID: sg_event_id,
//               Message_ID: sg_message_id,
//               Date_and_Time: new Date(timestamp * 1000).toISOString(),
//               Solution_Title: category ? category.join(", ") : 'No Category',
//               Title: `Solution for ${email}`,
//               Lead_Owner: Lead_Owner || 'Not Assigned',
//             },
//           ],
//         };

//         try {
//           // Search for existing record in Zoho CRM Solutions
//           const searchZohoApiUrl = `https://www.zohoapis.com/crm/v5/Solutions/search?criteria=(Email:equals:${email})and(Message_ID:equals:${sg_message_id})`;
//           const existingRecordResponse = await axios.get(searchZohoApiUrl, {
//             headers: {
//               Authorization: `Zoho-oauthtoken ${accessToken}`,
//             },
//           });

//           if (existingRecordResponse.data?.data?.length > 0) {
//             const existingRecordId = existingRecordResponse.data.data[0].id;
//             const updateApiUrl = `https://www.zohoapis.com/crm/v5/Solutions/${existingRecordId}`;
//             await axios.put(updateApiUrl, zohoData, {
//               headers: {
//                 Authorization: `Zoho-oauthtoken ${accessToken}`,
//               },
//             });

//             console.log(`Record successfully updated for ${email} with Message_ID ${sg_message_id}`);
//           } else {
//             await axios.post(zohoApiUrl, zohoData, {
//               headers: {
//                 Authorization: `Zoho-oauthtoken ${accessToken}`,
//               },
//             });

//             console.log(`New record successfully created for ${email} with Message_ID ${sg_message_id}`);
//           }

//           // Step 2: Now, update the "Event" field in Zoho CRM Leads tab
//           const searchLeadsApiUrl = `https://www.zohoapis.com/crm/v5/Leads/search?criteria=(Email:equals:${email})`;
//           const leadRecordResponse = await axios.get(searchLeadsApiUrl, {
//             headers: {
//               Authorization: `Zoho-oauthtoken ${accessToken}`,
//             },
//           });

//           if (leadRecordResponse.data?.data?.length > 0) {
//             const leadRecordId = leadRecordResponse.data.data[0].id;
//             const updateLeadApiUrl = `https://www.zohoapis.com/crm/v5/Leads/${leadRecordId}`;
//             const leadUpdateData = {
//               data: [
//                 {
//                   Event: event,  // Updating the "Event" field in Leads tab
//                   I_P: ip,
//                   Date_and_Time: new Date(timestamp * 1000).toISOString(),
//                   Event_ID: sg_event_id,
//                   Message_ID: sg_message_id,


//                 },
//               ],
//             };

//             await axios.put(updateLeadApiUrl, leadUpdateData, {
//               headers: {
//                 Authorization: `Zoho-oauthtoken ${accessToken}`,
//               },
//             });

//             console.log(`Event field successfully updated for lead with Email: ${email}`);
//           }
//         } catch (zohoError) {
//           console.error("Error updating/creating record in Zoho CRM:", zohoError.message || zohoError.response?.data || zohoError);
//         }
//       }
//     } else {
//       return res.status(404).json({
//         message: "No matching leads found for the provided emails.",
//       });
//     }
//   } catch (error) {
//     console.error('Error processing webhook:', error);
//     return res.status(500).send('Internal Server Error');
//   }
// });

















//////------------------------ live working condition for the dynamic web hook for leads and solution tab---------------------////////////


app.post('/webhook/sendgrid', async (req, res) => {
  const accessToken = await getAccessToken();
  console.log(accessToken, "accessToken"); 

  try {
    // Use webhook data dynamically
    const webhookData = req.body; // The SendGrid event data
    console.log('Received SendGrid webhook data:', webhookData);   // console the webhook data

    // Extract emails from the webhookData
    const emails = webhookData.map((item) => item.email.trim()); // select the email from the campaign webhook data
    const leads = await Lead.find({ Email: { $in: emails } }); // matching with the leads data through email

    // Check if any matching leads were found
    if (leads.length > 0) {
      const responseData = webhookData.map((item) => {
        const lead = leads.find(
          (lead) => lead.Email.trim() === item.email.trim()
        );
        return {
          ...item,
          Lead_Owner: lead ? lead.Lead_Owner : null, // finding the lead owner name
        };
      });

      console.log(responseData, "responseData"); // console the response data with all the details

      // Send the response to the client first (asynchronously)
      res.status(200).json({
        success: true,
        data: responseData,
      });

      // Zoho functions to store the data
      const zohoApiUrl = 'https://www.zohoapis.com/crm/v5/Solutions';

      // Process data for Zoho CRM
      for (let data of responseData) {
        const { email, sg_message_id, event, ip, sg_event_id, timestamp, category, Lead_Owner } = data;

        const zohoData = {
          data: [
            {
              Email: email,
              Event: event,
              IP: ip,
              Event_ID: sg_event_id,
              Message_ID: sg_message_id,
              Date_and_Time: new Date(timestamp * 1000).toISOString(),
              Solution_Title: category ? category.join(", ") : 'No Category',
              Title: `Solution for ${email}`,
              Lead_Owner: Lead_Owner || 'Not Assigned',
            },
          ],
        };

        try {
          // Search for existing record in Zoho CRM
          const searchZohoApiUrl = `https://www.zohoapis.com/crm/v5/Solutions/search?criteria=(Email:equals:${email})and(Message_ID:equals:${sg_message_id})`;
          const existingRecordResponse = await axios.get(searchZohoApiUrl, {
            headers: {
              Authorization: `Zoho-oauthtoken ${accessToken}`,
            },
          });

          if (existingRecordResponse.data?.data?.length > 0) {
            const existingRecordId = existingRecordResponse.data.data[0].id;
            const updateApiUrl = `https://www.zohoapis.com/crm/v5/Solutions/${existingRecordId}`;
            await axios.put(updateApiUrl, zohoData, {
              headers: {
                Authorization: `Zoho-oauthtoken ${accessToken}`,
              },
            });

            console.log(`Record successfully updated for ${email} with Message_ID ${sg_message_id}`);
          } else {
            await axios.post(zohoApiUrl, zohoData, {
              headers: {
                Authorization: `Zoho-oauthtoken ${accessToken}`,
              },
            });

            console.log(`New record successfully created for ${email} with Message_ID ${sg_message_id}`);
          }

          // Step 2: Now, update the "Event" field in Zoho CRM Leads tab
          const searchLeadsApiUrl = `https://www.zohoapis.com/crm/v5/Leads/search?criteria=(Email:equals:${email})`;
          const leadRecordResponse = await axios.get(searchLeadsApiUrl, {
            headers: {
              Authorization: `Zoho-oauthtoken ${accessToken}`,
            },
          });

          if (leadRecordResponse.data?.data?.length > 0) {
            const leadRecordId = leadRecordResponse.data.data[0].id;
            const updateLeadApiUrl = `https://www.zohoapis.com/crm/v5/Leads/${leadRecordId}`;
            const leadUpdateData = {
              data: [
                {
                  Event: event,  // Updating the "Event" field in Leads tab
                  I_P: ip,
                  Date_and_Time: new Date(timestamp * 1000).toISOString(),
                  Event_ID: sg_event_id,
                  Message_ID: sg_message_id,
                },
              ],
            };

            await axios.put(updateLeadApiUrl, leadUpdateData, {
              headers: {
                Authorization: `Zoho-oauthtoken ${accessToken}`,
              },
            });

            console.log(`Event field successfully updated for lead with Email: ${email}`);
          }
        } catch (zohoError) {
          console.error("Error updating/creating record in Zoho CRM:", zohoError.message || zohoError.response?.data || zohoError);
        }
      }
    } else {
      return res.status(404).json({
        message: "No matching leads found for the provided emails.",
      });
    }
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).send('Internal Server Error');
  }
});




app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});



