const clickhouse = require('../config/db');

class ClickHouseService {
  async initializeDatabase() {
    try {
      // Create database
      await clickhouse.query('CREATE DATABASE IF NOT EXISTS mean_app').toPromise();
      
      // Create users table
      await clickhouse.query(`
        CREATE TABLE IF NOT EXISTS mean_app.users (
          id UUID,
          name String,
          email String,
          age Int32,
          registration_date DateTime DEFAULT now(),
          hobbies Array(String),
          created_at DateTime DEFAULT now()
        ) ENGINE = MergeTree()
        ORDER BY (id, created_at)
      `).toPromise();

      // Create user_hobbies table for analytics
      await clickhouse.query(`
        CREATE TABLE IF NOT EXISTS mean_app.user_hobbies (
          user_id UUID,
          hobby String,
          count Int32 DEFAULT 1,
          created_at DateTime DEFAULT now()
        ) ENGINE = SummingMergeTree()
        ORDER BY (hobby, user_id)
      `).toPromise();

      // Create user_stats table
      await clickhouse.query(`
        CREATE TABLE IF NOT EXISTS mean_app.user_stats (
          date Date,
          total_users Int32,
          avg_age Float32,
          top_hobbies Array(String)
        ) ENGINE = AggregatingMergeTree()
        ORDER BY (date)
      `).toPromise();

      console.log('Database tables created successfully');
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  async executeQuery(query, params = []) {
    try {
      return await clickhouse.query(query, { params }).toPromise();
    } catch (error) {
      console.error('Query execution error:', error);
      throw error;
    }
  }

  async insertUser(userData) {
    const query = `
      INSERT INTO mean_app.users (id, name, email, age, hobbies, created_at)
      VALUES (?, ?, ?, ?, ?, now())
    `;
    
    await this.executeQuery(query, [
      userData.id,
      userData.name,
      userData.email,
      userData.age,
      userData.hobbies
    ]);

    // Insert hobbies for analytics
    for (const hobby of userData.hobbies) {
      await this.executeQuery(`
        INSERT INTO mean_app.user_hobbies (user_id, hobby, created_at)
        VALUES (?, ?, now())
      `, [userData.id, hobby]);
    }
  }

  async getAllUsers() {
    return await this.executeQuery(`
      SELECT id, name, email, age, hobbies, registration_date, created_at
      FROM mean_app.users
      ORDER BY created_at DESC
    `);
  }

  async getUserById(id) {
    const result = await this.executeQuery(`
      SELECT id, name, email, age, hobbies, registration_date, created_at
      FROM mean_app.users
      WHERE id = ?
    `, [id]);
    
    return result[0] || null;
  }

  async updateUser(id, userData) {
    await this.executeQuery(`
      ALTER TABLE mean_app.users
      UPDATE
        name = ?,
        email = ?,
        age = ?,
        hobbies = ?
      WHERE id = ?
    `, [userData.name, userData.email, userData.age, userData.hobbies, id]);
  }

  async deleteUser(id) {
    await this.executeQuery(`
      ALTER TABLE mean_app.users
      DELETE WHERE id = ?
    `, [id]);
  }

  async getHobbyStats() {
    return await this.executeQuery(`
      SELECT 
        hobby,
        count(*) as user_count,
        groupArrayDistinct(user_id) as user_ids
      FROM mean_app.user_hobbies
      GROUP BY hobby
      ORDER BY user_count DESC
    `);
  }

  async getAgeDistribution() {
    return await this.executeQuery(`
      SELECT 
        floor(age/10)*10 as age_group,
        count(*) as count
      FROM mean_app.users
      GROUP BY age_group
      ORDER BY age_group
    `);
  }

  async getRegistrationTrend() {
    return await this.executeQuery(`
      SELECT 
        toDate(created_at) as date,
        count(*) as registrations
      FROM mean_app.users
      GROUP BY date
      ORDER BY date
    `);
  }
}

module.exports = new ClickHouseService();