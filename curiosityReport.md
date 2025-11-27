### JWT: JSON Web Token

## Overview
I chose to investigate JWT's because of an interview I had this semester. The interviewer had seen my Github and saw the work on JWT pizza, and so he asked a question focused on JWT's. I explained that I didn't know much about JWT's and that this project was part of a DevOps class. But I decided that understanding JWT's would be useful for future interviews.

## What Are JWT's
A JWT is a JSON Web Token that transmits data between two parties. Becuase JWT's are signed, the information transmitted can be verified as authentic and not modified. This makes them useful for stateless authentication, one of their most common use cases.

## What Goes into a JWT
A JWT has 3 parts:
- Header
- Payload
- Signature

# Header
The header usually contains two parts, the type (which should be "JWT") and the algorithm used to sign the token.
Here is an example header:
```json
    {
        "type": "JWT",
        "alg": "RSA"
    }
```

# Payload
The payload contains claims, usually about the user. There are registered claims, public claims, and private claims.
Registered claims are predefined claims that, while not mandatory, are recommended. Public claims are defined by those using JWT, but are defined publicly to avoid collisions. Private claims are custom claims that share agreed upon information between parties.

Example:
```json
    {
        "exp": 579201960,
        "name": "Joshua Swartz"
    }
```
# Signature
The signature is created by using the signing algorithm to encrypt a combination of the encoded header, encoded payload, and a secret. Because the signature is an encrypt/hash the header and payload, it can be used to verify that neither the header nor the payload had been modified.

# Final JWT Token
The token is a single string containing the base64encoded header, payload, and signature separated by a "."
```javascript
    const jwt = `${header}.${payload}.${signature}`
```

## Use Case
JWT Tokens are often used for stateless authentication. They can contain information necessary to know who the user is sending the token, and because of the signature, it can be verified that the information came from the server initially. In our case, the JWT Token verifies that the JWT Pizza originated from the Pizza Factory and contains the correct information.

## Comparison
I have used SAML services for authentication before. From what I have read, SAML uses XML to encode the data. JSON is much more compact, however, allowing the JWT Token to be smaller by comparison. This makes it ideal for simple, lightweight authentication.
