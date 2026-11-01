/* Video embed, click to load (data-v-video="<player URL>" on an a.v-video). A click replaces the link
   with the player: a native <video controls> for an .mp4, .webm or .ogg file, otherwise an <iframe>
   titled from data-title or the link text. Focus moves into the player so keyboard users can start it.
   Until that click nothing is fetched from the player's site. A modified click (new tab) is left alone. */
export function init(el) {
  const onClick = (e) => {
    if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    const src = el.dataset.vVideo;
    const title = el.dataset.title || el.textContent.trim() || 'Video';
    const file = /\.(mp4|webm|ogg)(\?|#|$)/i.test(src);
    const player = document.createElement(file ? 'video' : 'iframe');
    if (file) {
      Object.assign(player, { src, controls: true, autoplay: true, playsInline: true });
      player.setAttribute('aria-label', title);
    } else {
      Object.assign(player, { src, title, allowFullscreen: true });
      player.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      player.referrerPolicy = 'strict-origin-when-cross-origin';
    }
    const frame = document.createElement('div');
    frame.className = el.className;
    if (el.style.cssText) frame.style.cssText = el.style.cssText;
    frame.append(player);
    el.replaceWith(frame);
    player.tabIndex = 0;
    player.focus();
  };
  el.addEventListener('click', onClick);
  return { destroy: () => el.removeEventListener('click', onClick) };
}
