const express = require('express');


const app = express()

// maybe, in the end
// I dont need an api


app.use(express.json())
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));


export default function (req, res) {
  if (req.method === 'POST') {
    console.log('req>>', req.body)
    // const { username, tracks } = req.body;

    // console.log('Received username:', username);
    // console.log('Received tracks:', tracks);
    // console.log('auth??', $auth.user)


    // Respond with a success message or handle the data as needed
    // res.status(200).json({ message: 'Data received successfully' });
  } else {
    // res.status(405).end(); // Method Not Allowed
  }
}