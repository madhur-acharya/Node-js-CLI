const http= require('http');
const cli= require('./cli.js');

var http_server= http.createServer(function(request, response)
{
	response.end("Heeello from the server siiiiiide!")
});

http_server.listen(3000, function(err)
{
	if(err) console.log(err);
	else console.log("Server listening onport 3000");
});

setTimeout(() => cli.init(), 500);//starts up the CLI