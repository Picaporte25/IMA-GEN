import { getUserFromToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await getUserFromToken(req);

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.query;

    // Check if image belongs to user
    const { data: image } = await supabaseAdmin
      .from('images')
      .select('id, user_id')
      .eq('id', id)
      .single();

    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    if (image.user_id !== user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Delete image
    const { error: deleteError } = await supabaseAdmin
      .from('images')
      .delete()
      .eq('id', id);

    if (deleteError) {
      throw deleteError;
    }

    res.status(200).json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
}
