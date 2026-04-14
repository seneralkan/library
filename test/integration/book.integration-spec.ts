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

describe('Book Integration', () => {
  beforeAll(async () => {
    await setupTestApp();
  });

  beforeEach(async () => {
    await truncateAllTables();
  });

  afterAll(async () => {
    await teardownTestApp();
  });

  describe('GET /books', () => {
    it('should return empty array when no books exist', async () => {
      const res = await request(getApp().getHttpServer())
        .get('/books')
        .expect(200);

      expect(res.body).toEqual([]);
    });

    it('should return book list sorted by name with id and name only', async () => {
      await createBook('1984');
      await createBook('Brave New World');
      await createBook('Dune');
      await createBook('I, Robot');
      await createBook("The Hitchhiker's Guide to the Galaxy");

      const res = await request(getApp().getHttpServer())
        .get('/books')
        .expect(200);

      expect(res.body).toEqual([
        { id: 1, name: '1984' },
        { id: 2, name: 'Brave New World' },
        { id: 3, name: 'Dune' },
        { id: 4, name: 'I, Robot' },
        { id: 5, name: "The Hitchhiker's Guide to the Galaxy" },
      ]);
    });

    it('should not include score or available flag in list response', async () => {
      await createBook('Dune');

      const res = await request(getApp().getHttpServer())
        .get('/books')
        .expect(200);

      expect(res.body[0]).not.toHaveProperty('score');
      expect(res.body[0]).not.toHaveProperty('available');
    });
  });

  describe('POST /books', () => {
    it('should create a book and return 201', async () => {
      const res = await request(getApp().getHttpServer())
        .post('/books')
        .send({ name: 'Neuromancer' })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('name', 'Neuromancer');
    });

    it('should return 400 when name is missing', async () => {
      await request(getApp().getHttpServer())
        .post('/books')
        .send({})
        .expect(400);
    });

    it('should return 400 when name is empty string', async () => {
      await request(getApp().getHttpServer())
        .post('/books')
        .send({ name: '' })
        .expect(400);
    });

    it('should return 400 when name exceeds max length', async () => {
      await request(getApp().getHttpServer())
        .post('/books')
        .send({ name: 'a'.repeat(256) })
        .expect(400);
    });

    it('should return 400 when body has unknown properties', async () => {
      await request(getApp().getHttpServer())
        .post('/books')
        .send({ name: 'Valid Book', author: 'should not exist' })
        .expect(400);
    });
  });

  describe('GET /books/:bookId', () => {
    it('should return book with score -1 when not scored yet', async () => {
      const book = await createBook('Dune');

      const res = await request(getApp().getHttpServer())
        .get(`/books/${book.id}`)
        .expect(200);

      expect(res.body).toEqual({
        id: book.id,
        name: 'Dune',
        score: -1,
      });
    });

    it('should return book with average score after being rated', async () => {
      const user = await createUser('User 1');
      const book = await createBook('I, Robot');

      await borrowBook(user.id, book.id);
      await returnBook(user.id, book.id, 5);

      const res = await request(getApp().getHttpServer())
        .get(`/books/${book.id}`)
        .expect(200);

      expect(res.body).toEqual({
        id: book.id,
        name: 'I, Robot',
        score: 5,
      });
    });

    it('should return average score with decimal precision from multiple ratings', async () => {
      const user1 = await createUser('User 1');
      const user2 = await createUser('User 2');
      const user3 = await createUser('User 3');
      const book = await createBook('I, Robot');

      await borrowBook(user1.id, book.id);
      await returnBook(user1.id, book.id, 5);

      await borrowBook(user2.id, book.id);
      await returnBook(user2.id, book.id, 6);

      await borrowBook(user3.id, book.id);
      await returnBook(user3.id, book.id, 5);

      // Average = (5 + 6 + 5) / 3 = 5.333... → 5.33
      const res = await request(getApp().getHttpServer())
        .get(`/books/${book.id}`)
        .expect(200);

      expect(res.body).toEqual({
        id: book.id,
        name: 'I, Robot',
        score: 5.33,
      });
    });

    it('should return 404 when book does not exist', async () => {
      await request(getApp().getHttpServer()).get('/books/9999').expect(404);
    });

    it('should return 400 when bookId is not a number', async () => {
      await request(getApp().getHttpServer()).get('/books/abc').expect(400);
    });
  });
});
