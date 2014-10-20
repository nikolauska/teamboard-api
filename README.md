# Teamboard API

`teamboard-api` is the API Teamboard uses.

## Dependencies

The API depends on having [MongoDB](http://mongodb.org) and
[Redis](http://redis.io) up and running.

## Installation
```
npm install N4SJAMK/teamboard-api
```

### Setup

Set `NODE_ENV` to `development` for local development, assuming you have
development dependencies installed locally. If you are running in `production`
environment, you must specify the required environmental variables. There is
also a `test` environment that is used for test runs.

- `MONGODB_URL` is actually the connection string passed to `mongoose`, for
  example: `mongodb://localhost:27017/teamboard-dev`.
- `REDIS_HOST` and `REDIS_PORT` corresponding to your running `redis-server`.
- `TOKEN_SECRET` is the secret used with `jsonwebtoken`.

You can also specify the `PORT` variable to change the default port of `9002`.

### Running

Once you've set the required variables, run:
```
npm start
```

## Testing
```
npm test
```

## API Methods

All the API methods except `/auth/login` and `/auth/register` expect that the
`Authorization` header is set to `Bearer access-token` where `access-token` is
the `x-access-token` received from providing correct credentials. Failure to
provide a proper `access-token` will be met with a swift 401.

### Auth

**GET /auth**
```
returns:
{
  "id":       "id"
  "type":     "user  | guest",
  "username": "email | username",
}
```
Returns the `user` object tied to `access-token` passed in `Authorization`
header. If the user's `type` is `guest`, `access` field will also be present in
the response containing the `id` of the `board` the token is tied to.


**POST /auth/login**
```
payload:
{
  "email":    "email",
  "password": "password"
}
```
```
returns:
{
  "id":       "id",
  "type":     "user",
  "username": "email"
}
```
Exchanges the given credentials for an `access-token`. The `access-token` is
returned in the `x-access-token` header. The `type` of the token received from
this method is always `user`.


**POST /auth/register**
```
payload:
{
  "email":    "email",
  "password": "password"
}
```
```
returns:
{
  "id":    "id",
  "email": "email"
}
```
Creates a new user.


**POST /auth/logout**

Removes the given token from the matching user, essentially logging the user
out.


### Board

**GET /boards**
```
returns:
[
  {
    "id": "id",

    "name":        "name",
    "description": "description",

    "createdBy":  "user.id",
    "accessCode": "",

    "background": "none",
    "size": {
      "width":  8,
      "height": 8
    }
  }
]
```
Returns an array of `boards` that are created by the `user` identified by the
given `access-token`.

**GET /boards/:id**

Returns the `board` object specified by `:id`. See above for the description of
the `board` object.

**POST /boards**
```
payload:
{
  "name": "name"
}
```
Creates a new board with the given `name`. See above for a list of properties
that a `board` can have. Returns the created `board` object, see above for the
description of the `board` object.

**PUT /boards/:id**
```
payload:
{
  "description": "new description"
}
```
Updates the board specified by `:id`. See above for possibilities. Returns the
updated `board` object. See above for the description of the `board` object.

**DELETE /boards/:id**

Removes the board specified by `:id`. Returns the removed `board` object. See
above for the description of the `board` object.


### Tickets

**GET /boards/:id/tickets**
```
returns:
[
  {
    "id":      "id",
    "heading": "heading",
    "content": "content",
    "color":   "#BABABA",
    "position": {
      "x": 0, "y": 0, "z": 0
    }
  }
]
```
Returns an array of `ticket` objects that belong to the `board` specified by
`:id`.

**POST /boards/:id/tickets**
```
payload:
{
  "heading": "heading"
}
```
Creates a new `ticket`. Returns the created `ticket` object. See above for the
description of `ticket` object.

**PUT /boards/:id/tickets/:id**
```
payload:
{
  "content": "new-content"
}
```
Updates a ticket specified by `:id`. Returns the updated `ticket` object. See
above for the description of the `ticket` object.

**DELETE /boards/:id/tickets/:id**

Removes the ticket specified by `:id`. Returns the removed `ticket` object. See
above for the description of the `ticket` object.

### Guest Access

Guest access can be granted to a board by generating an `access-code` for it.
By using this `access-code` anonymous users can request an `access-token` that
is tied to a specific board and to the specific `access-code`.

**POST /boards/:id/access**
```
returns:
{
  "accessCode": "123ABCDE"
}
```
Generates an `access-code` for the board specified by `:id`. Successive calls
to this method will always generate a new `access-code`, thus invalidating any
`access-tokens` that were tied to the previous `access-code`.

**DELETE /boards/:id/access**

Removes the `access-code` of the board specified by `:id`, invalidating any
`access-tokens` tied to it.

**POST /boards/:id/access/:code**
```
payload:
{
  "username": "username"
}
```
```
returns:
{
  "id":       "id",
  "type":     "guest",
  "access":   "board.id",
  "username": "username"
}
```
Requests an `access-token` for the `board` specified by `:id` and authorized by
`:code`. The access token can be found in `x-access-token` after a succesful
request. The method also returns the payload encoded in the `access-token`.
