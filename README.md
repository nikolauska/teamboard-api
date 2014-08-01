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
environment, you must specify the required environmental variables.

- `MONGODB_HOST` is actually the connection string passed to `mongoose`, for
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

## API Docs

**TODO** Clean up this documentation!

The root path for the API is `/api/v1`, where `v1` stands for the version.

### Auth

```
GET /auth
```
Returns the user tied to given access-token.

```
POST /auth/login
{
  "email":    "testi",
  "password": "testi"
}
```
Exchanges the given credentials for an access-token. The access token is
returned in the `x-access-token` header.

```
POST /auth/register
{
  "email":    "testi",
  "password": "testi"
}
```
Creates a new user.

```
POST /auth/logout
```
Removes the given token from the matching user, essentially logging the user
out.


### User

```
GET /users
GET /users/:user_id
```
Returns either an array of users or a single user.


### Board

```
GET /boards
GET /boards/:board_id
```
Returns either an array of boards or a single board. When requesting a specific
board identified by the `board_id`, the `tickets` are also returned.

```
POST /boards
{
  "name": "testi",
  "info": "testi"
}
```
Creates a new board, the user making the request is set as the owner.

```
PUT /boards/:board_id
{
  "name": "testi",
  "info": "testi"
}
```
Updates the board `name` and `info` attributes. Also accepts partial updates.
Requires the user making the request to be the `owner` of the board.

```
DELETE /boards/:board_id
```
Deletes the requested board. Requires the user making the request to be the
`owner` of the board.


### Board Members

```
GET /boards/:board_id/users
```
Returns an object contaning the `owner` and `members` attributes. The `members`
field is an array of users.

```
GET /boards/:board_id/users/:user_id
```
Returns a single user from the board, can be either the owner or one of the
members.

```
POST /boards/:board_id/users
{
  "id": "UserIdAttribute"
}
```
Adds the given user to `members` on the board specified by `board_id`. Requires
the user making the request to be the `owner` of the specified board.

```
DELETE /boards/:board_id/users/:user_id
```
Removes the user specified by `user_id` from `members` on the board specified by
`board_id`. Requires the user making the request to be the `owner` of the
specified board.


### Tickets

```
GET /boards/:board_id/tickets
GET /boards/:board_id/tickets/:ticket_id
```
Returns either an array of tickets or a single ticket belonging to the board
specified by `board_id`.

```
POST /boards/:board_id/tickets
{
  "heading":  "cool heading",
  "content":  "super important stuff"
  "position": { "x": 0, "y": 0, "z": 0 }
}
```
Creates a new ticket on the board specified by `board_id`. Requires the user
making the request to be at least a member on the board.

```
DELETE /boards/:board_id/tickets/:ticket_id
```
Deletes the ticket specified by `ticket_id` from the board specified by
`board_id`. Requires the user making the request to be at least a member on the
board.

# hook test
