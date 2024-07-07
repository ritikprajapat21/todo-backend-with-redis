# Todo Backend

This is a todo backend application made using express.js that uses Redis as database.

# Library Used

- express
- redis
- bcrypt
- dotenv
- jsonwebtoken
- @sendgrid/mail

# Local Setup

Clone this repo

```
git clone https://github.com/ritikprajapat21/todo-backend-with-redis.git
```

```
cd todo-backend-with-redis
```

Install the dependencies

```
npm install
```

Setup the enviroment variables

**NOTE:** I have used sendgrid's module to send email, so make account on [sendgrid](https://app.sendgrid.com/) and enter the variables value in env or change the code in sendMail function in authRouter.js according to your email sender service.

```
cp .env.example .env
```

**NOTE:** Before running application make sure Redis is running, I have used docker image of redis-stack.
To run redis-stack(For linux):
```
sudo docker compose up
```

Run the application

```
npm start
```

## Demo Screenshots
In this we have a todo named "Important task" with a deadline in few minutes:
![image](https://github.com/ritikprajapat21/todo-backend-with-redis/assets/112960100/fe9e8a2f-0d13-47c7-a090-732e4e50759a)
This is the mail that you will recieve when the todo is about to expire:
![image](https://github.com/ritikprajapat21/todo-backend-with-redis/assets/112960100/617dfc1d-c027-4ba0-95ef-8782a40654cf)
