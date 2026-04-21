import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

export async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

export async function comparePassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

export function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export async function getUserFromToken(context) {
  // Try multiple ways to get the token
  let token = null;

  // Method 1: Direct cookie access
  if (context.req?.cookies?.token) {
    token = context.req.cookies.token;
  }
  // Method 2: Authorization header
  else if (context.req?.headers?.authorization) {
    token = context.req.headers.authorization.replace('Bearer ', '');
  }
  // Method 3: Cookie header parsing (for some environments)
  else if (context.req?.headers?.cookie) {
    const cookies = context.req.headers.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {});
    token = cookies.token;
  }

  if (!token) {
    console.log('No token found in request');
    return null;
  }

  try {
    const decoded = verifyToken(token);
    if (!decoded) {
      return null;
    }

    const { data: user } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', decoded.id)
      .single();

    return user;
  } catch (error) {
    console.error('Error getting user from token:', error);
    return null;
  }
}

export async function getUserCredits(userId) {
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('credits')
    .eq('id', userId)
    .single();

  return user?.credits || 0;
}

export async function deductCredits(userId, amount, imageId = null) {
  // Start a transaction to deduct credits and create transaction record
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('credits')
    .eq('id', userId)
    .single();

  if (!user || user.credits < amount) {
    throw new Error('Insufficient credits');
  }

  const { error: updateError } = await supabaseAdmin
    .from('users')
    .update({ credits: user.credits - amount })
    .eq('id', userId);

  if (updateError) {
    throw new Error('Failed to deduct credits');
  }

  // Create transaction record
  const { error: transactionError } = await supabaseAdmin
    .from('credit_transactions')
    .insert({
      user_id: userId,
      amount: -amount,
      type: 'usage',
      image_id: imageId,
      description: `Generated ${amount} credits worth of images`,
    });

  if (transactionError) {
    console.error('Failed to create transaction record:', transactionError);
  }

  return user.credits - amount;
}
