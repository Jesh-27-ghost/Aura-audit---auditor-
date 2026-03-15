const bcrypt = require('bcryptjs');
const { store } = require('./store');

async function seedDemo() {
    const password = 'password123';
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const demoUsers = [
        {
            name: 'TechCorp HR',
            email: 'hr@techcorp.com',
            password: hashedPassword,
            role: 'employer',
            skills: [],
            bio: 'Demo Employer Account'
        },
        {
            name: 'Aarav Sharma',
            email: 'aarav@example.com',
            password: hashedPassword,
            role: 'candidate',
            skills: [],
            bio: 'Demo Candidate Account'
        }
    ];

    const users = store.find('users');
    for (const user of demoUsers) {
        const existing = users.find((u) => u.email === user.email);
        if (!existing) {
            store.insert('users', user);
            console.log(`Created demo user: ${user.email}`);
        } else {
            // Update password just in case
            store.updateById('users', existing._id, { password: hashedPassword });
            console.log(`Updated demo user password: ${user.email}`);
        }
    }
    console.log('Demo accounts seeded successfully.');
}

seedDemo().catch(console.error);
