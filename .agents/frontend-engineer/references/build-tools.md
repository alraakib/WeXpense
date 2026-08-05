# Build Tools & Bundlers

## Vite

### Core Concepts
- **Fast dev server**: Native ESM
- **HMR**: Instant hot module replacement
- **Rollup-based build**: Optimized production builds
- **Plugin system**: Rich ecosystem

### Configuration
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    target: 'es2020',
    minify: 'esbuild',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
});
```

### Environment Variables
```typescript
// .env
VITE_API_URL=http://localhost:8080

// Usage
const apiUrl = import.meta.env.VITE_API_URL;
```

### Best Practices
- Use Vite for all new projects
- Use TypeScript
- Use environment variables with `VITE_` prefix
- Configure proxy in dev server
- Use manual chunks for code splitting

---

## Webpack

### Core Concepts
- **Module bundler**: Handles dependencies
- **Loaders**: Transform files
- **Plugins**: Extend functionality
- **Code splitting**: Lazy loading

### Configuration
```javascript
module.exports = {
  entry: './src/index.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
  },
  module: {
    rules: [
      { test: /\.tsx?$/, use: 'ts-loader' },
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({ template: './index.html' }),
  ],
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  },
};
```

---

## Turbopack (Next.js)

### Core Concepts
- **Incremental computation**: Fast rebuilds
- **Rust-based**: Built in Rust
- **Next.js native**: Tight integration

### Best Practices
- Use as default in Next.js
- Configure in `next.config.ts`

---

## esbuild

### Core Concepts
- **Extremely fast**: Written in Go
- **Minimal configuration**: Zero config by default
- **Supports**: JS, TS, JSX, CSS

### Usage
```bash
esbuild src/index.tsx --outfile=dist/bundle.js --bundle --minify
```

### Best Practices
- Use for simple bundling tasks
- Use Vite over esbuild for full projects
- Use esbuild for build tooling

## Best Practices
- Use Vite as default build tool
- Use Turbopack for Next.js projects
- Use proper code splitting
- Use tree shaking
- Use minification in production
- Use sourcemaps for debugging
