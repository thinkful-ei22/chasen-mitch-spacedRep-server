## DATA STRUCTURES LEARNING TOOL 

This application helps to solve the problem of learning new terminology by using a spaced-repetition algorithm learning technique that incorporates increasing intervals of time between subsequent review of previously learned material in order to exploit the psychological spacing effect. The application allows individual users to create their own account and tracks their progress through the content. Also included is a reset button to allow the user to start back at the beginning of the content at any time and reset their progress.

## Deployed Version & Repos

Deployed Version:
**https://chasen-mitch-spacedrep-client.herokuapp.com**

Client-side repo:
**https://github.com/thinkful-ei22/chasen-mitch-spacedRep-client**

Server-side repo:
**https://github.com/thinkful-ei22/chasen-mitch-spacedRep-server**

## Tech Stack

#### Front-end technologies
* ReactJs, Redux, CSS
#### Server technologies​
* NodeJs, JWT auth, Express
#### Data Persistence
* Mongo/Mongoose
#### Hosting/SaaS
* Heroku (client & api)
#### ​Development Environment
* Managed through Trello
* Sublime3, VS Code
* Postman
#### Data Persistence
* MongoDB
#### Hosting
* Heroku (client & api)

## Additional Features Coming Soon

* Detailed progress summary
* Leaderboard with top scoring users
* Loyalty rewards for high Sscores 
## Routes

#### POST /api/users/

*This route to create a user*

Params:
* firstName: string
* username: string
* password: string
* email: string

**Request**
```
{
  "firstName": string,
  "username": string,
  "password": string,
  "email": string
}
```

**Response**

201 on success, 422 on error

#### POST /api/auth/login

*This route is for logging in and retrieving auth token.*

#### POST /api/auth/refresh

*This route is for refreshing auth token.* 

#### GET /api/questions/

*This route gets question at the head of the list.*

Params:
* user.id: string

**Request**
```
{
  "user.id": string
}
```

**Response**
```
{
    "question": "_________ is a method of solving problems that involves a function calling itself.",
    "answer": "recursion",
    "explanation": "In each call, it breaks down the problem into smaller and smaller subproblems until you get to a small enough problem that it can be solved trivially. You can think of it as the process of defining a problem (or the solution to a problem) in terms of (a simpler version of) itself. It may be applied to several data structures and algorithms to solve problems, but by itself is not a data structure or an algorithm, it is a concept.",
    "id": "5b9bc7d05779c62defd5b78f"
}
```

#### GET /api/questions/all

*This route is to retrieve all questions in the list.*

Params:
* user.id: string

**Request**
```
{
  "user.id": string
}
```

**Response**
```
[
  {
    "question": "_________ is a method of solving problems that involves a function calling itself.",
    "answer": "recursion",
    "explanation": "In each call, it breaks down the problem into smaller and smaller subproblems until you get to a small enough problem that it can be solved trivially. You can think of it as the process of defining a problem (or the solution to a problem) in terms of (a simpler version of) itself. It may be applied to several data structures and algorithms to solve problems, but by itself is not a data structure or an algorithm, it is a concept.",
    "id": "5b9bc7d05779c62defd5b78f"
  }
]
```

#### POST /api/questions/

*This route is to post answers to questions.*

Params:
* user.id: string
* guess: string

**Request**
```
{
  "user.id": string,
  "guess": string
}
```


**Response**

Returns 200 on success, returns feedback based on correct/incorrect answer

#### POST /api/questions/reset

*This route resets the answers for the entire set for the logged in user.*

Params:
* user.id: string

**Request**
```
{
  "user.id": string
}
```


**Response**

Returns 200 on success