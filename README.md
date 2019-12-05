### 🕹️ SAML

SAML (Security Assertion Markup Language): service provider (SP) client in Javascript and identity provider (IDP) through Simple SAML PHP

#### Setup

<details>
<summary>Simple SAML PHP (IDP)</summary>

Create the IDP through Docker:

```sh
docker run
        --name=saml_idp
        -p 8080:8080
        -p 8443:8443
        -e SIMPLESAMLPHP_SP_ENTITY_ID=saml_entity_id
        -e SIMPLESAMLPHP_SP_ASSERTION_CONSUMER_SERVICE=http://localhost:4300/login/callback
        --network host
        -d
        kristophjunge/test-saml-idp
```

- --name define the container name

- -p maps the container' ports to local ports

- -e set arguments to container

- --network define the container' network to local network (bridge)

- -d run the container in detach mode

> The argument entity id indentifies the SP and the assertion consumer service redirects the user after the assertion (authentication) to the specified URL, both these arguments need to be set in the Javascript client the same way they were defined in the Simple SAML PHP container

</details>

<details>
<summary>OpenSSL certificates</summary>

Before send a request to the IDP its necessary to generate a encrypt and a decrypt certificate, i.e private key and public key.

To generate the keys, use the OpenSSL tool:

```sh
openssl req -x509 -newkey rsa:4096 -keyout ./certs/key.pem -out ./certs/cert.pem -nodes -days 365
```

The keys were generated in the _certs_ folder.

</details>

<details>
<summary>IDP certificate</summary>

To get the IDP certificate access [localhost:8080/simplesaml/saml2/idp/metadata.php](http://localhost:8080/simplesaml/saml2/idp/metadata.php) and copy the **X509Certificate** value and paste in a _.pem_ file.

</details>

#### Run

<details>
<summary>Server start</summary>

```sh
node index.js
```

</details>

<details>
<summary>Login</summary>

Acess the [localhost:4300/login](http://localhost:4300/login), you'll be redirected to the IDP, authenticate using the username **user1** and password **user1pass**, or change '1' by '2'. The IDP will check the information and if everything goes well the redirect happens to the SP happens ([localhost:4300/](http://localhost:4300/)), otherwise an error is issued in the IDP and the SP never knows about the error. You can see in the console the assertion, after the IDP sent back to the SP and the SP serialize it.

</details>
