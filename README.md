# Family Travel Tracker

This is a simple web application for tracking which countries your family members have visited. It uses Node.js, Express, and PostgreSQL.

## Deployment Instructions

To deploy this project, you need to have Node.js and PostgreSQL installed on your system.

### 1. Database Setup

1.  **Start PostgreSQL.** Make sure your PostgreSQL server is running.
2.  **Create a database.** You can use a tool like `psql` or a graphical interface like pgAdmin to create a new database. For example, using `psql`:
    ```sql
    CREATE DATABASE travel_tracker;
    ```
3.  **Create the tables.** Connect to your newly created database and run the SQL commands in the `queries.sql` file to create the `users` and `visited_countries` tables. You only need to run the `CREATE TABLE` statements at the end of the file.

    ```sql
    -- Connect to your database
    \c travel_tracker

    -- Run these commands
    CREATE TABLE users(
      id SERIAL PRIMARY KEY,
      name VARCHAR(15) UNIQUE NOT NULL,
      color VARCHAR(15)
    );

    CREATE TABLE visited_countries(
      id SERIAL PRIMARY KEY,
      country_code CHAR(2) NOT NULL,
      user_id INTEGER REFERENCES users(id)
    );
    ```

### 2. Application Setup

1.  **Install dependencies.** In the project directory, run the following command to install the necessary Node.js packages:
    ```bash
    npm install
    ```
2.  **Configure environment variables.** Create a new file named `.env` in the project root. Copy the contents of `.env.example` and replace the placeholder values with your actual database credentials:
    ```
    # .env
    DB_USER=your_postgres_user
    DB_HOST=localhost
    DB_NAME=travel_tracker
    DB_PASSWORD=your_postgres_password
    DB_PORT=5432
    ```
3.  **Run the application.** Start the server with the following command:
    ```bash
    node index.js
    ```
    The application should now be running on `http://localhost:3000`.