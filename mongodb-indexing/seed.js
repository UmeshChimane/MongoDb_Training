const { faker } = require('@faker-js/faker');
const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://cluster0.wrvui4f.mongodb.net/';
const username = 'umesh-chimane';

async function main() {
    const password = process.env.MONGO_PASSWORD;

    if (!password) {
        throw new Error('MONGO_PASSWORD environment variable is required');
    }

    const client = new MongoClient(uri, {
        auth: {
            username,
            password
        }
    });

    try {
        await client.connect();

        const db = client.db('indexing_assignment');
        const collection = db.collection('notes');

        // Remove old data if it exists
        await collection.deleteMany({});

        const notes = [];

        for (let i = 0; i < 10000; i++) {
            const hasFoo = i % 10 === 0;

            notes.push({
                title: hasFoo
                    ? `foo ${faker.lorem.words(3)}`
                    : faker.lorem.sentence({ min: 3, max: 8 }),
                content: faker.lorem.paragraph(),
                owner: `user${faker.number.int({ min: 1, max: 20 })}`,
                createdAt: faker.date.between({
                    from: '2025-01-01T00:00:00.000Z',
                    to: '2026-09-30T23:59:59.999Z'
                })
            });
        }

        // Insert in batches
        for (let i = 0; i < notes.length; i += 500) {
            await collection.insertMany(notes.slice(i, i + 500));
        }

        console.log('Inserted 10,000 notes.');

        const count = await collection.countDocuments();
        console.log(`Total notes: ${count}`);
    } finally {
        await client.close();
    }
}

main().catch(console.error);