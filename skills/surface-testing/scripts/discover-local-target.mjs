#!/usr/bin/env node
/**
 * QAUI — Project-Agnostic Local Target & Port Discovery
 * Zero-dependency Node.js utility that inspects the current workspace and active localhost ports
 * so the agent automatically finds what app URL to test in ANY stack (Node, Python, PHP, .NET, Go, etc.).
 * License: MIT
 */
import fs from 'node:fs';
import path from 'node:path';

const cwd = process.cwd();
const COMMON_PORTS = [3000, 5173, 5174, 4200, 8080, 8000, 4321, 3001, 5000, 5001, 8888, 1313];

function readJsonSafe(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function detectWorkspaceHints(dir) {
  const hints = {
    cwd: dir,
    projectType: 'unknown',
    startScripts: {},
    configuredUrls: [],
  };

  const pkg = readJsonSafe(path.join(dir, 'package.json'));
  if (pkg) {
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    if (deps.next) hints.projectType = 'nextjs';
    else if (deps.vite) hints.projectType = 'vite';
    else if (deps['@angular/core']) hints.projectType = 'angular';
    else if (deps.nuxt) hints.projectType = 'nuxt';
    else if (deps.astro) hints.projectType = 'astro';
    else if (deps['@playwright/test']) hints.projectType = 'node-with-playwright';
    else hints.projectType = 'node';

    for (const key of ['dev', 'start', 'serve', 'preview', 'test:e2e']) {
      if (pkg.scripts?.[key]) hints.startScripts[key] = pkg.scripts[key];
    }
  } else if (fs.existsSync(path.join(dir, 'composer.json'))) {
    hints.projectType = 'php-composer';
  } else if (fs.existsSync(path.join(dir, 'pyproject.toml')) || fs.existsSync(path.join(dir, 'manage.py'))) {
    hints.projectType = 'python';
  } else if (fs.readdirSync(dir).some((f) => f.endsWith('.csproj') || f.endsWith('.sln'))) {
    hints.projectType = 'dotnet';
  }

  for (const envName of ['.env', '.env.local', '.env.development']) {
    const envPath = path.join(dir, envName);
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const urlMatches = content.match(/https?:\/\/(?:localhost|127\.0\.0\.1):\d+[^\s"']*/g) || [];
      hints.configuredUrls.push(...urlMatches);
      const portMatch = content.match(/^PORT\s*=\s*(\d+)/m);
      if (portMatch) {
        const p = Number(portMatch[1]);
        if (!COMMON_PORTS.includes(p)) COMMON_PORTS.unshift(p);
      }
    }
  }

  hints.configuredUrls = [...new Set(hints.configuredUrls)];
  return hints;
}

async function probePort(port) {
  const url = `http://localhost:${port}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 650);
  try {
    const res = await fetch(url, { method: 'GET', signal: controller.signal });
    const contentType = res.headers.get('content-type') || '';
    let title = '';
    if (contentType.includes('text/html')) {
      const html = await res.text();
      const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
      if (m) title = m[1].replace(/\s+/g, ' ').trim().slice(0, 80);
    }
    return { port, url, status: res.status, contentType, title };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

const hints = detectWorkspaceHints(cwd);
const activeServers = (await Promise.all(COMMON_PORTS.map(probePort))).filter(Boolean);

console.log(
  JSON.stringify(
    {
      workspace: hints,
      activeLocalServers: activeServers,
      recommendedTargetUrl: activeServers[0]?.url || hints.configuredUrls[0] || null,
    },
    null,
    2
  )
);
