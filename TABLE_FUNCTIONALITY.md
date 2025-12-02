# Funcionalidad del Nodo Table

## Descripción General

El nodo **Table** ahora incluye funcionalidad completa para gestionar filas y columnas, proporcionando una experiencia similar a una tabla de verdad dentro del diagrama de flujo de datos.

## Características

### 1. **Creación por Defecto**
Cuando arrastras un nodo Table al canvas, se crea automáticamente con:
- **1 columna** denominada "Column"
- **1 fila** denominada "row1"

### 2. **Doble Click para Editar**
Al hacer **doble click** sobre el nodo Table, se abre un modal especializado que permite:

#### Gestión de Columnas
- ✅ **Agregar nuevas columnas** - Botón "Add Column"
- ✅ **Renombrar columnas** - Doble click sobre el nombre de la columna para editar
- ✅ **Eliminar columnas** - Botón de papelera junto a cada columna

#### Gestión de Filas
- ✅ **Agregar nuevas filas** - Botón "Add Row"
- ✅ **Renombrar filas** - Doble click sobre el nombre de la fila para editar
- ✅ **Eliminar filas** - Botón de papelera junto a cada fila

### 3. **Visualización en el Canvas**
El nodo Table muestra:
- **Encabezados** con los nombres de las columnas
- **Filas** con celdas vacías (representadas con "—")
- Interfaz interactiva y responsive
- Validación: La tabla debe tener al menos 1 columna y 1 fila

## Estructura de Datos

Los datos de la tabla se almacenan en el campo `tableData` del nodo:

```typescript
interface TableData {
  columns: TableColumn[];
  rows: TableRow[];
}

interface TableColumn {
  id: string;      // UUID único
  name: string;    // Nombre de la columna
}

interface TableRow {
  id: string;      // UUID único
  name: string;    // Nombre de la fila
}
```

## Flujo de Uso

1. **Crear tabla**: Arrastra un nodo Table desde la barra lateral
2. **Configurar**: Haz doble click en el nodo para abrir el editor
3. **Editar columnas**: 
   - Click en "Add Column" para agregar
   - Doble click en el nombre para cambiar
   - Papelera para eliminar
4. **Editar filas**: 
   - Click en "Add Row" para agregar
   - Doble click en el nombre para cambiar
   - Papelera para eliminar
5. **Guardar**: Click en "Save Table" para confirmar cambios

## Persistencia

Todos los cambios en la tabla se guardan automáticamente en **IndexedDB** después de 2 segundos, junto con el resto del proyecto.

## Validaciones

- ✅ La tabla siempre debe tener **al menos 1 columna**
- ✅ La tabla siempre debe tener **al menos 1 fila**
- ✅ Los nombres pueden estar vacíos (aunque no es recomendado)
- ⚠️ Si intentas guardar sin columnas o filas, verás un mensaje de error

## Archivos Modificados

- `types.ts` - Agregadas interfaces `TableData`, `TableColumn`, `TableRow`
- `components/CustomNodes.tsx` - TableNode actualizado para mostrar tabla
- `components/TableEditModal.tsx` - Nuevo componente modal para editar tablas
- `App.tsx` - Lógica para manejar creación, edición y guardado de tablas

## Próximas Mejoras Sugeridas

- Agregar celdas editables (actualmente solo se muestran placeholders)
- Permitir arrastrar/reordenar columnas y filas
- Exportar tabla a CSV o JSON
- Aplicar estilos personalizados a columnas/filas
