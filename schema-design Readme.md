# MongoDB Schema Design Exercise

## 1. Twitter Clone

### Collections

* `users`
* `tweets`
* `likes`
* `follows`
* `comments`

### Users

```js
{
  _id: ObjectId,
  username: "umesh",
  email: "umesh@example.com",
  name: "Umesh Chimane"
}
```

### Tweets

```js
{
  _id: ObjectId,
  userId: ObjectId,
  text: "Learning MongoDB",
  createdAt: Date
}
```

**Decision:** Reference the user using `userId`.

**Reason:** A user can create many tweets. Embedding the complete user information inside every tweet would duplicate data.

### Likes

```js
{
  _id: ObjectId,
  userId: ObjectId,
  tweetId: ObjectId,
  createdAt: Date
}
```

**Decision:** Reference both the user and tweet.

**Reason:** A tweet can have many likes and a user can like many tweets. This is a many-to-many relationship, so a separate collection is appropriate.

### Follows

```js
{
  _id: ObjectId,
  followerId: ObjectId,
  followingId: ObjectId,
  createdAt: Date
}
```

**Decision:** Use references.

**Reason:** Users can follow many users, and users can have many followers. Keeping follows separately avoids very large user documents.

### Comments

```js
{
  _id: ObjectId,
  tweetId: ObjectId,
  userId: ObjectId,
  text: "Nice post!",
  createdAt: Date
}
```

**Decision:** Reference the tweet and user.

**Reason:** A tweet can receive a large and continuously growing number of comments. Embedding all comments could make the tweet document unnecessarily large.

### Expected Queries

* Find a user's tweets.
* Find a tweet and its comments.
* Find all tweets liked by a user.
* Find followers/following of a user.
* Find tweets from users being followed.

---

# 2. E-commerce Application

### Collections

* `users`
* `products`
* `categories`
* `orders`
* `reviews`

### Users

```js
{
  _id: ObjectId,
  name: "Umesh",
  email: "umesh@example.com",
  address: {
    city: "Pune",
    state: "Maharashtra"
  }
}
```

**Decision:** Store basic user information in the `users` collection.

### Products

```js
{
  _id: ObjectId,
  name: "Laptop",
  price: 65000,
  categoryId: ObjectId,
  stock: 20,
  description: "Laptop description"
}
```

**Decision:** Reference the category using `categoryId`.

**Reason:** A category can contain many products, and categories may be updated independently.

### Categories

```js
{
  _id: ObjectId,
  name: "Electronics"
}
```

**Decision:** Keep categories in a separate collection.

**Reason:** Categories are shared by many products and may need to be searched or managed independently.

### Orders

```js
{
  _id: ObjectId,
  userId: ObjectId,
  items: [
    {
      productId: ObjectId,
      productName: "Laptop",
      quantity: 1,
      price: 65000
    }
  ],
  totalAmount: 65000,
  status: "placed",
  createdAt: Date
}
```

**Decision:** Reference the user but embed order items.

**Reason:** An order belongs to one user, so `userId` is a reference. Order items are embedded because they belong directly to that particular order.

The product name and price can also be stored in the order item as a snapshot. This is useful because the product price may change later, while the historical order should retain the original price.

### Reviews

```js
{
  _id: ObjectId,
  productId: ObjectId,
  userId: ObjectId,
  rating: 5,
  comment: "Very good product",
  createdAt: Date
}
```

**Decision:** Reference both product and user.

**Reason:** A product can have many reviews and a user can review many products. Reviews can also grow over time, so keeping them separate prevents product documents from becoming too large.

### Expected Queries

* Find products by category.
* Find a user's orders.
* Find products in an order.
* Find reviews for a product.
* Find reviews written by a user.
* Find products with available stock.

---

# 3. Blog Application

### Collections

* `users`
* `posts`
* `comments`
* `tags`

### Users

```js
{
  _id: ObjectId,
  name: "Umesh",
  email: "umesh@example.com"
}
```

### Posts

```js
{
  _id: ObjectId,
  authorId: ObjectId,
  title: "Learning MongoDB",
  content: "MongoDB is a document database...",
  tags: ["mongodb", "database"],
  createdAt: Date
}
```

**Decision:** Reference the author using `authorId`.

**Reason:** A user can create many posts. Keeping the author separately avoids duplicating user information in every post.

### Comments

```js
{
  _id: ObjectId,
  postId: ObjectId,
  userId: ObjectId,
  text: "Great article!",
  createdAt: Date
}
```

**Decision:** Reference the post and user.

**Reason:** A post can have many comments and the number of comments can grow significantly. A separate collection is therefore more suitable than embedding all comments inside the post.

### Tags

```js
{
  _id: ObjectId,
  name: "mongodb"
}
```

**Decision:** Tags can be represented separately when they need to be managed or searched independently. Posts can store tag references or tag names.

For example:

```js
{
  _id: ObjectId,
  authorId: ObjectId,
  title: "Learning MongoDB",
  content: "MongoDB is a document database...",
  tagIds: [
    ObjectId("...")
  ],
  createdAt: Date
}
```

**Reason:** A tag can be used by many posts, creating a many-to-many relationship.

### Expected Queries

* Find posts written by a user.
* Find a post and its comments.
* Find posts with a particular tag.
* Find comments written by a user.
* Find all posts for a particular topic/tag.

---

# Summary of Embed vs Reference Decisions

| Application | Embed                    | Reference                            |
| ----------- | ------------------------ | ------------------------------------ |
| Twitter     | Small tweet-related data | Users, likes, follows, comments      |
| E-commerce  | Order items              | Users, products, categories, reviews |
| Blog        | Small post-specific data | Users, comments, tags                |

## General Rule Used

### Embed when:

* The data belongs closely to the parent document.
* The data is usually accessed together with the parent.
* The embedded data has a limited size.
* The data does not need to exist independently.

### Reference when:

* The related data can grow significantly.
* The same data is shared by many documents.
* The relationship is many-to-many.
* The related data needs to be queried or updated independently.

## Conclusion

The schema designs use a combination of embedding and referencing based on expected access patterns and data growth.

Frequently accessed, small, and tightly related data is embedded, while shared, independently managed, or potentially large data is stored separately and referenced using `ObjectId`.
