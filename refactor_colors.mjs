import fs from 'fs';
import path from 'path';

const REPLACEMENTS = {
  'bg-[#050508]': 'bg-background',
  'bg-[#0D0D14]': 'bg-surface',
  'bg-[#12121A]': 'bg-elevated',
  'bg-white/5': 'bg-card',
  'bg-white/10': 'bg-surface',
  'bg-white/8': 'bg-surface',
  'text-white': 'text-foreground',
  'text-slate-400': 'text-muted',
  'text-slate-300': 'text-secondary',
  'text-slate-500': 'text-muted',
  'border-white/4': 'border-border',
  'border-white/5': 'border-border',
  'border-white/6': 'border-border',
  'border-white/8': 'border-border',
  'border-white/10': 'border-border',
  'border-white/20': 'border-border-strong',
  'hover:bg-white/5': 'hover:bg-surface',
  'hover:bg-white/10': 'hover:bg-elevated',
  'hover:border-white/20': 'hover:border-strong',
  'hover:text-white': 'hover:text-foreground',
  'text-violet-400': 'text-primary',
  'text-violet-500': 'text-primary',
  'hover:text-violet-300': 'hover:text-primary-hover',
  'hover:text-violet-400': 'hover:text-primary-hover',
  'border-violet-500/50': 'border-primary/50',
};

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (fullPath.includes('.next') || fullPath.includes('node_modules')) continue;
      processDir(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      for (const [search, replace] of Object.entries(REPLACEMENTS)) {
        const escapedSearch = search.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&');
        const regex = new RegExp(`(^|[\\s"'\\\`])(${escapedSearch})(?=[\\s"'\\\`]|$)`, 'g');
        const newContent = content.replace(regex, `$1${replace}`);
        if (newContent !== content) {
          content = newContent;
          changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Updated:', fullPath);
      }
    }
  }
}

processDir('./app');
processDir('./components');
