var https = require('https');

/*
 * GET items from local db.
 */
exports.getspecials = function(req, res){
  
    var id = req.param('vid');
    var key = req.param('key');
    var username = req.param('username');
    
    var auth = new Buffer(username + ':').toString('base64');
    
    var options = {
      hostname: 'tsm.todaysspecialsapp.com',
      port: 8082,
      path: '/api/tsc/v1/specials?k='+ key +'&ven='+ id +'&active=true',
      method: 'GET',
      headers: {'Authorization': 'Basic ' + auth},
      rejectUnauthorized: false,
      requestCert: true,
      agent: false
    };
    
    var request = https.request(options, function(response) {
        
        if(response.statusCode != 200) {
            res.send(response.statusCode);
            this.end();
        }
      
        var data = '';
        response.on('data', function (chunk) {
            data += chunk;
            res.send(data);
        });  
    });
    
    request.on('error', function(e) {
        // log the error
        console.error("error: "+ e.message);
    });
    
    request.end();
};
