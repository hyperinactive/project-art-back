/**
 * generates email html template
 *
 * @param {string} username username of the receiver
 * @param {number} code 4 digit verification number
 * @returns {string} html template
 */
const generateTemplate = (username, code) =>
  `<!DOCTYPE html>
  <html>
  <head>
    <style>
      * {
        text-align: center;
        color: 'black' !important;
      }
      .accent {
        color: #f2711c !important; 
      }
    </style>
  </head>
  <body>
  
    <a href="https://infallible-tesla-85a9ba.netlify.app/"><img src="https://user-images.githubusercontent.com/59929850/125462653-26e7f986-4ea8-4cdc-aefb-b2a5993fc1ef.png" width="150px" /></a>
    <h3>Hi <span class="accent">${username}</span></h3>
    <p>Welcome to <b>Project<span class="accent">Art</span></b></p>
    <p>Please <a href="${process.env.CLIENT_URL_DEV}/verify">verify</a> your account with the code provided (expires in 10min)</p>
    <p><b>${code}</b></p>
    <p>hyperinactive</p>
    
  </body>
  </html>`;

module.exports = generateTemplate;
