OAuth2 authorization server
==========================

> Example of an OAuth2 authorization server using Express, oauth2orize, passport and Postgres for backend and React for the UI

This repo is an example of an OAuth2 authorization server. When a client
application supports login with this authorization server, the user will be
redirected to a URL similar to this:

`http://localhost:3000/oauth?clientID=12345678&redirectURI=https://auth0.com&response_type=code&scope=openid
profile email&state=poicdcwefcd`

The user will need to login to the authorization server and grant permission,
so that he/she is redirected to the client application with an authorization
code. At this point, the client application will establish a second channel
with the authorization server to exchange the code with an acess token. Using
the access token, the client application can make a request to /userinfo and
get information about the user according to the scope that was set when
requesting an authorization grant.

If the user is already logged in the login page will be skipped. 
If the user has already grant permission, the consent page will also be
skipped.

The authorization server also supports login with Google and GitHub. For that,
the authorzation server should be registered as a client application to
[Google](https://developers.google.com/identity/protocols/OAuth2)
/[GitHub](https://github.com/settings/applications/new)
and the corresponding `client_id` and `client_secret` should be
added as environment variables.

## How to run

- `npm install`
- `docker_db`: A postgres database will be created in a docker container
- `node testing_data`: A new client application will be registered
- `npm start`: Start backend server
- `npm run devserver`: Start frontend server

## Back channel Communication
- `./backchannel code <value> `: Exchange auth code <value> with access token
- `./backchannel refresh_token <value>`: Exchange refresh token <value>  with access token
- `./backchannel userinfo <value>`: Get user information. <value> is a valid access token
    
## Technologies
- Backend
    - express server
    - passport for the authentication
    - oauth2orize for the OAuth2
    - postgres database
    - sequelize for ORM
- Frontend
    - React for the UI
    - axios for the HTTP client
