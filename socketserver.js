// Use the http, fs, url modules (http://nodejs.org/api/http.html)
var http = require('https');
var fs = require('fs');
var url =  require('url');

// readFileSync returns the contents of the file
var options = {
	key: fs.readFileSync('my-key.pem'),
	cert: fs.readFileSync('my-cert.pem')
};

// do it
// Emitted (response) each time there is a request from a client
// Bascially, where there is a request, get client URL
// And the, read file from the URL and send the contents of the file back to the client(?)
// Question 1: where is the fileContents function?
// http://nodejs.org/api/http.html#http_event_request
function handleIt(req, res) {
	console.log("The URL is: " + req.url);

	//req is an IncominMessage: http://nodejs.org/api/http.html#http_http_incomingmessage
	//res is a ServerResponse: http://nodejs.org/api/http.html#http_class_http_serverresponse
	//res.writeHead(200, {'Content-Type': 'text/html'});
	//res.end('<html><body><b>Hello World</b></body></html>\n');

	var parsedUrl = url.parse(req.url);
	console.log("They asked for " + parsedUrl.pathname);

	var path = parsedUrl.pathname;
	if (path == "/") {
		path = "index.html";
	} //

	fs.readFile(__dirname + path,

		// Callback function for reading
		function (err, fileContents) {
			// if there is an error
			if (err) {
				res.writeHead(500); //Sends a response header to the request (HTTP status code: 500)
				return res.end('Error loading ' + req.url);
			}
			// Otherwise, send the data, the contents of the file
			res.writeHead(200);
			res.end(fileContents);
		}
		);	
	
	// Send a log message to the console
	console.log("Got a request " + req.url);
}

// Call the createServer method, passing in an anonymous callback function that will be called when a request is made
var httpServer = http.createServer(options, handleIt);

// Tell that server to listen on port 8081
httpServer.listen(8081);  
console.log('Server listening on port 8081');

//////////////////////////


// Store PeerID into a 'clients' array
var clients = [];

// Store Socket ID intto a clientSocket array
var clientSocket = [];

var connected = [];
// WebSocket Portion
// WebSockets work with the HTTP server
var io = require('socket.io').listen(httpServer);

// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on('connection', 
	// We are given a websocket object in our function
	function (socket) {

		// receive socket.id, which is not the same as peerID
		console.log("We have a new client: " + socket.id);
		
		// Shawn added
		socket.on('click', function(data) {
			//io.sockets.emit("peerid", data);
			connected.push(data);
			console.log("i have a click");
			socket.broadcast.emit('click', data);
		});

		/*
		socket.on('video', function(data) {
			//io.sockets.emit("peerid", data);
			console.log("i have a video connection");
			socket.broadcast.emit('video', data);
		});
*/

		socket.on('peerid', function(data) {
			//io.sockets.emit("peerid", data);
			socket.broadcast.emit('peerid', data);

			for (var c = 0; c < clients.length; c++) {
				socket.emit('peerid',clients[c]);
			}

			for (var c = 0; c < connected.length; c++) {
				socket.emit('click',connected[c]);
			}

/*		
			clients = [{
				id: ,
				connected:false
			}]
*/

			clients.push(data); //Adding all PeerID to 'clients' array
			clientSocket.push(socket.id); //Adding all Socket ID to 'clientSocket' array
			console.log(socket.id); //print socket id

			//Here im getting socket #, not peerID. Hence, I will get index # using clientSocket array instead.
			//The order should be same as the 'clients' array
			socket.on('disconnect', function(){	
				//var i = clients.indexOf(data);
				var i = clientSocket.indexOf(socket.id);
				console.log("socket to be disconnected is" + socket.id);
				console.log(i); 
				console.log(clients);
				io.emit('disconnect', clients[i]);
				clients.splice(i,1);
				console.log("updated client list: " + clients);
			});
		});
/*
		// If any peer is disconnected, remove that client out of array
		socket.on('disconnect', function(){
			
			var i = clients.indexOf(socket.id);
			console.log("socket is" + data);
			console.log(i); // why i is having -1???
			console.log(clients);
			io.emit('disconnect', clients[i]);
			//delete clients[i];
			clients.splice(i,1);
			console.log("updated client list: " + clients);
			/*
			for(var c = 0; c < clients.length; c++){
				if(clients[c] == data){
					//io.emit('disconnected', clients[c]);
					io.socket.emit('disconnect', clients[c]);
					clients.splice(c,1);
				}
			}
			*/		
		//}); 
}
);