import { Injectable } from '@angular/core';

import { AppConfig } from '../../../environments/environment';

interface Scripts {
  name: string;
  src: string;
}

export const ScriptStore: Scripts[] = [{ name: 'stripe', src: 'https://js.stripe.com/v2/' }];

declare let document: any;

@Injectable({
  providedIn: 'root',
})
export class DynamicScriptLoaderService {
  private scripts: any = {};

  constructor() {
    if (AppConfig.production) {
      ScriptStore.push({ name: 'stripe-key', src: 'assets/js/stripe-key.js' });
    } else {
      ScriptStore.push({ name: 'stripe-key', src: 'assets/js/stripe-test-key.js' });
    }
    ScriptStore.forEach((script: any) => {
      this.scripts[script.name] = {
        loaded: false,
        src: script.src,
      };
    });
  }

  load(...scripts: string[]) {
    const promises: any[] = [];
    for (const script of scripts) promises.push(this.loadScript(script));
    return Promise.all(promises);
  }

  loadScript(name: string) {
    return new Promise(resolve => {
      if (!this.scripts[name].loaded) {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = this.scripts[name].src;
        script.id = name;

        script.addEventListener('load', () => {
          this.scripts[name].loaded = true;
          resolve({ script: name, loaded: true, status: 'Loaded' });
        });
        script.addEventListener('error', () => resolve({ script: name, loaded: false, status: 'Loaded' }));
        document.querySelectorAll('head')[0].append(script);
      } else {
        resolve({ script: name, loaded: true, status: 'Already Loaded' });
      }
    });
  }

  removeStripeFromDOM() {
    if (document.querySelectorAll('iframe')[0]) {
      document.querySelectorAll('iframe')[0].remove();
      this.removeStripeFromDOM();
    } else {
      if (this.scripts.stripe.loaded && document.querySelector('#stripe')) {
        document.querySelector('#stripe').remove();
        this.scripts.stripe.loaded = false;
      }
      if (this.scripts['stripe-key'].loaded && document.querySelector('#stripe-key')) {
        document.querySelector('#stripe-key').remove();
        this.scripts['stripe-key'].loaded = false;
      }
    }
  }
}
