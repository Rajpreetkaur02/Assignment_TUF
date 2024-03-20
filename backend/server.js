const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const redis = require('redis');
const axios = require('axios');


const app = express();
const PORT = 3001;

let client = redis.createClient();

//connection with redis server
client.on("connect", function () {
    console.log("Connection Successful!!");
});

app.use(express.json());
app.use(cors({ credentials: true, origin: ["http://localhost:3000"] }));

//connection with mysql database
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'code_snippets_db',
});

connection.connect((err) => {
    if (err) {
        console.log('Error connecting to MySql: ' + err.stack);
        return;
    }
    console.log('Connected to Mysql successfully');
})

app.get('/', (req, res) => {
    res.send('Welcome');
})

//language IDs to give as input to the Judge 0 API
const languageMapping = {
    'c': 49,
    'cpp': 53,
    'java': 62,
    'python': 92,
    'javascript': 93
};

function getLanguageId(languageName) {
    const languagename = languageName.toLowerCase();
    return languageMapping[languagename];
}

//GET request to API in order to get the standard output generated
async function getOutput(token) {
    const options = {
        method: 'GET',
        url: `https://judge0-ce.p.rapidapi.com/submissions/${token}`,
        params: {
            base64_encoded: 'true',
            fields: '*'
        },
        headers: {
            'X-RapidAPI-Key': '096a373ea3mshe284d871bcca77cp14da26jsnc30e9c096277',
            'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
        }
    };

    try {
        while(true){
            const response = await axios.request(options);
            console.log('output' + response.data.stdout);
            console.log(response.data.status.id);
            if(response.data.status.id <= 2){
                await new Promise(resolve => setTimeout(resolve,1000));
            }else{
                const stdout = Buffer.from(response.data.stdout, 'base64').toString();
                return stdout;
            }
        }
    } catch (error) {
        console.error(error);
    }
}

//POST request to execute the code
async function executeCode(sourcecode, languageID, stdin) {
    const options = {
        method: 'POST',
        url: 'https://judge0-ce.p.rapidapi.com/submissions',
        params: {
            base64_encoded: 'true',
            fields: '*'
        },
        headers: {
            'content-type': 'application/json',
            'Content-Type': 'application/json',
            'X-RapidAPI-Key': '096a373ea3mshe284d871bcca77cp14da26jsnc30e9c096277',
            'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
          },
        data: {
            language_id: languageID,
            source_code: Buffer.from(sourcecode).toString('base64'),
            stdin: Buffer.from(stdin).toString('base64'),
        }
    };

    try {
        const response = await axios.request(options);
        const token = response.data.token;
        console.log(token);
        return token;
    } catch (error) {
        console.error(error);
    }
}

//store form details in the database
app.post('/codesnippet', async (req, res) => {
    const { username, codelanguage, stdin, sourcecode } = req.body;

    try {
        const languageID = getLanguageId(codelanguage);

        if (!languageID) {
            res.status(400).send('Invalid Language');
            return;
        }
        const token = await executeCode(sourcecode, languageID, stdin);
        const output = await getOutput(token);
        
        console.log('stdout' + output);

        const sql = 'INSERT INTO code_snippets (username, language, stdin, source_code, stdout) VALUES (?,?,?,?,?)';
        connection.query(sql, [username, codelanguage, stdin, sourcecode, output], (err, result) => {
            if (err) {
                console.error('Error inserting code snippet' + err);
                res.status(200).send('Internal server error');
                return;
            }
            getDataFromDatabase();
            res.status(201).send('code snippet submitted successfully');
        });
    } catch (error) {
        console.error('Error submitting code snippet');
    }
});

//get datad from database
app.get('/snippets', (req, res) => {
    const rediskey = 'code_snippets';
    client.get(rediskey, (err, cachedData) => {
        if (err) {
            console.error("Error fetching data from redis cache");
            getDataFromDatabase(res);
            return;
        } if (cachedData) {
            console.log('sending data from cache');
            res.json(JSON.parse(cachedData));
        } else {
            console.log("fetching from database");
            getDataFromDatabase(res);
        }
    })
});

function getDataFromDatabase() {
    const sql = 'SELECT username, language, stdin, LEFT(source_code, 100) as source_code_short, timestamp, stdout FROM code_snippets';
    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching the data: ' + err);
            res.status(500).send('Internal Server Error');
            return;
        }
        client.setex('code_snippets', 3600, JSON.stringify(results));
    });
}

app.listen(PORT, (error) => {
    if (!error)
        console.log("Server is Successfully Running, "
            + "and App is listening on port " + PORT)
    else
        console.log("Error occurred, server can't start", error);
}
); 