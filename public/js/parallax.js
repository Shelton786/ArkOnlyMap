/*
 * ArkOnlyMap —— 背景视差微动（about / account / profile 页共用）
 * 鼠标移动时背景图轻微反向偏移，营造层次感；触屏设备与减少动态偏好时不启用。
 */
(function () {
  const bg = document.querySelector('.about-bg, .acct-bg, .pf-bg');
  if (!bg) return;
  if (window.matchMedia('(pointer: coarse)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  bg.style.transition = 'transform .35s ease-out';
  window.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * -14;
    const y = (e.clientY / window.innerHeight - 0.5) * -14;
    bg.style.transform = `scale(1.06) translate(${x}px, ${y}px)`;
  }, { passive: true });
})();
