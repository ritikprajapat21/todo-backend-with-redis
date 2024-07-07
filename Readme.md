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

\***\*NOTE:\*\*** I have used sendgrid's module to send email, so make account on [sendgrid](https://app.sendgrid.com/) and enter the variables value in env or change the code in sendMail function in authRouter.js according to your email sender service.

```
cp .env.example .env
```

Run the application

```
npm start
```
