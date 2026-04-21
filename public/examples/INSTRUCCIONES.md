# 📷 Instrucciones para agregar tus ejemplos de Antes/Después

## 🎯 ¿Qué es esta sección?

Aquí puedes agregar tus propias imágenes de transformaciones de propiedades para inspirar a otros usuarios y mostrar las capacidades del sistema.

## 📁 Estructura de archivos

Los archivos deben colocarse en la carpeta: `public/examples/before-after/`

### Nomenclatura sugerida:

Usa este formato para mantener todo organizado:
`[tipo]-[estilo]-[descripcion].jpg`

### Ejemplos de nombres:

1. **Transformaciones de paredes:**
   - `before-wall-plaster-white.jpg` → `after-wall-brick-modern.jpg`
   - `before-wall-beige-plain.jpg` → `after-wall-textured-terracotta.jpg`

2. **Transformaciones de suelos:**
   - `before-flooring-basic-tile.jpg` → `after-flooring-oak-hardwood.jpg`
   - `before-flooring-gray-concrete.jpg` → `after-flooring-marble-premium.jpg`

3. **Transformaciones de iluminación:**
   - `before-lighting-dark-room.jpg` → `after-lighting-warm-cozy.jpg`
   - `before-lighting-cold-fluorescent.jpg` → `after-lighting-natural-sunlight.jpg`

4. **Transformaciones completas:**
   - `before-complete-empty-room.jpg` → `after-complete-modern-furnished.jpg`
   - `before-complete-basic-layout.jpg` → `after-complete-scandinavian-style.jpg`

5. **Transformaciones de muebles:**
   - `before-furniture-old-outdated.jpg` → `after-furniture-modern-scandinavian.jpg`
   - `before-furniture-generic-basic.jpg` → `after-furniture-luxury-elegant.jpg`

6. **Transformaciones de color:**
   - `before-color-neutral-beige.jpg` → `after-color-vibrant-blue-teal.jpg`
   - `before-color-cool-gray.jpg` → `after-color-warm-orange-brown.jpg`

## 🔧 Cómo agregar tus imágenes:

### Opción 1: Manual (Recomendado)

1. **Renombra tus archivos** usando la nomenclatura sugerida
2. **Coloca los archivos** en la carpeta `public/examples/before-after/`
3. **Asegúrate** de que:
   - Formato: JPG o PNG
   - Tamaño: Preferiblemente 1024×1024 o mayor
   - Calidad: Alta resolución para mejor apariencia

### Opción 2: Actualizar el código

Si usas nombres personalizados, actualiza el archivo `src/lib/nanoBanana.js`:

```javascript
export const BEFORE_AFTER_EXAMPLES = [
  {
    id: 'tu-propio-1',
    title: 'Tu Título Descriptivo',
    description: 'Breve descripción de la transformación',
    beforeImage: '/examples/before-after/tu-before.jpg',
    afterImage: '/examples/before-after/tu-after.jpg',
    style: 'Wall Material/Flooring/etc',
    prompt: 'Descripción del resultado'
  },
  // ... más ejemplos
];
```

## 📏 Tamaño y Calidad Recomendados

- **Resolución**: 1024×1024 o 2048×2048
- **Formato**: JPG (compresión 85%) o PNG (sin compresión)
- **Calidad**: Alta, sin artefactos
- **Aspecto**: Horizontal (4:3 o 16:9) o cuadrado (1:1)

## 🎨 Estilos Disponibles en el Sistema

El sistema de generación incluye estos estilos predefinidos:

1. **Modern Minimalist** 🏠 - Líneas limpias, colores neutros
2. **Scandinavian** 🪵 - Acogedor, madera cálida
3. **Asian Zen** 🎋 - Equilibrio natural, elementos zen
4. **Industrial** 🏭 - Materiales crudos, metálicos
5. **Luxury Classic** ✨ - Elegante, materiales ricos
6. **Bohemian** 🎨 - Ecléctico, vibrante
7. **Coastal/Beach** 🌊 - Ligero, colores oceánicos
8. **Mid-Century Modern** 🛋 - Retro, formas orgánicas
9. **Japanese Traditional** 🏯 - Minimal, materiales naturales
10. **Contemporary** 🎯 - Diseño atrevido, mixto

## ✅ Verificación

Después de agregar tus imágenes:

## ✅ EJEMPLO ACTIVAMENTE IMPLEMENTADO

¡Ya has agregado tu primer ejemplo al sistema!

**Detalles del ejemplo:**
- **Imágenes**: `Before.webp` + `After.png`
- **Tipo**: Transformación completa de sala de estar
- **Prompt**: "Transform this environment into a living room (maintaining the salamander, and ensure the overall style is Scandinavian style, add warm lighting because the environment is very dark in its interior)"
- **Resultado**: Sala oscura convertida a estilo Scandinavian brillante manteniendo la salamandra

Este ejemplo aparece en la **"💡 Inspiration Gallery"** en la página `/generate`.

## 🔄 Para agregar más ejemplos:

1. **Reinicia el servidor**: `npm run dev`
2. **Entra a `/generate``
3. **Verifica** que tus ejemplos aparezcan en "💡 Inspiration Gallery"
4. **Prueba** seleccionando tus ejemplos para generar similares

1. **Reinicia el servidor**: `npm run dev`
2. **Entra a `/generate`**
3. **Verifica** que tus ejemplos aparezcan en "💡 Inspiration Gallery"
4. **Prueba** seleccionando tus ejemplos para generar similares

## 💡 Tips para Mejores Resultados

- **Mismo tamaño** para antes/después
- **Buena iluminación** en ambas imágenes
- **Ángulo consistente** de cámara
- **Sin elementos extraños** (personas, mascotas)
- **Alta calidad** de imagen

## 🚀 ¡Listo!

Tu sistema ahora tiene ejemplos personalizados para inspirar a otros usuarios en su proceso de generación y transformación de propiedades.
