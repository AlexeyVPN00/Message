import { AppDataSource } from '../config/database';
import { User } from '../models/User.entity';
import { hashPassword } from '../utils/bcrypt';

async function seed() {
  try {
    console.log('🌱 Запуск seed скрипта...');

    await AppDataSource.initialize();
    console.log('✅ База данных подключена');

    const userRepository = AppDataSource.getRepository(User);

    // Проверяем, есть ли уже пользователи
    const existingUsers = await userRepository.count();

    if (existingUsers > 0) {
      console.log(`ℹ️  В базе уже ${existingUsers} пользователей`);
      console.log('Пропускаем создание тестовых пользователей');
      await AppDataSource.destroy();
      return;
    }

    console.log('👤 Создание тестовых пользователей...');

    // Создаем тестовых пользователей
    const testUsers = [
      {
        email: 'admin@test.com',
        username: 'admin',
        password: 'admin123',
        firstName: 'Админ',
        lastName: 'Админов',
        bio: 'Администратор системы',
      },
      {
        email: 'user1@test.com',
        username: 'user1',
        password: 'user123',
        firstName: 'Иван',
        lastName: 'Иванов',
        bio: 'Просто пользователь',
      },
      {
        email: 'user2@test.com',
        username: 'user2',
        password: 'user123',
        firstName: 'Мария',
        lastName: 'Петрова',
        bio: 'Еще один пользователь',
      },
      {
        email: 'test@test.com',
        username: 'testuser',
        password: 'test123',
        firstName: 'Тест',
        lastName: 'Тестовый',
        bio: 'Тестовый аккаунт',
      },
    ];

    for (const userData of testUsers) {
      const passwordHash = await hashPassword(userData.password);

      const user = userRepository.create({
        email: userData.email,
        username: userData.username,
        passwordHash,
        firstName: userData.firstName,
        lastName: userData.lastName,
        bio: userData.bio,
        isOnline: false,
      });

      await userRepository.save(user);
      console.log(`  ✓ Создан пользователь: ${userData.username} (${userData.email}) - пароль: ${userData.password}`);
    }

    console.log('\n✅ Seed завершен успешно!');
    console.log('\n📝 Тестовые учетные данные:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    testUsers.forEach(user => {
      console.log(`Email: ${user.email} | Пароль: ${user.password}`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await AppDataSource.destroy();
  } catch (error) {
    console.error('❌ Ошибка seed:', error);
    process.exit(1);
  }
}

seed();
