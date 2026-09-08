# ContaFácil

App de práctica de contabilidad para estudiantes universitarios. Permite crear
empresas de ejercicio (**comercial** o **de servicio**), registrar
transacciones por partida doble, y genera automáticamente:

- Catálogo de cuentas (editable)
- Reporte de partidas / Libro Diario
- Libro Mayor (cuentas T con saldo corrido)
- Balance de comprobación
- Estado de Resultados
- Balance General (Estado de Situación Financiera)

Cada estudiante crea su propia cuenta y solo ve sus propias empresas y
prácticas (seguridad por fila en Supabase).

## 1. Crear el proyecto en Supabase (gratis)

1. Ve a https://supabase.com y crea una cuenta (o inicia sesión).
2. Crea un **New Project**. Elige nombre, contraseña de base de datos y región.
3. Cuando el proyecto esté listo, ve a **SQL Editor → New query**.
4. Copia y pega **todo** el contenido del archivo `sql/schema.sql` de este
   proyecto y dale a **Run**. Esto crea las tablas y la seguridad por usuario.
5. Ve a **Project Settings → API**. Ahí encontrarás:
   - **Project URL** → lo usarás como `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → lo usarás como `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. (Opcional pero recomendado) En **Authentication → Providers**, revisa que
   "Email" esté habilitado. Si no quieres que los estudiantes confirmen su
   correo antes de entrar, puedes desactivar "Confirm email" en
   **Authentication → Settings** (más rápido para un curso, pero no requiere
   verificar identidad).

## 2. Probar localmente (opcional)

```bash
npm install
cp .env.local.example .env.local
# Edita .env.local con tus valores de Supabase
npm run dev
```

Abre http://localhost:3000

## 3. Subir el proyecto a GitHub

```bash
git init
git add .
git commit -m "ContaFácil: primera versión"
```

Crea un repositorio nuevo en GitHub y sigue las instrucciones para conectarlo
y hacer push (`git remote add origin ...` y `git push -u origin main`).

## 4. Desplegar en Vercel (gratis)

1. Ve a https://vercel.com y entra con tu cuenta de GitHub.
2. **Add New → Project** y elige el repositorio de ContaFácil.
3. En **Environment Variables**, agrega:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   (con los mismos valores del paso 1)
4. Dale a **Deploy**. En un par de minutos tendrás una URL pública
   (algo como `contafacil.vercel.app`) que puedes compartir con tus
   estudiantes.

Cada vez que hagas cambios y los subas a GitHub (`git push`), Vercel
actualiza el sitio automáticamente.

## Estructura del proyecto

```
app/
  login/            → inicio de sesión y registro de estudiantes
  dashboard/        → crear/elegir empresa de práctica
  empresa/[id]/
    layout.js        → guardia de sesión/dueño + navegación por pestañas
    cuentas/          → catálogo de cuentas (crear, editar, eliminar)
    transacciones/    → registrar partidas + reporte de partidas (Libro Diario)
    mayor/            → Libro Mayor (cuentas T con saldo corrido)
    balance/          → Balance de comprobación
    resultados/       → Estado de Resultados (utilidad o pérdida del periodo)
    balance-general/  → Balance General (Activo = Pasivo + Capital)
lib/
  supabaseClient.js  → conexión a Supabase
  catalogoCuentas.js → catálogo sugerido según tipo de empresa
  contabilidad.js    → cálculos compartidos de los reportes financieros
  EmpresaContext.js  → contexto de React con la empresa/cuentas actuales
sql/
  schema.sql         → tablas y seguridad para pegar en Supabase
```

Cada pantalla de reporte tiene un botón "Imprimir" (usa el diálogo de
impresión del navegador — desde ahí también se puede "Guardar como PDF").

## Próximos pasos posibles

- Modo "ejercicio guiado": el sistema plantea la transacción en texto y el
  estudiante debe registrarla, con retroalimentación de si acertó.
- Exportar el Diario/Mayor/Balance directamente a Excel.
- Panel de profesor para ver el progreso de cada estudiante.
- Cierre de periodo / periodos contables múltiples por empresa.
