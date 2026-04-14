import request from 'supertest';
import {
  getApp,
  createUser,
  createBook,
  borrowBook,
  truncateAllTables,
  setupTestApp,
  teardownTestApp,
} from './setup';

describe('Borrow Book Integration', () => {
  beforeAll(async () => {
    await setupTestApp();
  });

  beforeEach(async () => {
    await truncateAllTables();
  });

  afterAll(async () => {
    await teardownTestApp();
  });

  describe('POST /users/:userId/borrow/:bookId', () => {
    it('should borrow a book successfully and return 204', async () => {
      const user = await createUser('Alice');
      const book = await createBook('1984');

      await request(getApp().getHttpServer())
        .post(`/users/${user.id}/borrow/${book.id}`)
        .expect(204);

      const userRes = await request(getApp().getHttpServer())
        .get(`/users/${user.id}`)
        .expect(200);

      expect(userRes.body.books.present).toEqual([{ name: '1984' }]);
      expect(userRes.body.books.past).toEqual([]);
    });

    it('should return 400 when book is already borrowed', async () => {
      const user1 = await createUser('Alice');
      const user2 = await createUser('Bob');
      const book = await createBook('1984');

      await borrowBook(user1.id, book.id);

      await request(getApp().getHttpServer())
        .post(`/users/${user2.id}/borrow/${book.id}`)
        .expect(400);
    });

    it('should return 404 when user does not exist', async () => {
      const book = await createBook('1984');

      await request(getApp().getHttpServer())
        .post(`/users/9999/borrow/${book.id}`)
        .expect(404);
    });

    it('should return 404 when book does not exist', async () => {
      const user = await createUser('Alice');

      await request(getApp().getHttpServer())
        .post(`/users/${user.id}/borrow/9999`)
        .expect(404);
    });

    it('should allow borrowing multiple books by the same user', async () => {
      const user = await createUser('Alice');
      const book1 = await createBook('1984');
      const book2 = await createBook('Dune');

      await borrowBook(user.id, book1.id);
      await borrowBook(user.id, book2.id);

      const userRes = await request(getApp().getHttpServer())
        .get(`/users/${user.id}`)
        .expect(200);

      expect(userRes.body.books.present).toHaveLength(2);
    });
  });

  describe('POST /users/:userId/return/:bookId', () => {
    it('should return a book with score and return 204', async () => {
      const user = await createUser('Alice');
      const book = await createBook('Brave New World');

      await borrowBook(user.id, book.id);

      await request(getApp().getHttpServer())
        .post(`/users/${user.id}/return/${book.id}`)
        .send({ score: 9 })
        .expect(204);

      const userRes = await request(getApp().getHttpServer())
        .get(`/users/${user.id}`)
        .expect(200);

      expect(userRes.body.books.present).toEqual([]);
      expect(userRes.body.books.past).toEqual([
        { name: 'Brave New World', userScore: 9 },
      ]);

      const bookRes = await request(getApp().getHttpServer())
        .get(`/books/${book.id}`)
        .expect(200);

      expect(bookRes.body.score).toBe(9);
    });

    it('should return 404 when user has not borrowed that book', async () => {
      const user = await createUser('Alice');
      const book = await createBook('1984');

      await request(getApp().getHttpServer())
        .post(`/users/${user.id}/return/${book.id}`)
        .send({ score: 5 })
        .expect(404);
    });

    it('should return 404 when user does not exist', async () => {
      const book = await createBook('1984');

      await request(getApp().getHttpServer())
        .post(`/users/9999/return/${book.id}`)
        .send({ score: 5 })
        .expect(404);
    });

    it('should return 404 when book does not exist', async () => {
      const user = await createUser('Alice');

      await request(getApp().getHttpServer())
        .post(`/users/${user.id}/return/9999`)
        .send({ score: 5 })
        .expect(404);
    });

    it('should return 400 when score is missing', async () => {
      const user = await createUser('Alice');
      const book = await createBook('1984');

      await borrowBook(user.id, book.id);

      await request(getApp().getHttpServer())
        .post(`/users/${user.id}/return/${book.id}`)
        .send({})
        .expect(400);
    });

    it('should return 400 when score is below minimum (1)', async () => {
      const user = await createUser('Alice');
      const book = await createBook('1984');

      await borrowBook(user.id, book.id);

      await request(getApp().getHttpServer())
        .post(`/users/${user.id}/return/${book.id}`)
        .send({ score: 0 })
        .expect(400);
    });

    it('should return 400 when score is above maximum (10)', async () => {
      const user = await createUser('Alice');
      const book = await createBook('1984');

      await borrowBook(user.id, book.id);

      await request(getApp().getHttpServer())
        .post(`/users/${user.id}/return/${book.id}`)
        .send({ score: 11 })
        .expect(400);
    });

    it('should return 400 when score is not an integer', async () => {
      const user = await createUser('Alice');
      const book = await createBook('1984');

      await borrowBook(user.id, book.id);

      await request(getApp().getHttpServer())
        .post(`/users/${user.id}/return/${book.id}`)
        .send({ score: 7.5 })
        .expect(400);
    });

    it('should return 400 when score is a string', async () => {
      const user = await createUser('Alice');
      const book = await createBook('1984');

      await borrowBook(user.id, book.id);

      await request(getApp().getHttpServer())
        .post(`/users/${user.id}/return/${book.id}`)
        .send({ score: 'great' })
        .expect(400);
    });

    it('should return 400 when body has unknown properties', async () => {
      const user = await createUser('Alice');
      const book = await createBook('1984');

      await borrowBook(user.id, book.id);

      await request(getApp().getHttpServer())
        .post(`/users/${user.id}/return/${book.id}`)
        .send({ score: 5, comment: 'should not be here' })
        .expect(400);
    });
  });
});
