const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ftsgsurrtzsozubsetyy.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0c2dzdXJydHpzb3p1YnNldHl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzNjU3NjYsImV4cCI6MjA5MTk0MTc2Nn0.bv0wpMt_1815-qIdb61UMP9y54MzDcoh_xY-gaIfBsw';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkCredits() {
  try {
    console.log('🔍 Buscando usuario: elizondo.inaki25@gmail.com');
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, credits, created_at')
      .eq('email', 'elizondo.inaki25@gmail.com')
      .single();

    if (error) {
      console.log('❌ Error al buscar usuario:', error.message);
      return;
    }

    if (!user) {
      console.log('❌ Usuario no encontrado en la base de datos');
      return;
    }

    console.log('✅ Usuario encontrado:');
    console.log('📧 Email:', user.email);
    console.log('💰 Créditos actuales:', user.credits);
    console.log('🆔 ID:', user.id);
    console.log('📅 Creado:', user.created_at);

    // Si no tiene créditos, darle el crédito inicial
    if (user.credits === 0) {
      console.log('🎁 Dando 1 crédito inicial...');
      const { error: updateError } = await supabase
        .from('users')
        .update({ credits: 1 })
        .eq('id', user.id);

      if (updateError) {
        console.log('❌ Error al actualizar créditos:', updateError.message);
      } else {
        console.log('✅ Crédito inicial otorgado exitosamente');
        const { data: updatedUser } = await supabase
          .from('users')
          .select('credits')
          .eq('id', user.id)
          .single();
        console.log('💰 Nuevos créditos:', updatedUser.credits);
      }
    } else {
      console.log('✅ El usuario ya tiene', user.credits, 'créditos');
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

checkCredits().then(() => process.exit(0));
