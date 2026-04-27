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
    console.log('🔐 Verifying JWT token...');
    console.log('🔑 Token length:', token.length);

    const decoded = jwt.verify(token, JWT_SECRET);

    console.log('✅ JWT verification successful');
    console.log('👤 Decoded user ID:', decoded.id);
    console.log('👤 Decoded email:', decoded.email);

    return decoded;
  } catch (error) {
    console.error('❌ JWT verification failed:', error.message);

    if (error.name === 'TokenExpiredError') {
      console.error('❌ Token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      console.error('❌ Invalid JWT token');
    } else {
      console.error('❌ Unknown JWT error:', error.name);
    }

    return null;
  }
}

export async function getUserFromToken(context) {
  console.log('🔍 getUserFromToken called');

  // Try multiple ways to get the token
  let token = null;
  let tokenSource = '';

  // Method 1: Direct cookie access
  if (context.req?.cookies?.token) {
    token = context.req.cookies.token;
    tokenSource = 'Direct cookie access (context.req.cookies.token)';
    console.log('🍪 Token found via direct cookie access');
  }
  // Method 2: Authorization header
  else if (context.req?.headers?.authorization) {
    token = context.req.headers.authorization.replace('Bearer ', '');
    tokenSource = 'Authorization header';
    console.log('🔑 Token found via Authorization header');
  }
  // Method 3: Cookie header parsing (for some environments)
  else if (context.req?.headers?.cookie) {
    console.log('🔍 Parsing cookie header manually...');
    const cookies = context.req.headers.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {});
    token = cookies.token;
    tokenSource = 'Manual cookie parsing';
    console.log('🍪 Token found via manual parsing:', token ? 'Yes' : 'No');
  }

  if (!token) {
    console.log('❌ No token found in any method');
    console.log('🔍 Request cookies available:', !!context.req?.cookies);
    console.log('🔍 Request headers.cookie:', context.req?.headers?.cookie ? context.req.headers.cookie.substring(0, 100) + '...' : 'Not available');
    console.log('🔍 Request headers.authorization:', context.req?.headers?.authorization ? context.req.headers.authorization.substring(0, 50) + '...' : 'Not available');
    return null;
  }

  console.log('✅ Token found via:', tokenSource);
  console.log('🔑 Token length:', token.length);
  console.log('🔑 Token first 20 chars:', token.substring(0, 20) + '...');

  try {
    console.log('🔐 Verifying token...');
    const decoded = verifyToken(token);

    if (!decoded) {
      console.log('❌ Token verification returned null');
      return null;
    }

    console.log('✅ Token verified successfully');
    console.log('👤 Decoded user ID:', decoded.id);
    console.log('👤 Decoded email:', decoded.email);

    console.log('🔍 Fetching user from database...');
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', decoded.id)
      .single();

    if (error) {
      console.error('❌ Database error fetching user:', error);
      return null;
    }

    if (!user) {
      console.log('❌ User not found in database for ID:', decoded.id);
      return null;
    }

    console.log('✅ User found:', user.email);
    return user;
  } catch (error) {
    console.error('❌ Error getting user from token:', error);
    console.error('❌ Error details:', error.message);
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
