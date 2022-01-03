/* eslint-env node */

const path = require("path"),
  express = require("express");

/**
 * AppServer
 *
 * Creates a simple web server by using express to static serve files from a given directory.
 *
 * @author: Alexander Bazo
 * @version: 1.0
 */

class AppServer {

  /**
   * Creates full path to given appDir and constructors express application with
   * static "/app" route to serve files from app directory.
   * 
   * @constructor
   * @param  {String} appDir Relative path to application dir (from parent)
   */
  constructor(appDir) {
    const cors = require("cors");
    this.appDir = path.join(__dirname, "../", appDir); 
    this.app = express();

    this.app.use(cors());

    this.app.use(function (req, res, next) {

      // Website you wish to allow to connect
      res.setHeader("Access-Control-Allow-Origin", "http://localhost:8000");
      res.setHeader("Access-Control-Allow-Origin", "*");
  
      // Request methods you wish to allow
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  
      // Request headers you wish to allow
      res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization');
  
      // Set to true if you need the website to include cookies in the requests sent
      // to the API (e.g. in case you use sessions)
      res.setHeader('Access-Control-Allow-Credentials', true);
  
      // Pass to next layer of middleware
      next();
  });

  this.app.use("", express.static(this.appDir));
  //this.app.use("/app", express.static(this.appDir));
}

  /**
   * Starts server on given port
   * 
   * @param  {Number} port Port to use for serving static files
   */
  start(port) {
    this.server = this.app.listen(port, function() {
      console.log(
        `AppServer started. Client available at http://localhost:${port}/app`
      );
    });
  }

  /**
   * Stops running express server
   */
  stop() {
    if (this.server === undefined) {
      return;
    }
    this.server.close();
  }

}

module.exports = AppServer;