const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const xml2js = require('xml2js');

const app = express();
app.use(bodyParser.json());

// Define your RESTful endpoint
app.post('/persondetails', async (req, res) => {
  try {
    const { phonenumber } = req.body;

    // Create the XML payload for the SOAP request
    const xmlPayload = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:cmr="http://oracle.com/CmRtrPersonDetailsFromContact.xsd">
        <soapenv:Header/>
        <soapenv:Body>
            <cmr:CmRtrPersonDetailsFromContact>
                <cmr:request>
                    <cmr:phoneNum>${phonenumber}</cmr:phoneNum>
                </cmr:request>
            </cmr:CmRtrPersonDetailsFromContact>
        </soapenv:Body>
     </soapenv:Envelope>
    `;

    // Set the headers for the SOAP request
    const headers = {
      'Content-Type': 'text/xml',
      'Authorization': 'Basic U1lTVVNFUjpzeXN1c2VyMDA='
    };

    // Make the SOAP request to the SOAP API endpoint
    const soapResponse = await axios.post('http://172.40.0.60:8009//ouaf/XAIApp/xaiserver/CmRtrPersonDetailsFromContact', xmlPayload, { headers });

    // Convert the SOAP response to JSON
    const xmlParser = new xml2js.Parser({ explicitArray: false });
    xmlParser.parseString(soapResponse.data, (err, result) => {
      if (err) {
        throw new Error(err);
      }

      

      // Extract the desired data from the SOAP response
      const response = result['soapenv:Envelope']['soapenv:Body']['CmRtrPersonDetailsFromContact']['response'];
      const message = response.message;
      const personName = response.personName;
      const perId = response.perId;
      const mtrMessage = response.mtrMessage;

      const mtrSrl = response.mtrSrl;
      const meterserialno=JSON.stringify(mtrSrl);

      const acctMessage = response.acctMessage;
      
      const acctIds = response.acctIds;
      const accountid=JSON.stringify(acctIds);


      // Prepare the REST API response
      const restResponse = {
        message: `${message}`,
        personName: `${personName}`,
        perId: `${perId}`,
        mtrMessage: `${mtrMessage}`,
        mtrSrl: `${meterserialno}`,
        acctMessage: `${acctMessage}`,
        acctIds: `${accountid}`
      };

      

      // Send the REST API response
      res.status(200).json(restResponse);
    });
  } catch (error) {
    // Handle any errors that occurred during the conversion or request
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(3001, () => {
  console.log('Server is running on port 3001');
});

