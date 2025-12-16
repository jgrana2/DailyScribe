<script lang="ts">
  import '../app.css';
  import { page } from '$app/stores';
  import { fade } from 'svelte/transition';

  let { children } = $props();

  const navItems = [
    { href: '/', label: 'Daily Notes', icon: 'edit' },
    { href: '/history', label: 'History', icon: 'calendar' }
  ];
</script>

<div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
  <!-- Header -->
  <header class="sticky top-0 z-40 border-b border-border/50 bg-white/80 backdrop-blur-lg">
    <div class="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
      <div class="flex h-16 items-center justify-between">
        <a href="/" class="flex items-center gap-2 group">
          <div class="flex h-9 w-9 items-center justify-center rounded-xl text-primary-foreground">
            <img src="/logo.png" alt="Daily Scribe Logo" class="h-9" />
          </div>
          <span class="text-lg font-semibold text-foreground hidden sm:block">Daily Scribe</span>
        </a>

        <nav class="flex items-center gap-1">
          {#each navItems as item}
            {@const isActive = $page.url.pathname === item.href}
            <a
              href={item.href}
              class="relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200
                {isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}"
            >
              {#if item.icon === 'edit'}
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              {:else}
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              {/if}
              <span class="hidden sm:inline">{item.label}</span>
              {#if isActive}
                <span
                  class="absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-primary"
                  in:fade={{ duration: 150 }}
                ></span>
              {/if}
            </a>
          {/each}
        </nav>
      </div>
    </div>
  </header>

  <!-- Main Content -->
  <main class="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
    {@render children()}
  </main>

  <!-- Footer -->
  <footer class="border-t border-border/50 bg-white/50 mt-auto">
    <div class="mx-auto max-w-5xl px-4 py-4 sm:px-6 lg:px-8">
      <p class="text-center text-xs text-muted-foreground">
        Daily Scribe — Powered by AI
      </p>
    </div>
  </footer>
</div>
