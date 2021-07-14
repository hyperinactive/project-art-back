const generateTemplate = (username, userID) =>
  `<!DOCTYPE html>
  <html>
  <head>
  <style>
  * {
    text-align: center;
  }
  span {
    color: #f2711c; 
  }
  </style>
  </head>
  <body>
  
  <a href="https://infallible-tesla-85a9ba.netlify.app/"><img src="https://user-images.githubusercontent.com/59929850/125462653-26e7f986-4ea8-4cdc-aefb-b2a5993fc1ef.png" width="150px" /></a>
  <h3>Hi <span>${username}</span></h3>
  <p>Please <a href="${process.env.CLIENT_URL_DEV}/verify/${userID}">verify</a> your account</p>
  <p>Welcome to <b>Project<span>Art</span></p></b>
  <p>hyperinactive</p>
    
  </body>
  </html>`;

module.exports = generateTemplate;
