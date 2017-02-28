module.exports = router;

var express = require('express'); 
var router = express.Router();
var debug=require('debug')('route');
var res_obj=new Object;
const pg = require('pg');

const config = {
  user: 'xxx', 
  database: 'xxx', 
  password: 'xxx', 
  host: 'xxx',
  port: 5432, 
};

/* GET home page. */
router.get('/', function(req, res) {
res.render('index', { title: 'Express' });});
router.post("/api", function(req, res){
    // get name-value pairs from req.body
    //var res_obj=new Object;
    debug("post /api");
    for (var name in req.body)
    {
        debug("\t"+name+":"+req.body[name]);
        res_obj[name]=req.body[name];
    }
    //res_obj[name]=req.body[name];
    res.send( "You have create new record.");
});

router.get('/api', function(req, res){
    res.send(res_obj);
});

router.get("/:name", function(req,res) {
    var res_obj=new Object;
    res_obj.name=req.params.name;
    res.render( "movingblock" , {"name":req.params.name} );
});

//For the same user, if the message data already exist, the newest message will replace the old one.
router.post('/api/4.1', (req, res, next) => {
  // Grab data from http request
  const data = {name: req.body.name, message: req.body.message};
  // Get a Postgres client from the connection pool
  pg.connect(config, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    // SQL Query > Insert Data
    const query = client.query('INSERT INTO table3 (name, message) VALUES ($1, $2) ON CONFLICT (name) DO UPDATE SET message = excluded.message,time = excluded.time;',
    [data.name, data.message]);

    // Close connection and return results
    query.on('end', () => {
      done();
        data["success"]=true;
      return res.json(data);
    });
  });
});

//get all name and message
router.get('/api/4.1', (req, res, next) => {
  var results = [];
  // Get a Postgres client from the connection pool
  pg.connect(config, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    // SQL Query > Select Data
    const query = client.query('SELECT * FROM table3 ORDER BY time ASC');
    // Stream results back one row at a time
    query.on('row', (row) => {
      results.push(row);
    });
    // After all data is returned, close connection and return results
    query.on('end', () => {
      done();
        if (Object.keys(results).length == 0)
            {
                return res.json({success: false});
            }
        else {return res.json(results);}
    });
  });
});

//get single name and message
router.get('/api/4.1/:name', (req, res, next) => {
  var result = [];
  // Get a Postgres client from the connection pool
  pg.connect(config, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
        //return res.json({success: false, data: err});
    }
    // SQL Query > Select Data
    const query = client.query('SELECT * FROM table3 Where name = ($1);',[req.params.name]);
    // Stream results back one row at a time
    query.on('row', (row) => {
      //results.push(row);
        result = row;
        result["success"]=true;
        return res.json(result);
        console.log("row");
    });
    // After all data is returned, close connection and return results
    query.on('end', () => {
      done();
        if (Object.keys(result).length == 0)
            return res.json({success: false});
        console.log(result);
    });
  });
});

router.delete('/api/4.1/:name', (req, res, next) => {
  const results = [];
  // Grab data from the URL parameters
  const name = req.params.name;
  // Get a Postgres client from the connection pool
  pg.connect(config, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    // SQL Query > Delete Data
    var query = client.query('DELETE FROM table3 WHERE name=($1)', [name]);

    query.on('end', () => {
      done();
      return res.json({success:true,message:"You have deleted the record."});
    });
  });
});

module.exports = router;


