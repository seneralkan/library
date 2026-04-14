import request from 'supertest';
import {
  getApp,
  createUser,
  createBook,
  borrowBook,
  returnBook,
  truncateAllTables,
  setupTestApp,
  teardownTestApp,
} from './setup';

describe('Borrowed Book Business Logic Integration', () => {
  beforeAll(async () => {
    await setupTestApp();
  });

  beforeEach(async () => {
    await truncateAllTables();
  });

  afterAll(async () => {
    await teardownTestApp();
  });

  it('should calculate average score from multiple users', async () => {
    const user1 = await createUser('User 1');
    const user2 = await createUser('User 2');
    const book = await createBook('The Hobbit');

    await borrowBook(user1.id, book.id);
    await returnBook(user1.id, book.id, 6);

    await borrowBook(user2.id, book.id);
    await returnBook(user2.id, book.id, 10);

    const bookRes = await request(getApp().getHttpServer())
      .get(`/books/${book.id}`)
      .expect(200);

    // Average: (6 + 10) / 2 = 8.00
    expect(bookRes.body.score).toBe(8);
  });

  it('should allow borrowing the same book again after returning it', async () => {
    const user = await createUser('Alice');
    const book = await createBook('Dune');

    await borrowBook(user.id, book.id);
    await returnBook(user.id, book.id, 7);

    await request(getApp().getHttpServer())
      .post(`/users/${user.id}/borrow/${book.id}`)
      .expect(204);

    const userRes = await request(getApp().getHttpServer())
      .get(`/users/${user.id}`)
      .expect(200);

    expect(userRes.body.books.past).toEqual([{ name: 'Dune', userScore: 7 }]);
    expect(userRes.body.books.present).toEqual([{ name: 'Dune' }]);
  });

  it('should not allow the same user to borrow a book they already have', async () => {
    const user = await createUser('Alice');
    const book = await createBook('Dune');

    await borrowBook(user.id, book.id);

    await request(getApp().getHttpServer())
      .post(`/users/${user.id}/borrow/${book.id}`)
      .expect(400);
  });

  it('should update average score correctly after multiple borrow-return cycles', async () => {
    const user1 = await createUser('User 1');
    const user2 = await createUser('User 2');
    const user3 = await createUser('User 3');
    const book = await createBook('Test Book');

    // User1 rates 3
    await borrowBook(user1.id, book.id);
    await returnBook(user1.id, book.id, 3);

    let bookRes = await request(getApp().getHttpServer())
      .get(`/books/${book.id}`)
      .expect(200);
    expect(bookRes.body.score).toBe(3);

    // User2 rates 9
    await borrowBook(user2.id, book.id);
    await returnBook(user2.id, book.id, 9);

    bookRes = await request(getApp().getHttpServer())
      .get(`/books/${book.id}`)
      .expect(200);
    expect(bookRes.body.score).toBe(6); // (3+9)/2 = 6

    // User3 rates 7
    await borrowBook(user3.id, book.id);
    await returnBook(user3.id, book.id, 7);

    bookRes = await request(getApp().getHttpServer())
      .get(`/books/${book.id}`)
      .expect(200);
    expect(bookRes.body.score).toBe(6.33); // (3+9+7)/3 = 6.333... → 6.33
  });

  it('should handle user with mixed past and present books correctly', async () => {
    const user = await createUser('Alice');
    const book1 = await createBook('Book A');
    const book2 = await createBook('Book B');
    const book3 = await createBook('Book C');

    await borrowBook(user.id, book1.id);
    await returnBook(user.id, book1.id, 8);

    await borrowBook(user.id, book2.id);
    await returnBook(user.id, book2.id, 6);

    await borrowBook(user.id, book3.id);

    const userRes = await request(getApp().getHttpServer())
      .get(`/users/${user.id}`)
      .expect(200);

    expect(userRes.body.books.past).toHaveLength(2);
    expect(userRes.body.books.past).toEqual(
      expect.arrayContaining([
        { name: 'Book A', userScore: 8 },
        { name: 'Book B', userScore: 6 },
      ]),
    );
    expect(userRes.body.books.present).toEqual([{ name: 'Book C' }]);
  });

  it('should return score with boundary values (min=1, max=10)', async () => {
    const user1 = await createUser('User 1');
    const user2 = await createUser('User 2');
    const book = await createBook('Edge Case Book');

    await borrowBook(user1.id, book.id);
    await returnBook(user1.id, book.id, 1);

    let bookRes = await request(getApp().getHttpServer())
      .get(`/books/${book.id}`)
      .expect(200);
    expect(bookRes.body.score).toBe(1);

    await borrowBook(user2.id, book.id);
    await returnBook(user2.id, book.id, 10);

    bookRes = await request(getApp().getHttpServer())
      .get(`/books/${book.id}`)
      .expect(200);
    expect(bookRes.body.score).toBe(5.5); // (1+10)/2 = 5.5
  });

  it('should isolate book scores - one book rating should not affect another', async () => {
    const user = await createUser('Alice');
    const book1 = await createBook('Book X');
    const book2 = await createBook('Book Y');

    await borrowBook(user.id, book1.id);
    await returnBook(user.id, book1.id, 2);

    await borrowBook(user.id, book2.id);
    await returnBook(user.id, book2.id, 10);

    const book1Res = await request(getApp().getHttpServer())
      .get(`/books/${book1.id}`)
      .expect(200);
    const book2Res = await request(getApp().getHttpServer())
      .get(`/books/${book2.id}`)
      .expect(200);

    expect(book1Res.body.score).toBe(2);
    expect(book2Res.body.score).toBe(10);
  });
});
