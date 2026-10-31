/* Session timeout warning: session.warn({ expiresAt, onExtend, onExpire, onSignIn }) => { close }.
   Opens a modal alert dialog with a countdown that updates every second but is announced only at
   minute marks and at 30 and 10 seconds (WCAG 2.2.1). "Stay signed in" and Escape call onExtend.
   At expiry it calls onExpire and switches to the signed-out state with a sign-in button (onSignIn).
   The announcements go to a live region inside the dialog, since the rest of the page is inert. */
let open = null; // the dialog on screen, if any

export const session = {
  warn({ expiresAt, onExtend, onExpire, onSignIn } = {}) {
    open?.close();
    const holder = document.createElement('div');
    holder.innerHTML = '<dialog class="v-dialog v-session" role="alertdialog" aria-labelledby="v-session-t" aria-describedby="v-session-d">'
      + '<div class="v-dialog-header"><h2 class="v-dialog-title" id="v-session-t">Your session is ending</h2></div>'
      + '<div class="v-dialog-body"><p id="v-session-d">You will be signed out in <b class="v-session-time"></b>.</p><p class="v-sr-only" aria-live="assertive"></p></div>'
      + '<div class="v-dialog-footer"><button class="v-btn v-btn-primary" type="button" autofocus>Stay signed in</button></div></dialog>';
    const dialog = holder.firstChild;
    // Each live message differs from the last, so setting the text is enough to announce it.
    const [title, text, time, live, button] = dialog.querySelectorAll('h2, p, b, button');
    let expired = false;
    let last;

    const tick = () => {
      const left = Math.ceil((+expiresAt - Date.now()) / 1000);
      if (left < 1) return expire();
      time.textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
      if (last && left !== last && (left % 60 === 0 || left === 30 || left === 10)) {
        live.textContent = left < 60 ? `${left} seconds left` : `${left / 60} minute${left > 60 ? 's' : ''} left`;
      }
      last = left;
    };
    function expire() {
      expired = true;
      clearInterval(timer);
      title.textContent = 'You have been signed out';
      text.textContent = 'Sign in again to carry on where you left off.';
      button.textContent = 'Sign in';
      button.focus();
      live.textContent = title.textContent;
      onExpire?.();
    }

    button.addEventListener('click', () => {
      (expired ? onSignIn : onExtend)?.();
      dialog.close();
    });
    dialog.addEventListener('cancel', () => { if (!expired) onExtend?.(); });
    dialog.addEventListener('close', () => {
      clearInterval(timer);
      dialog.remove();
    });

    document.body.append(dialog);
    const timer = setInterval(tick, 1000);
    tick();
    dialog.showModal();
    open = dialog;
    return { close: () => dialog.close() };
  },
};
