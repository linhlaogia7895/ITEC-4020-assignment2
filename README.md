# AP/ITEC4020 Assignment 2: Superheroes

In this assignment, you will be learning to use MongoDB and Mongoose while creating
REST API endpoints using Express. Please read the PDF instructions on
eClass to understand what is needed to complete the assignment.

- API Documentation: https://documenter.getpostman.com/view/2210306/2s83zjqN7d
- Original source of the data: https://www.superheroapi.com/

## Environment File

To connect to the MongoDB databse, you need to create an environment variables file
called `.env` in the root of the project. Then populate the `.env` file with your
MongoDB connection string:

```env
MONGO_CONN_URL=$YOUR_MONGODB_CONNECTION_STRING
```

Make sure to replace `$YOUR_MONGODB_CONNECTION_STRING` with your connection string.
If the connection string is correct, you will see the following message on your screen:

```output
Server is up:

      http://localhost:3000


[MONGODB] Connected!
```

## Commands

To install the dependencies:

```sh
npm install
```

To run the code:

```sh
npm run start
```

To run the code in development mode (using `nodemon`):

```sh
npm run dev
```

To prepare the submission:

```sh
npm run prepare-submission
```
