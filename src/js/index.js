/* Vectra v2 JS entry, everything (dist/vectra.js): the core and v2.0 modules from index.core.js plus the
   v2.1 modules registered below. A page that only uses v2.0 components can load dist/vectra.core.js. */
import { register } from './core.js';

import { init as mega } from './components/mega.js';
import { init as toc } from './components/toc.js';
import { init as context } from './components/context.js';
import { init as hovercard } from './components/hovercard.js';
import { init as command } from './components/command.js';
import { init as lightbox } from './components/lightbox.js';
import { init as notifications } from './components/notifications.js';
import { init as readmore } from './components/readmore.js';
import { init as carousel } from './components/carousel.js';
import { init as marquee } from './components/marquee.js';
import { init as video } from './components/video.js';
import { init as tagInput } from './components/tag-input.js';
import { init as combobox } from './components/combobox.js';
import { init as wizard } from './components/wizard.js';
import { init as scrollProgress } from './components/scroll-progress.js';

export * from './index.core.js';

register('mega', mega);
register('toc', toc);
register('context', context);
register('hovercard', hovercard);
register('command', command);
register('lightbox', lightbox);
register('notifications', notifications);
register('readmore', readmore);
register('carousel', carousel);
register('marquee', marquee);
register('video', video);
register('tag-input', tagInput);
register('combobox', combobox);
register('wizard', wizard);
register('scroll-progress', scrollProgress);
