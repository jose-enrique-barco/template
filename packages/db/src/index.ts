// The db package is pure infrastructure: it owns the schema (schema.sql) and the
// shape of the database binding. It holds no query logic — each feature package
// owns the queries for its own domain (see @app/counter) and receives this env
// as its last argument, so functions stay easy to read and easy to test.

export interface DbEnv {
  DB: D1Database;
}
