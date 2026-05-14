require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
    console.log("🚀 Iniciando migración de servicios...");
    
    const servicesFilePath = path.join(__dirname, 'data', 'services.json');
    if (!fs.existsSync(servicesFilePath)) {
        console.error("❌ No se encontró data/services.json");
        return;
    }

    const servicesData = JSON.parse(fs.readFileSync(servicesFilePath, 'utf8'));
    const flatServices = [];

    servicesData.categories.forEach(cat => {
        cat.services.forEach(s => {
            flatServices.push({
                id: s.id,
                name: s.name,
                category: cat.name,
                duration: s.duration,
                duration_min: s.durationMin || 45,
                price: s.price,
                description: s.description || '',
                image_url: '' // No hay imágenes en el JSON original
            });
        });
    });

    console.log(`📦 Preparados ${flatServices.length} servicios para migrar.`);

    const { data, error } = await supabase.from('services').upsert(flatServices);

    if (error) {
        console.error("❌ Error en la migración:", error.message);
    } else {
        console.log("✅ Migración completada con éxito.");
    }
}

migrate();
