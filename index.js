const express = require("express");

const session = require("express-session");

const bodyParser = require("body-parser");

const cookieParser = require("cookie-parser");

const passport = require("passport");

const saml = require("passport-saml");

const fs = require("fs");

// Express application
const app = express();

// Handle the user authentication storage
app.use(cookieParser());

// Handle X-WWW Form URL Enconded and JSON requests
app.use(bodyParser.urlencoded({ extended: false }));

// Secret to sign a Session ID (from SAML, that references
// the server-side session), re-save determines whether to
// save the session value back into the session and save
// unitialized always save the session after it was created
app.use(session({ secret: "secret", resave: false, saveUninitialized: true }));

// Passport serialize and deserialize
passport.serializeUser((user, done) => {
  console.log(`Serialize user ${user}`);

  done(null, user);
});

passport.deserializeUser((user, done) => {
  console.log(`Deserialize user ${user}`);

  done(null, user);
});

// SAML strategy to Passport know how to process the login
const samlStrategy = new saml.Strategy(
  {
    // Post back user after authenticated
    callbackUrl: "http://localhost/login/callback",
    // Send requests in order to authenticate
    entryPoint: "http://localhost:8080/simplesaml/saml2/idp/SSOService.php",
    // Global identifier, aka SP (Service Provider, i.e, the application)
    issuer: "saml_entity_id",
    // Specify the format that is requested from the IDP
    identifierFormat: null,
    // Keys used to encrypt the authentication request before we send it
    // to the IDP
    decryptionPvk: fs.readFileSync(__dirname + "/certs/key.pem", "utf8"),
    privateCert: fs.readFileSync(__dirname + "/certs/key.pem", "utf8"),
    // Determine if the incoming responses from SAML need to be validate
    validateInResponseTo: false,
    // Helpful for when the data is in the AD (Active Directory)
    disableRequestedAuthnContext: true
  },
  (profile, done) => {
    // Load the user, but the permissions in the data base
    // could be checked
    return done(null, profile);
  }
);

// Passaport SAML configuration
passport.use("samlStrategy", samlStrategy);

app.use(passport.initialize({}));

app.use(passport.session({}));

// Routes
app.get("/", (req, res) => {
  res.send("SAML (Security Assertion Markup Language) IDP (Identity Provider)");
});

app.get(
  "/login",
  (req, res, next) => {
    console.log("Start login");

    // Call the next handle function, i.e, the SAML Strategy,
    // which redirects to the IDP login handle, that returns
    // the result to the callback URL set in the SAML strategy
    next();
  },
  passport.authenticate("samlStrategy")
);

app.post(
  "/login/callback",
  (req, res, next) => {
    // Helpful to debug if the login is not a success, because
    // the IDP will not inform the SP
    console.log("Start login callback");

    next();
  },
  // Serialize the user. Login 'user1' and password 'user1pass'
  passport.authenticate("samlStrategy"),
  (req, res) => {
    console.log("Callback");

    console.log(req.user);

    res.send("Login success");
  }
);

app.get("/metadata", (req, res) => {
  res.type("application/xml");
  res
    .status(200)
    .send(
      // Expose the SP public key to other IDP get information
      samlStrategy.generateServiceProviderMetadata(
        fs.readFileSync(__dirname + "/certs/cert.pem", "utf8"),
        fs.readFileSync(__dirname + "/certs/cert.pem", "utf8")
      )
    );
});

// Start server
const server = app.listen(4300, () => {
  console.log(`Listening on port ${server.address().port}`);
});
