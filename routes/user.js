var https = require('https')
  , uuid = require('node-uuid');

/**
 * Authenticate users
 * @param {Object} req
 * @param {Object} res
 */
exports.authenticate = function(req, res) {
    
    var auth = new Buffer(req.param('username') + ':' + req.param('password')).toString('base64');
    var uu = uuid.v1();
    var options = {
      hostname: 'tsm.todaysspecialsapp.com',
      port: 8082,
      path: '/api/tsc/v1/login?uu='+ uu +'&dv=TSB',
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
