const { Pool } = require("pg");

export const pool = new Pool({
    user: "postgres" || process.env.DB_USER,
    host: "122.160.11.246" || process.env.DB_HOST,
    database: "vide" || process.env.DB_NAME,
    password: "Bioinfo@1234" || process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    // connectionString: process.env.CONNECTION_STRING,
    ssl: false
})
pool.connect()
.then(()=>{
    console.log("Connected to the database");
})
.catch((err) => {
    console.error("Error connecting to the database", err);
});

