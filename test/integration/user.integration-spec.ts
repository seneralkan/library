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

describe('User Integration', () => {
  beforeAll(async () => {
    await setupTestApp();
  });

  beforeEach(async () => {
    await truncateAllTables();
  });

  afterAll(async () => {
    await teardownTestApp();
  });

  describe('GET /users', () => {
    it('should return empty array when no users exist', async () => {
      const res = await request(getApp().getHttpServer())
        .get('/users')
        .expect(200);

      expect(res.body).toEqual([]);
    });

    it('should return user list with id and name, ordered by id', async () => {
      await createUser('Enes Faruk Meniz');
      await createUser('Eray Aslan');
      await createUser('Sefa Eren Şahin');
      await createUser('Kadir Mutlu');

      const res = await request(getApp().getHttpServer())
        .get('/users')
        .expect(200);

      expect(res.body).toEqual([
        { id: 1, name: 'Enes Faruk Meniz' },
        { id: 2, name: 'Eray Aslan' },
        { id: 3, name: 'Sefa Eren Şahin' },
        { id: 4, name: 'Kadir Mutlu' },
      ]);
    });
  });

  describe('POST /users', () => {
    it('should create a user and return 201', async () => {
      const res = await request(getApp().getHttpServer())
        .post('/users')
        .send({ name: 'Esin Öner' })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('name', 'Esin Öner');
    });

    it('should return 400 when name is missing', async () => {
      await request(getApp().getHttpServer())
        .post('/users')
        .send({})
        .expect(400);
    });

    it('should return 400 when name is empty string', async () => {
      await request(getApp().getHttpServer())
        .post('/users')
        .send({ name: '' })
        .expect(400);
    });

    it('should return 400 when name exceeds max length', async () => {
      await request(getApp().getHttpServer())
        .post('/users')
        .send({ name: 'a'.repeat(256) })
        .expect(400);
    });

    it('should return 400 when name is not a string', async () => {
      await request(getApp().getHttpServer())
        .post('/users')
        .send({ name: 123 })
        .expect(400);
    });

    it('should return 400 when body has unknown properties', async () => {
      await request(getApp().getHttpServer())
        .post('/users')
        .send({ name: 'Valid Name', extraField: 'should not be here' })
        .expect(400);
    });
  });

  describe('GET /users/:userId', () => {
    it('should return user with no borrow history', async () => {
      const user = await createUser('Kadir Mutlu');

      const res = await request(getApp().getHttpServer())
        .get(`/users/${user.id}`)
        .expect(200);

      expect(res.body).toEqual({
        id: user.id,
        name: 'Kadir Mutlu',
        books: {
          past: [],
          present: [],
        },
      });
    });

    it('should return user with past and present borrow history', async () => {
      const user = await createUser('Enes Faruk Meniz');
      const book1 = await createBook('I, Robot');
      const book2 = await createBook("The Hitchhiker's Guide to the Galaxy");
      const book3 = await createBook('Brave New World');

      await borrowBook(user.id, book1.id);
      await returnBook(user.id, book1.id, 5);

      await borrowBook(user.id, book2.id);
      await returnBook(user.id, book2.id, 10);

      await borrowBook(user.id, book3.id);

      const res = await request(getApp().getHttpServer())
        .get(`/users/${user.id}`)
        .expect(200);

      expect(res.body).toEqual({
        id: user.id,
        name: 'Enes Faruk Meniz',
        books: {
          past: [
            { name: 'I, Robot', userScore: 5 },
            { name: "The Hitchhiker's Guide to the Galaxy", userScore: 10 },
          ],
          present: [{ name: 'Brave New World' }],
        },
      });
    });

    it('should return 404 when user does not exist', async () => {
      await request(getApp().getHttpServer()).get('/users/9999').expect(404);
    });

    it('should return 400 when userId is not a number', async () => {
      await request(getApp().getHttpServer()).get('/users/abc').expect(400);
    });
  });
});
