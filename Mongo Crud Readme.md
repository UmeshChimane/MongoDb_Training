# MongoDB CRUD Assignment

## Overview

This assignment demonstrates MongoDB database and collection creation, document insertion, querying, updating, aggregation, and indexing using MongoDB Atlas and `mongosh`.

### Database

```text
library
```

### Collection

```text
books
```

---

# 1. Create Database and Collection

## Select the `library` database

```javascript
use library
```

### Output

```text
switched to db library
```

The `use` command switches the current database to `library`.

If the database does not already exist, MongoDB creates it when data is first stored.

---

## Create the `books` collection

```javascript
db.createCollection("books")
```

### Output

```text
{ ok: 1 }
```

The `createCollection()` command creates a collection named `books` inside the `library` database.

---

## Verify the collection

```javascript
show collections
```

### Output

```text
books
```

This confirms that the `books` collection was successfully created.

---

# 2. Insert 20 Books

The assignment requires 20 book documents containing:

* `title`
* `author`
* `genre`
* `publishedYear`
* `pages`
* `rating`

The `insertMany()` command is used because multiple documents need to be inserted at once.

```javascript
db.books.insertMany([
  {
    title: "The Silent Patient",
    author: "Alex Michaelides",
    genre: "Thriller",
    publishedYear: 2019,
    pages: 336,
    rating: 4.5
  },
  {
    title: "Atomic Habits",
    author: "James Clear",
    genre: "Self-Help",
    publishedYear: 2018,
    pages: 320,
    rating: 4.8
  },
  {
    title: "The Alchemist",
    author: "Paulo Coelho",
    genre: "Fiction",
    publishedYear: 1988,
    pages: 208,
    rating: 4.6
  },
  {
    title: "Sapiens",
    author: "Yuval Noah Harari",
    genre: "History",
    publishedYear: 2011,
    pages: 443,
    rating: 4.7
  },
  {
    title: "1984",
    author: "George Orwell",
    genre: "Dystopian",
    publishedYear: 1949,
    pages: 328,
    rating: 4.6
  },
  {
    title: "The Psychology of Money",
    author: "Morgan Housel",
    genre: "Finance",
    publishedYear: 2020,
    pages: 256,
    rating: 4.7
  },
  {
    title: "Rich Dad Poor Dad",
    author: "Robert Kiyosaki",
    genre: "Finance",
    publishedYear: 1997,
    pages: 336,
    rating: 4.3
  },
  {
    title: "Deep Work",
    author: "Cal Newport",
    genre: "Self-Help",
    publishedYear: 2016,
    pages: 304,
    rating: 4.5
  },
  {
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    genre: "Fantasy",
    publishedYear: 1937,
    pages: 310,
    rating: 4.7
  },
  {
    title: "Educated",
    author: "Tara Westover",
    genre: "Memoir",
    publishedYear: 2018,
    pages: 334,
    rating: 4.6
  },
  {
    title: "Becoming",
    author: "Michelle Obama",
    genre: "Memoir",
    publishedYear: 2018,
    pages: 448,
    rating: 4.8
  },
  {
    title: "The Martian",
    author: "Andy Weir",
    genre: "Science Fiction",
    publishedYear: 2011,
    pages: 369,
    rating: 4.5
  },
  {
    title: "Dune",
    author: "Frank Herbert",
    genre: "Science Fiction",
    publishedYear: 1965,
    pages: 412,
    rating: 4.7
  },
  {
    title: "The Midnight Library",
    author: "Matt Haig",
    genre: "Fiction",
    publishedYear: 2020,
    pages: 304,
    rating: 4.4
  },
  {
    title: "Ikigai",
    author: "Hector Garcia",
    genre: "Self-Help",
    publishedYear: 2016,
    pages: 208,
    rating: 4.2
  },
  {
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    genre: "Psychology",
    publishedYear: 2011,
    pages: 499,
    rating: 4.4
  },
  {
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    genre: "Classic",
    publishedYear: 1925,
    pages: 180,
    rating: 4.3
  },
  {
    title: "Project Hail Mary",
    author: "Andy Weir",
    genre: "Science Fiction",
    publishedYear: 2021,
    pages: 496,
    rating: 4.8
  },
  {
    title: "The Book Thief",
    author: "Markus Zusak",
    genre: "Historical Fiction",
    publishedYear: 2005,
    pages: 552,
    rating: 4.6
  },
  {
    title: "The Four Agreements",
    author: "Don Miguel Ruiz",
    genre: "Self-Help",
    publishedYear: 1997,
    pages: 160,
    rating: 4.5
  }
])
```

To verify the number of documents:

