-- MYSQL_USER is created by the MySQL image with access to MYSQL_DATABASE.
-- The API also needs access to the company database on the same server.
GRANT ALL PRIVILEGES ON internconnect_company.* TO 'internconnect'@'%';
