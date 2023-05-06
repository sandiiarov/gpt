import { type ChatCompletionRequestMessageRoleEnum } from 'openai';
import { Pool } from 'pg';

export const pool = new Pool();

export async function createUser({
  id,
  username,
  firstName,
  lastName,
  createdAt,
}: {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  createdAt: string;
}) {
  console.log({ id, username, firstName, lastName, createdAt });

  const result = await pool.query(`
    INSERT INTO users (id, username, first_name, last_name, created_at)
    SELECT '${id}', '${username}', '${firstName}', '${lastName}', '${createdAt}'
    WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = '${id}');
  `);

  return result.rows[0];
}

export async function createMessage({
  id,
  userId,
  role,
  content,
  createdAt,
}: {
  id: string;
  userId: string;
  role: ChatCompletionRequestMessageRoleEnum;
  content: string;
  createdAt: string;
}) {
  const result = await pool.query(`
    INSERT INTO messages (id, user_id, role, content, created_at)
    VALUES('${id}', '${userId}', '${role}', '${content}', '${createdAt}');
  `);

  return result.rows[0];
}

export async function getMessagesByUserId({ id }: { id: string }) {
  const result = await pool.query(`
    SELECT role, content
    FROM messages
    WHERE user_id = '${id}'
    ORDER BY role;
  `);

  return result.rows;
}

export async function deleteMessagesByUserId({ id }: { id: string }) {
  const result = await pool.query(`
    DELETE FROM messages
    WHERE user_id = '${id}';
  `);

  return result.rows;
}
