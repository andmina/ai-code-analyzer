import express from 'express';
import * as dotenv from 'dotenv'; // get data from .env File
import cors from 'cors';
import { Configuration, OpenAIApi} from 'openai';

dotenv.config();

const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,  
}); 

// Create an instance of OpenAI
const openai = new OpenAIApi(configuration);

// Init express app
const app = express();
// Middleware: Allow server to be called from the FrontEnd
app.use(cors());
app.use(express.json()); // pass json from FE to BE

// dummy root route ('get' can't receive a lot of data)
app.get('/', async(req, res) => {
    res.status(200).send({
        message:'Hello from CodeAnalyzer',
    })
});
// Get data from a body of the FE request
app.post('/', async(req, res) => {
    try {
        const prompt = req.body.prompt;

        // Create a response from the openAPI
        const response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: `${prompt}`, // pass the prompt from the FE
            temperature: 0, // the higher the number the more risks the model will take
            max_tokens: 3000, // it can give pretty long responses
            top_p: 1,
            frequency_penalty: 0.5, // it's less likely to answer a similair thing when asked a similair Q
            presence_penalty: 0,
        });
        
        // Send the repsonse back to FE
        res.status(200).send({
            bot: response.data.choices[0].text
        })

    } catch (error) {
        console.error(error);
        res.status(500).send(error || 'Something went wrong');
    }
});

// Keep listening to new requests
app.listen(5000, () => console.log('AI server started on http://localhost:5000'))