```javascript
db.books.countDocuments()
```

Expected result:

```text
20
```

---

# 3. Find Books Published After 2010

The assignment requires finding books published after 2010, sorting them by rating in descending order, and returning the top 5.

```javascript
db.books
  .find({ publishedYear: { $gt: 2010 } })
  .sort({ rating: -1 })
  .limit(5)
```

### Commands used

* `$gt` → greater than
* `sort({ rating: -1 })` → highest rating first
* `limit(5)` → return only 5 documents

Therefore, the query:

1. Finds books where `publishedYear > 2010`
2. Sorts them from highest rating to lowest rating
3. Returns only the first 5 books

---

# 4. Mark Highly Rated Books as Featured

The assignment requires adding:

```javascript
featured: true
```

to every book whose rating is greater than `4.5`.

```javascript
db.books.updateMany(
  { rating: { $gt: 4.5 } },
  { $set: { featured: true } }
)
```

### Explanation

`updateMany()` updates all documents matching the condition.

```javascript
{ rating: { $gt: 4.5 } }
```

selects books with ratings greater than `4.5`.

```javascript
{ $set: { featured: true } }
```

adds the `featured` field or changes its value to `true`.

A book with rating exactly `4.5` is not included because the condition is strictly greater than `4.5`.

---

# 5. Group Books by Genre

The assignment requires grouping the books by genre and calculating:

* Number of books in each genre
* Average rating for each genre

```javascript
db.books.aggregate([
  {
    $group: {
      _id: "$genre",
      count: { $sum: 1 },
      averageRating: { $avg: "$rating" }
    }
  }
])
```

### Explanation

`aggregate()` is used to process and analyze multiple documents.

### `$group`

```javascript
_id: "$genre"
```

groups books according to their `genre`.

### `$sum`

```javascript
count: { $sum: 1 }
```

counts the number of books in each genre.

### `$avg`

```javascript
averageRating: { $avg: "$rating" }
```

calculates the average rating for each genre.

---

# 6. Check Query Performance Before Creating an Index

The assignment requires comparing query performance before and after creating an index on `author`.

The query used before creating the index was:

```javascript
db.books.find({ author: "Andy Weir" }).explain("executionStats")
```

### Important output

```text
winningPlan:
  stage: 'COLLSCAN'
```

The execution statistics showed:

```text
nReturned: 2
totalKeysExamined: 0
totalDocsExamined: 20
executionTimeMillis: 0
```

### What this means

The query returned:

```text
2 documents
```

MongoDB examined:

```text
20 documents
```

because there was no index on `author` at that point.

`COLLSCAN` means **Collection Scan**.

MongoDB scanned the collection to find the matching documents.

---

# 7. Create an Index on `author`

The assignment requires creating an index on the `author` field.

```javascript
db.books.createIndex({ author: 1 })
```

### Explanation

This creates an ascending index on the `author` field.

```text
1 = ascending index
```

The purpose of the index is to allow MongoDB to locate documents based on `author` more efficiently, especially as the collection becomes larger.

---

# 8. Check Query Performance After Creating the Index

After creating the index, the same query was executed again:

```javascript
db.books.find({ author: "Andy Weir" }).explain("executionStats")
```

The purpose of running the query again is to compare the query execution plan before and after the index.

Before the index, the query used:

```text
COLLSCAN
```

After creating the index, the query can use an index scan:

```text
IXSCAN
```

`IXSCAN` means **Index Scan**.

> The collection contains only 20 documents, so the execution time may remain extremely small. The important comparison is the query execution plan and whether MongoDB uses the index.

---

# MongoDB Concepts Covered

This assignment covered the following MongoDB concepts:

* Database creation and selection
* Collections
* Documents
* Fields
* `insertMany()`
* `countDocuments()`
* `find()`
* `$gt`
* `sort()`
* `limit()`
* `updateMany()`
* `$set`
* Aggregation
* `$group`
* `$sum`
* `$avg`
* Indexes
* `createIndex()`
* `explain("executionStats")`
* `COLLSCAN`
* `IXSCAN`

---

# Final Result

The MongoDB CRUD assignment was completed using the `library` database and `books` collection.

The assignment demonstrated:

```text
Create
  ↓
Insert 20 Books
  ↓
Read / Query
  ↓
Update
  ↓
Aggregate
  ↓
Create Index
  ↓
Analyze Query Performance
```

## Tools Used

* MongoDB Atlas
* MongoDB `mongosh`
* MongoDB Compass

## Database Structure

```text
MongoDB Atlas
└── Cluster0
    └── library
        └── books
            └── 20 book documents
```

