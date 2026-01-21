
const http = require('http');

const server = http.createServer((req, res) => {

  res.setHeader('Content-Type', 'application/json');

  // ROUTING
  if (req.method === 'GET' && req.url === '/') {
    res.statusCode = 200;
    res.end(JSON.stringify({
      message: "Welcome to Home Page",
      method: req.method
    }));
  }

  else if (req.method === 'GET' && req.url === '/about') {
    res.statusCode = 200;
    res.end(JSON.stringify({
      message: "About Page",
      info: "This is a basic Node.js HTTP server"
    }));
  }

  else if (req.method === 'GET' && req.url === '/user') {
    res.statusCode = 200;
    res.end(JSON.stringify({
      name: "Harsh",
      role: "Student",
      tech: "Node.js"
    }));
  }

  
  else {
    res.statusCode = 404;
    res.end(JSON.stringify({
      error: "Route Not Found"
    }));
  }

});


server.listen(8080, () => {
  console.log("Server running at http://localhost:8080");
});
