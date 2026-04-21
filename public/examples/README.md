# 📷 Ejemplos de Antes/Después

## 🎯 ¿Cómo usar estos ejemplos?

1. **Entra a `/generate`**
2. **Haz clic en "Show Examples"**
3. **Selecciona un ejemplo** de la galería
4. **El sistema** automáticamente cargará el prompt de ese ejemplo
5. **Puedes modificar** el prompt si quieres
6. **Genera** tu propia habitación inspirada en el ejemplo

## 🖼️ Archivos Actuales

Los siguientes archivos de ejemplo están actualmente en el sistema:

### ✅ Tu Ejemplo Personal:
- **Antes**: `Before.webp` 
- **Después**: `After.png`
- **Tipo**: Transformación completa de habitación
- **Prompt**: "Transform this environment into a living room (maintaining the salamander, and ensure the overall style is Scandinavian style, add warm lighting because the environment is very dark in its interior)"
- **Descripción**: Sala de estar oscura convertida a estilo Scandinavian brillante manteniendo la salamandra

## 🖼️ Espacio para tus ejemplos personales

Coloca tus propias imágenes de antes/después en esta carpeta siguiendo las instrucciones en `INSTRUCCIONES.md`

### Nombres sugeridos:

- `before-wall-plaster.jpg` + `after-wall-brick-modern.jpg`
- `before-flooring-tile.jpg` + `after-flooring-oak-hardwood.jpg`
- `before-lighting-dark.jpg` + `after-lighting-warm-cozy.jpg`
- `before-furniture-old.jpg` + `after-furniture-scandinavian.jpg`

## 📂 Estructura

```
public/examples/
├── before-after/
│   ├── INSTRUCCIONES.md          ← Instrucciones completas
│   ├── before-wall-*.jpg          ← Tus ejemplos antes
│   ├── after-wall-*.jpg           ← Tus ejemplos después
│   ├── before-flooring-*.jpg
│   ├── after-flooring-*.jpg
│   └── README.md                  ← Este archivo
└── INSTRUCCIONES.md              ← Copia de instrucciones
```

## 🎨 Estilos Predefinidos Disponibles

El sistema de generación incluye estos estilos profesionales:

- **Modern Minimalist** 🏠
- **Scandinavian** 🪵  
- **Asian Zen** 🎋
- **Industrial** 🏭
- **Luxury Classic** ✨
- **Bohemian** 🎨
- **Coastal/Beach** 🌊
- **Mid-Century Modern** 🛋
- **Japanese Traditional** 🏯
- **Contemporary** 🎯

**Cada estilo incluye:**
- Prompt profesional predefinido
- Descripción del estilo
- Icono representativo
- Ejemplos de resultado esperado

## 💡 Pro Tips

1. **Empezar con estilos**: Usa los estilos predefinidos para resultados consistentes
2. **Inspirarse con ejemplos**: Mira la galería de antes/después
3. **Personalizar prompts**: Modifica los prompts según tus necesidades específicas
4. **Probar diferentes resoluciones**: 512×512 (rápido) a 2048×2048 (premium)
5. **Usar prompts negativos**: Especifica qué evitar (ej. "personas, mascotas")

## 🚀 Para agregar tus ejemplos:

1. **Renombra tus archivos** siguiendo el formato sugerido
2. **Colócalos** en la carpeta `public/examples/before-after/`
3. **Actualiza el código** en `src/lib/nanoBanana.js` si usas nombres personalizados
4. **Reinicia el servidor**: `npm run dev`
5. **Verifica** que aparezcan en `/generate` → "Show Examples"

## 📧 Mantenimiento

- **Organiza por tipo**: Paredes, suelos, iluminación, completo, etc.
- **Usa nombres descriptivos**: Incluye el estilo o resultado
- **Alta calidad**: Imágenes nítidas y bien iluminadas
- **Mismo tamaño**: Para facilitar la comparación antes/después

¡Listo para inspirar a otros usuarios con tus transformaciones! 🎉
