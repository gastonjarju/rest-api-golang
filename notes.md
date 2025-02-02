Preparing Statements vs Directly Executing Queries (Prepare() vs Exec()/Query())
In the previous lectures, we started sending SQL commands to the SQLite database.

And we did this by following different approaches:

DB.Exec() (when we created the tables)

Prepare() + stmt.Exec() (when we inserted data into the database)

DB.Query() (when we fetched data from the database)

Using Prepare() is 100% optional! You could send all your commands directly via Exec() or Query().

The difference between those two methods then just is whether you're fetching data from the database (=> use Query()) or your manipulating the database / data in the database (=> use Exec()).

But what's the advantage of using Prepare()?

Prepare() prepares a SQL statement - this can lead to better performance if the same statement is executed multiple times (potentially with different data for its placeholders).

This is only true, if the prepared statement is not closed (stmt.Close()) in between those executions. In that case, there wouldn't be any advantages.

And, indeed, in this application, we are calling stmt.Close() directly after calling stmt.Exec(). So here, it really wouldn't matter which approach you're using.

But in order to show you the different ways of using the sql package, I decided to also include this preparation approach in this course.