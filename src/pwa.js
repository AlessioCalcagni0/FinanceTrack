if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js'); // root!
      console.log('SW registrato, scope:', reg.scope);
    } catch (err) {
      console.error('SW registration failed:', err);
    }
  });
}